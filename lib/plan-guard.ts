import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'

export interface PlanContext {
  userId: string
  plan: Plan
  status: string
  limits: (typeof PLAN_LIMITS)[Plan]
  qrCodeCount: number
  customDomainCount: number // ← new
  canCreateQr: boolean
  isActiveSubscription: boolean
  currentPeriodEnd: string | null
  razorpaySubscriptionId: string | null
}

/**
 * Fetch the current user's plan context (limits, usage, status).
 * Returns null if not authenticated.
 */
export async function getPlanContext(): Promise<PlanContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [subResult, countResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, razorpay_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const sub = subResult.data
  const status = sub?.status ?? 'active'

  // Determine effective plan (downgrade if inactive)
  let effectivePlan: Plan = (sub?.plan as Plan) ?? 'free'
  if (status !== 'active' && status !== 'pending') {
    effectivePlan = 'free'
  }

  const limits = PLAN_LIMITS[effectivePlan]
  const qrCodeCount = countResult.count ?? 0

  // ─── Custom domain count for the active workspace ─────────
  // The sidebar shows "N / M domains". Domains live per-workspace,
  // so we resolve the user's active workspace first.
  const { data: workspace } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  let customDomainCount = 0
  if (workspace) {
    const { count: domainCount } = await supabase
      .from('custom_domains')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspace.workspace_id)
    customDomainCount = domainCount ?? 0
  }

  return {
    userId: user.id,
    plan: effectivePlan,
    status,
    limits,
    qrCodeCount,
    customDomainCount,
    canCreateQr: qrCodeCount < limits.maxQrCodes,
    isActiveSubscription: status === 'active' && effectivePlan !== 'free',
    currentPeriodEnd: sub?.current_period_end ?? null,
    razorpaySubscriptionId: sub?.razorpay_subscription_id ?? null,
  }
}

/**
 * Throws if the current user doesn't have the given feature.
 * Use in server actions where returning an error is awkward.
 */
export async function requireFeature(
  feature: keyof (typeof PLAN_LIMITS)['free']
): Promise<PlanContext> {
  const ctx = await getPlanContext()
  if (!ctx) {
    throw new Error('Not authenticated')
  }
  const value = ctx.limits[feature]
  if (!value) {
    throw new Error(
      `This feature requires a higher plan. Please upgrade to continue.`
    )
  }
  return ctx
}

/**
 * Throws if the current user's plan doesn't allow creating another QR code.
 */
export async function requireQrQuota(): Promise<PlanContext> {
  const ctx = await getPlanContext()
  if (!ctx) throw new Error('Not authenticated')
  if (!ctx.canCreateQr) {
    throw new Error(
      `You've reached the ${ctx.plan} plan limit (${ctx.limits.maxQrCodes} QR codes). Please upgrade.`
    )
  }
  return ctx
}

/**
 * Non-throwing check for use in server components / pages.
 */
export async function canAccessFeature(
  feature: keyof (typeof PLAN_LIMITS)['free']
): Promise<boolean> {
  const ctx = await getPlanContext()
  if (!ctx) return false
  return Boolean(ctx.limits[feature])
}