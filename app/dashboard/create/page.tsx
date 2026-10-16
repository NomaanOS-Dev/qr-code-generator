import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateQrForm } from '@/components/qr/create-qr-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Plan } from '@/lib/plans'

export const metadata = {
  title: 'Create QR Code — ScanFlow',
}

export default async function CreateQrPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan: Plan = (subscription?.plan as Plan) || 'free'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create QR Code</h1>
          <p className="text-muted-foreground mt-1">
            Your QR code points to a link you control — change the destination anytime.
          </p>
        </div>
      </div>

      <CreateQrForm userPlan={plan} />
    </div>
  )
}