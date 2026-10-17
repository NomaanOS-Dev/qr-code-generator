import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay'

/**
 * POST /api/billing/manage
 * Body: { action: 'cancel' }
 * Cancels the user's Razorpay subscription at the end of the current period.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const action = body.action

  if (action !== 'cancel') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('razorpay_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub?.razorpay_subscription_id) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 400 }
    )
  }

  try {
    await razorpay.subscriptions.cancel(sub.razorpay_subscription_id, true)

    // Update local status (webhook will confirm)
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelling' })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message:
        'Subscription will be cancelled at the end of your billing period.',
    })
  } catch (error) {
    console.error('[billing manage] error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}