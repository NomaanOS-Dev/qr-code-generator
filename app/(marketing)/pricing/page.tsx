import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RazorpayCheckoutButton } from '@/components/billing/razorpay-checkout'
import type { RazorpayPlanKey } from '@/lib/razorpay'

export const metadata = {
  title: 'Pricing — ScanFlow',
  description:
    'Simple, transparent pricing. Start free, upgrade when you need more.',
}

interface Plan {
  key: RazorpayPlanKey | 'free'
  name: string
  price: number
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    description: 'Try ScanFlow with 2 QR codes',
    features: [
      '2 dynamic QR codes',
      'Editable destinations',
      '7-day analytics',
      'Basic colors',
    ],
    cta: 'Start free',
  },
  {
    key: 'starter',
    name: 'Starter',
    price: 749,
    description: 'For small businesses and solo owners',
    features: [
      '10 QR codes',
      'Logo upload',
      '30-day analytics',
      'Custom colors & styles',
      'Email support',
    ],
    cta: 'Choose Starter',
    highlighted: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 1499,
    description: 'For growing teams and marketers',
    features: [
      '50 QR codes',
      'Everything in Starter',
      'Custom domains',
      '12-month analytics',
      'CSV export',
      '3 team members',
    ],
    cta: 'Choose Pro',
  },
  {
    key: 'agency',
    name: 'Agency',
    price: 3999,
    description: 'For agencies managing multiple clients',
    features: [
      '500 QR codes',
      'Everything in Pro',
      'Client workspaces',
      'API access',
      '10 team members',
      'Priority support',
    ],
    cta: 'Choose Agency',
  },
]

const COMPARISON = [
  ['QR codes', '2', '10', '50', '500'],
  ['Analytics (days)', '7', '30', '365', '365'],
  ['Logo upload', '✗', '✓', '✓', '✓'],
  ['Custom domains', '✗', '✗', '✓', '✓'],
  ['CSV export', '✗', '✗', '✓', '✓'],
  ['Team members', '1', '1', '3', '10'],
  ['Client workspaces', '✗', '✗', '✗', '✓'],
  ['API access', '✗', '✗', '✗', '✓'],
]

export default async function PricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userName = ''
  let userEmail = ''
  let currentPlan = 'free'

  if (user) {
    userEmail = user.email ?? ''
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    userName = profile?.full_name ?? ''

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .maybeSingle()
    currentPlan = sub?.plan ?? 'free'
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Start free. Upgrade when you need more. Cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key
          return (
            <Card
              key={plan.key}
              className={
                plan.highlighted
                  ? 'border-primary shadow-lg relative'
                  : 'relative'
              }
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.key === 'free' ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={user ? '/dashboard' : '/signup'}>
                      {user ? 'Go to dashboard' : 'Start free'}
                    </Link>
                  </Button>
                ) : isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : !user ? (
                  <Button asChild className="w-full">
                    <Link href={`/signup?plan=${plan.key}`}>
                      Sign up to subscribe
                    </Link>
                  </Button>
                ) : (
                  <RazorpayCheckoutButton
                    planKey={plan.key}
                    planLabel={plan.name}
                    amountINR={plan.price}
                    userEmail={userEmail}
                    userName={userName}
                  />
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Comparison table */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Compare all features
        </h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Feature</th>
                <th className="text-center px-3 py-3 font-medium">Free</th>
                <th className="text-center px-3 py-3 font-medium">Starter</th>
                <th className="text-center px-3 py-3 font-medium">Pro</th>
                <th className="text-center px-3 py-3 font-medium">Agency</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([label, ...vals]) => (
                <tr key={label} className="border-t">
                  <td className="px-4 py-3 text-muted-foreground">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="text-center px-3 py-3">
                      {v === '✓' ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : v === '✗' ? (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      ) : (
                        <span className="font-medium">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Pricing questions
        </h2>
        <div className="space-y-3">
          {[
            {
              q: 'Can I change plans later?',
              a: 'Yes. Upgrade or downgrade anytime from your billing page. Changes take effect immediately for upgrades; downgrades apply at the next billing cycle.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'All major cards, UPI, net banking, and wallets via Razorpay.',
            },
            {
              q: 'Do prices include GST?',
              a: 'GST is added at checkout as per Indian tax laws.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'Yes — full refund within 7 days of payment if you cancel.',
            },
          ].map((item) => (
            <details key={item.q} className="rounded-lg border p-4 group">
              <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12">
        Prices in INR. GST applicable. Powered by Razorpay.
      </p>
    </div>
  )
}