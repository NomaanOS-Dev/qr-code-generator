import 'server-only'
import Razorpay from 'razorpay'

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials not configured')
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export const RAZORPAY_PLANS = {
  starter: process.env.RAZORPAY_PLAN_STARTER!,
  pro: process.env.RAZORPAY_PLAN_PRO!,
  agency: process.env.RAZORPAY_PLAN_AGENCY!,
} as const

export type RazorpayPlanKey = keyof typeof RAZORPAY_PLANS