import { notFound, redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspace } from '@/lib/workspaces'
import { QrDetailView } from '@/components/qr/qr-detail-view'

export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'QR Code Details — ScanFlow',
}

export default async function QrDetailPage({ params }: PageProps) {
  await connection()

  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const workspace = await getCurrentWorkspace()
  if (!workspace) redirect('/dashboard')

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select(
      `
      id,
      name,
      slug,
      destination_url,
      foreground_color,
      background_color,
      logo_path,
      is_active,
      created_at,
      margin,
      error_correction,
      logo_size_percent,
      style,
      custom_domain_id,
      qr_scans (count)
    `
    )
    .eq('id', id)
    .eq('workspace_id', workspace.id)
    .single()

  if (error || !qrCode) {
    notFound()
  }

  // Fetch verified domains for the picker
  const { data: domains } = await supabase
    .from('custom_domains')
    .select('id, domain, status')
    .eq('workspace_id', workspace.id)
    .eq('status', 'verified')
    .order('domain')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const scanCount = Array.isArray(qrCode.qr_scans)
    ? qrCode.qr_scans[0]?.count ?? 0
    : 0

  // Determine default domain shown in the UI (currently active domain, or
  // the app domain if none assigned)
  const activeDomainRow = domains?.find((d) => d.id === qrCode.custom_domain_id)
  const baseDomain = activeDomainRow?.domain ?? null

  return (
    <QrDetailView
      qrCode={{
        id: qrCode.id,
        name: qrCode.name,
        slug: qrCode.slug,
        destination_url: qrCode.destination_url,
        foreground_color: qrCode.foreground_color,
        background_color: qrCode.background_color,
        logo_path: qrCode.logo_path,
        is_active: qrCode.is_active,
        created_at: qrCode.created_at ?? new Date().toISOString(),
        scanCount,
        margin: qrCode.margin,
        error_correction: qrCode.error_correction,
        logo_size_percent: qrCode.logo_size_percent,
        style: qrCode.style,
        custom_domain_id: qrCode.custom_domain_id,
      }}
      appUrl={appUrl}
      domains={domains ?? []}
      baseDomain={baseDomain}
    />
  )
}