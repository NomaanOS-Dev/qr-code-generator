import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { razorpay, RAZORPAY_PLANS, type RazorpayPlanKey } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const planKey = body.plan as RazorpayPlanKey | undefined

  if (!planKey || !(planKey in RAZORPAY_PLANS)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const planId = RAZORPAY_PLANS[planKey]

  try {
    // Create a Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 billing cycles (1 year)
      notes: {
        userId: user.id,
        userEmail: user.email ?? '',
        planKey,
      },
    })

    // Store the pending subscription in our DB
    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          plan: 'free', // stays free until webhook confirms payment
          status: 'pending',
          razorpay_subscription_id: subscription.id,
          razorpay_plan_id: planId,
        },
        { onConflict: 'user_id' }
      )

    if (dbError) {
      console.error('[razorpay checkout] DB error:', dbError)
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planKey,
    })
  } catch (error) {
    console.error('[razorpay checkout] error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}