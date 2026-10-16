import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QrDetailView } from '@/components/qr/qr-detail-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'QR Code Details — ScanFlow',
}

export default async function QrDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: qrCode, error } = await supabase
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
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !qrCode) {
    notFound()
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const scanCount = Array.isArray(qrCode.qr_scans)
    ? qrCode.qr_scans[0]?.count ?? 0
    : 0

  return (
    <QrDetailView
      qrCode={{
        ...qrCode,
        scanCount,
      }}
      appUrl={appUrl}
    />
  )
}