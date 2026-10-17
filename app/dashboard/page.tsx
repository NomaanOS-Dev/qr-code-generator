import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanContext } from '@/lib/plan-guard'
import { getCurrentWorkspace } from '@/lib/workspaces'
import { QrDashboardClient } from '@/components/dashboard/qr-dashboard-client'
import { UpgradePrompt } from '@/components/billing/upgrade-prompt'
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'

export const metadata = {
  title: 'My QR Codes — ScanFlow',
}

export default async function DashboardPage() {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const workspace = await getCurrentWorkspace()
  if (!workspace) {
    console.warn('[DashboardPage] no workspace for user', user.id)
    redirect('/login')
  }

  const { data: qrCodes } = await supabase
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
      qr_scans (count)
    `
    )
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const mapped = (qrCodes ?? []).map((qr) => ({
    id: qr.id,
    name: qr.name,
    slug: qr.slug,
    destination_url: qr.destination_url,
    foreground_color: qr.foreground_color,
    background_color: qr.background_color,
    logo_path: qr.logo_path,
    is_active: qr.is_active,
    created_at: qr.created_at ?? new Date().toISOString(),
    scanCount: Array.isArray(qr.qr_scans) ? qr.qr_scans[0]?.count ?? 0 : 0,
  }))

  const ctx = await getPlanContext()

  const hasQrCode = mapped.length > 0
  const hasScans = mapped.some((qr) => qr.scanCount > 0)
  const hasLogoOrColor = mapped.some(
    (qr) =>
      qr.logo_path ||
      qr.foreground_color !== '#000000' ||
      qr.background_color !== '#FFFFFF'
  )
  const hasViewedAnalytics = hasScans

  const nearLimit =
    ctx && ctx.qrCodeCount > 0 && ctx.qrCodeCount >= ctx.limits.maxQrCodes - 1
  const atLimit = ctx && !ctx.canCreateQr && ctx.plan !== 'agency'

  return (
    <div className="space-y-6">
      {hasQrCode && (
        <OnboardingChecklist
          hasQrCode={hasQrCode}
          hasScans={hasScans}
          hasViewedAnalytics={hasViewedAnalytics}
          hasLogoOrColor={hasLogoOrColor}
        />
      )}

      {nearLimit && ctx && (
        <UpgradePrompt
          currentPlan={ctx.plan}
          requiredPlan={
            ctx.plan === 'free'
              ? 'starter'
              : ctx.plan === 'starter'
                ? 'pro'
                : 'agency'
          }
          feature={
            atLimit
              ? `You've reached your QR code limit (${ctx.limits.maxQrCodes})`
              : `You're close to your QR code limit (${ctx.qrCodeCount}/${ctx.limits.maxQrCodes})`
          }
          variant="inline"
        />
      )}

      <QrDashboardClient qrCodes={mapped} appUrl={appUrl} />
    </div>
  )
}