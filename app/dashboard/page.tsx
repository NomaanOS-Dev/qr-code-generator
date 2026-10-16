import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QrDashboardClient } from '@/components/dashboard/qr-dashboard-client'

export const metadata = {
  title: 'My QR Codes — ScanFlow',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select(`
      id,
      name,
      slug,
      destination_url,
      foreground_color,
      background_color,
      logo_path,
      is_active,
      created_at,
      qr_scans (count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const mapped = (qrCodes ?? []).map((qr) => ({
    id: qr.id,
    name: qr.name,
    slug: qr.slug,
    destination_url: qr.destination_url,
    foreground_color: qr.foreground_color ?? '#000000',
    background_color: qr.background_color ?? '#FFFFFF',
    logo_path: qr.logo_path,
    is_active: qr.is_active ?? true,
    created_at: qr.created_at ?? new Date().toISOString(),
    scanCount: Array.isArray(qr.qr_scans)
      ? qr.qr_scans[0]?.count ?? 0
      : 0,
  }))

  return <QrDashboardClient qrCodes={mapped} appUrl={appUrl} />
}