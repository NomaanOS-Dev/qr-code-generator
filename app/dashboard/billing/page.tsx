import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPlanContext } from '@/lib/plan-guard'
import { PLAN_NAMES } from '@/lib/plans'
import { UsageMeter } from '@/components/billing/usage-meter'
import { ManageSubscription } from '@/components/billing/manage-subscription'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, X, Sparkles } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = {
  title: 'Billing — ScanFlow',
}

interface PageProps {
  searchParams: Promise<{ upgraded?: string }>
}

export default async function BillingPage({ searchParams }: PageProps) {
  const { upgraded } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const ctx = await getPlanContext()
  if (!ctx) redirect('/login')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {upgraded === 'true' && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-900 dark:text-emerald-100">
              Subscription activated!
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Your new plan is now active. It may take a few seconds to reflect.
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and usage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            You are on the <strong>{PLAN_NAMES[ctx.plan]}</strong> plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={ctx.plan === 'free' ? 'secondary' : 'default'}
                className="text-sm"
              >
                {PLAN_NAMES[ctx.plan]}
              </Badge>
              {ctx.status !== 'active' && (
                <Badge variant="outline" className="text-xs capitalize">
                  {ctx.status}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {ctx.plan !== 'free' && (
                <ManageSubscription
                  status={ctx.status}
                  currentPeriodEnd={ctx.currentPeriodEnd}
                />
              )}
              <Button
                variant={ctx.plan === 'free' ? 'default' : 'outline'}
                asChild
              >
                <Link href="/pricing">
                  {ctx.plan === 'free' ? 'Upgrade plan' : 'Change plan'}
                </Link>
              </Button>
            </div>
          </div>

          {ctx.currentPeriodEnd && ctx.status === 'active' && (
            <p className="text-sm text-muted-foreground">
              Renews on{' '}
              {format(new Date(ctx.currentPeriodEnd), 'MMMM d, yyyy')}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <UsageMeter
              label="QR codes"
              current={ctx.qrCodeCount}
              limit={ctx.limits.maxQrCodes}
            />
            <UsageMeter
              label="Analytics retention"
              current={ctx.limits.analyticsDays}
              limit={365}
              unit="days"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Feature</th>
                  <th className="text-center py-2 px-2">Free</th>
                  <th className="text-center py-2 px-2">Starter</th>
                  <th className="text-center py-2 px-2">Pro</th>
                  <th className="text-center py-2 px-2">Agency</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['QR codes', '2', '10', '50', '500'],
                  ['Analytics (days)', '7', '30', '365', '365'],
                  ['Logo upload', '✗', '✓', '✓', '✓'],
                  ['Custom domains', '✗', '✗', '✓', '✓'],
                  ['CSV export', '✗', '✗', '✓', '✓'],
                  ['Team members', '1', '1', '3', '10'],
                ].map(([label, ...vals]) => (
                  <tr key={label} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{label}</td>
                    {vals.map((v, i) => (
                      <td key={i} className="text-center py-2 px-2">
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
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Payments processed securely by Razorpay. GST applicable.
      </p>
    </div>
  )
}