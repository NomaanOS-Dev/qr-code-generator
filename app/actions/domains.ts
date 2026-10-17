'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getPlanContext } from '@/lib/plan-guard'
import {
  getCurrentWorkspace,
  getUserRole,
} from '@/lib/workspaces'
import { verifyDomainCname } from '@/lib/dns-verify'
import {
  isValidDomain,
  normalizeDomain,
} from '@/types/domains'
import { nanoid } from 'nanoid'

// ============================================================
// Add a domain
// ============================================================
export async function addDomain(inputDomain: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const workspace = await getCurrentWorkspace()
  if (!workspace) return { error: 'No workspace found' }

  const myRole = await getUserRole(workspace.id)
  if (!myRole || !['owner', 'admin'].includes(myRole)) {
    return { error: 'Only owners and admins can add domains' }
  }

  // Plan gate: Pro or Agency
  const ctx = await getPlanContext()
  if (!ctx) return { error: 'Not authenticated' }
  if (!ctx.limits.customDomains) {
    return {
      error: 'Custom domains require the Pro plan or higher. Please upgrade.',
    }
  }

  // Validate domain
  const normalized = normalizeDomain(inputDomain)
  const validation = isValidDomain(normalized)
  if (!validation.valid) {
    return { error: validation.reason || 'Invalid domain' }
  }

  // Check if domain already exists (global uniqueness)
  const { data: existing } = await supabase
    .from('custom_domains')
    .select('id, workspace_id')
    .eq('domain', normalized)
    .maybeSingle()

  if (existing) {
    return {
      error:
        existing.workspace_id === workspace.id
          ? 'This domain is already added to your workspace'
          : 'This domain is already registered by another user',
    }
  }

  // Generate verification token
  const verificationToken = nanoid(32)

  const { data, error } = await supabase
    .from('custom_domains')
    .insert({
      workspace_id: workspace.id,
      domain: normalized,
      verification_token: verificationToken,
      status: 'pending',
      created_by: user.id,
    })
    .select('id, domain')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/domains')
  return { success: true, id: data.id, domain: data.domain }
}

// ============================================================
// Verify a domain (DNS lookup)
// ============================================================
export async function verifyDomain(domainId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const workspace = await getCurrentWorkspace()
  if (!workspace) return { error: 'No workspace found' }

  const { data: domainRow } = await supabase
    .from('custom_domains')
    .select('id, domain, workspace_id, status')
    .eq('id', domainId)
    .eq('workspace_id', workspace.id)
    .maybeSingle()

  if (!domainRow) return { error: 'Domain not found' }

  // Mark as verifying
  await supabase
    .from('custom_domains')
    .update({ status: 'verifying', verification_error: null })
    .eq('id', domainId)

  // Run DNS check
  const result = await verifyDomainCname(domainRow.domain)

  if (result.verified) {
    await supabase
      .from('custom_domains')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verification_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainId)

    revalidatePath('/dashboard/domains')
    return { success: true, verified: true }
  }

  await supabase
    .from('custom_domains')
    .update({
      status: 'failed',
      verification_error: result.error ?? 'DNS verification failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', domainId)

  revalidatePath('/dashboard/domains')
  return {
    success: false,
    verified: false,
    error: result.error,
    records: result.records,
    expectedTarget: result.expectedTarget,
  }
}

// ============================================================
// Delete a domain
// ============================================================
export async function deleteDomain(domainId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const workspace = await getCurrentWorkspace()
  if (!workspace) return { error: 'No workspace found' }

  const myRole = await getUserRole(workspace.id)
  if (!myRole || !['owner', 'admin'].includes(myRole)) {
    return { error: 'Only owners and admins can delete domains' }
  }

  // Unlink from any QR codes
  await supabase
    .from('qr_codes')
    .update({ custom_domain_id: null })
    .eq('custom_domain_id', domainId)

  const { error } = await supabase
    .from('custom_domains')
    .delete()
    .eq('id', domainId)
    .eq('workspace_id', workspace.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/domains')
  return { success: true }
}

// ============================================================
// Assign a custom domain to a QR code
// ============================================================
export async function assignDomainToQr(
  qrCodeId: string,
  domainId: string | null
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const workspace = await getCurrentWorkspace()
  if (!workspace) return { error: 'No workspace found' }

  // Verify QR belongs to workspace
  const { data: qr } = await supabase
    .from('qr_codes')
    .select('id, workspace_id')
    .eq('id', qrCodeId)
    .eq('workspace_id', workspace.id)
    .maybeSingle()

  if (!qr) return { error: 'QR code not found' }

  // If domainId is provided, verify it's valid and belongs to workspace
  if (domainId) {
    const { data: domainRow } = await supabase
      .from('custom_domains')
      .select('id, status, workspace_id')
      .eq('id', domainId)
      .eq('workspace_id', workspace.id)
      .maybeSingle()

    if (!domainRow) return { error: 'Domain not found' }
    if (domainRow.status !== 'verified') {
      return { error: 'Domain must be verified before use' }
    }
  }

  const { error } = await supabase
    .from('qr_codes')
    .update({ custom_domain_id: domainId })
    .eq('id', qrCodeId)
    .eq('workspace_id', workspace.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/${qrCodeId}`)
  revalidatePath('/dashboard')
  return { success: true }
}