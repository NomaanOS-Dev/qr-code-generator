'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { validateDestinationUrl } from '@/lib/validate-url'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'

const VALID_ERROR_LEVELS = ['L', 'M', 'Q', 'H'] as const
const VALID_STYLES = [
  'default',
  'bold',
  'minimal',
  'rounded',
  'dots',
  'branded',
] as const

export async function createQrCode(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const name = (formData.get('name') as string)?.trim()
  const destinationUrl = (formData.get('destination_url') as string)?.trim()
  const foregroundColor =
    (formData.get('foreground_color') as string) || '#000000'
  const backgroundColor =
    (formData.get('background_color') as string) || '#FFFFFF'
  const logoPath = (formData.get('logo_path') as string) || null
  const marginRaw = formData.get('margin')
  const margin = marginRaw !== null ? Number(marginRaw) : 4
  const errorCorrection = (formData.get('error_correction') as string) || 'H'
  const logoSizeRaw = formData.get('logo_size_percent')
  const logoSizePercent = logoSizeRaw !== null ? Number(logoSizeRaw) : 20
  const style = (formData.get('style') as string) || 'default'

  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters' }
  }

  if (!destinationUrl) {
    return { error: 'Destination URL is required' }
  }

  const validation = validateDestinationUrl(destinationUrl)
  if (!validation.valid) {
    return { error: validation.reason }
  }

  if (
    !VALID_ERROR_LEVELS.includes(
      errorCorrection as (typeof VALID_ERROR_LEVELS)[number]
    )
  ) {
    return { error: 'Invalid error correction level' }
  }

  if (!VALID_STYLES.includes(style as (typeof VALID_STYLES)[number])) {
    return { error: 'Invalid style' }
  }

  if (!Number.isFinite(margin) || margin < 0 || margin > 10) {
    return { error: 'Margin must be between 0 and 10' }
  }

  if (
    !Number.isFinite(logoSizePercent) ||
    logoSizePercent < 10 ||
    logoSizePercent > 30
  ) {
    return { error: 'Logo size must be between 10% and 30%' }
  }

  // 🔒 Plan guard
  const { getPlanContext } = await import('@/lib/plan-guard')
  const ctx = await getPlanContext()
  if (!ctx) return { error: 'Not authenticated' }

  if (!ctx.canCreateQr) {
    return {
      error: `You've reached the ${ctx.plan} plan limit (${ctx.limits.maxQrCodes} QR codes). Please upgrade to create more.`,
    }
  }

  // 🔒 Feature gate: logo requires Starter+
  if (logoPath && !ctx.limits.logoUpload) {
    return {
      error: 'Logo upload requires the Starter plan or higher.',
    }
  }

  // 🔒 Workspace context
  const { getCurrentWorkspace, canInWorkspace } = await import(
    '@/lib/workspaces'
  )
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return { error: 'No workspace found. Please create one first.' }
  }

  const canCreate = await canInWorkspace(workspace.id, 'create_qr')
  if (!canCreate) {
    return {
      error:
        'You do not have permission to create QR codes in this workspace',
    }
  }

  const slug = nanoid(8)

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: user.id,
      workspace_id: workspace.id,
      slug,
      name,
      destination_url: destinationUrl,
      foreground_color: foregroundColor,
      background_color: backgroundColor,
      logo_path: logoPath,
      margin,
      error_correction: errorCorrection,
      logo_size_percent: logoSizePercent,
      style,
    })
    .select('id, slug')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/workspaces/${workspace.id}`)
  return { success: true, id: data.id, slug: data.slug }
}

// ============================================================
// Update: Only name + destination_url are editable
// ============================================================
export async function updateQrCode(
  id: string,
  updates: { name?: string; destination_url?: string }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  if (updates.destination_url) {
    const validation = validateDestinationUrl(updates.destination_url)
    if (!validation.valid) return { error: validation.reason }
  }

  if (updates.name !== undefined && updates.name.trim().length < 2) {
    return { error: 'Name must be at least 2 characters' }
  }

  // ✅ Explicitly typed — matches Supabase's Update type exactly
  const payload: {
    name?: string
    destination_url?: string
  } = {}

  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.destination_url !== undefined) {
    payload.destination_url = updates.destination_url.trim()
  }

  const { error } = await supabase
    .from('qr_codes')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleQrCodeActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('qr_codes')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteQrCode(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: qr } = await supabase
    .from('qr_codes')
    .select('logo_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (qr?.logo_path) {
    const path = qr.logo_path.split('/qr-logos/')[1]
    if (path) {
      await supabase.storage.from('qr-logos').remove([path])
    }
  }

  const { error } = await supabase
    .from('qr_codes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function bulkToggleQrCodes(ids: string[], isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (!ids.length) return { error: 'No QR codes selected' }

  const { error } = await supabase
    .from('qr_codes')
    .update({ is_active: isActive })
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true, count: ids.length }
}

export async function bulkDeleteQrCodes(ids: string[]) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (!ids.length) return { error: 'No QR codes selected' }

  const { data: qrs } = await supabase
    .from('qr_codes')
    .select('logo_path')
    .in('id', ids)
    .eq('user_id', user.id)

  const paths = (qrs ?? [])
    .map((q) => q.logo_path?.split('/qr-logos/')[1])
    .filter((p): p is string => Boolean(p))

  if (paths.length) {
    await supabase.storage.from('qr-logos').remove(paths)
  }

  const { error } = await supabase
    .from('qr_codes')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true, count: ids.length }
}

export async function getQrCodesForDownload(ids: string[]) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (!ids.length) return { error: 'No QR codes selected' }

  const { data, error } = await supabase
    .from('qr_codes')
    .select(
      'id, name, slug, foreground_color, background_color, logo_path, margin, error_correction, logo_size_percent'
    )
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  return { success: true, data: data ?? [] }
}