import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Use service role to bypass RLS in webhook
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Map Razorpay plan IDs → internal plan names
const PLAN_ID_MAP: Record<string, 'starter' | 'pro' | 'agency'> = {
  [process.env.RAZORPAY_PLAN_STARTER!]: 'starter',
  [process.env.RAZORPAY_PLAN_PRO!]: 'pro',
  [process.env.RAZORPAY_PLAN_AGENCY!]: 'agency',
}

function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Config error' }, { status: 500 })
  }

  if (!verifySignature(rawBody, signature, secret)) {
    console.error('[webhook] invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const eventType = event.event
  const payload = event.payload

  console.log(`[webhook] ${eventType}`)

  try {
    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = payload.subscription?.entity
        if (!sub) break

        const planId = sub.plan_id
        const internalPlan = PLAN_ID_MAP[planId] ?? 'starter'
        const userId = sub.notes?.userId

        if (!userId) {
          console.error('[webhook] missing userId in notes')
          break
        }

        // Upsert subscription
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan: internalPlan,
              status: 'active',
              razorpay_subscription_id: sub.id,
              razorpay_plan_id: planId,
              razorpay_customer_id: sub.customer_id ?? null,
              provider_subscription_id: sub.id,
              current_period_end: sub.current_end
                ? new Date(sub.current_end * 1000).toISOString()
                : null,
            },
            { onConflict: 'user_id' }
          )

        if (error) console.error('[webhook] upsert error:', error)
        else console.log(`[webhook] ${eventType} → user ${userId} on ${internalPlan}`)
        break
      }

      case 'subscription.cancelled':
      case 'subscription.halted':
      case 'subscription.completed': {
        const sub = payload.subscription?.entity
        if (!sub) break

        const userId = sub.notes?.userId
        if (!userId) break

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: 'free',
            status: eventType === 'subscription.halted' ? 'halted' : 'cancelled',
            current_period_end: null,
          })
          .eq('user_id', userId)

        if (error) console.error('[webhook] downgrade error:', error)
        else console.log(`[webhook] ${eventType} → user ${userId} downgraded`)
        break
      }

      default:
        console.log(`[webhook] unhandled event: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook] fatal:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}