import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreateQrForm } from '@/components/qr/create-qr-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Plan } from '@/lib/plans'

// ✅ REQUIRED for Next.js 16 + Cache Components when using `await connection()`
export const instant = false

export const metadata = {
  title: 'Create QR Code — ScanFlow',
}

const TEMPLATE_PRESETS: Record<
  string,
  { name: string; destination: string; fg: string; bg: string }
> = {
  'restaurant-menu': {
    name: 'Restaurant Menu',
    destination: '',
    fg: '#7C2D12',
    bg: '#FEF3C7',
  },
  'event-schedule': {
    name: 'Event Schedule',
    destination: '',
    fg: '#1E40AF',
    bg: '#DBEAFE',
  },
  'business-card': {
    name: 'Digital Business Card',
    destination: '',
    fg: '#1F2937',
    bg: '#F9FAFB',
  },
  'product-info': {
    name: 'Product Information',
    destination: '',
    fg: '#065F46',
    bg: '#D1FAE5',
  },
  'wifi-access': {
    name: 'Guest Wi-Fi',
    destination: '',
    fg: '#5B21B6',
    bg: '#EDE9FE',
  },
  newsletter: {
    name: 'Newsletter Signup',
    destination: '',
    fg: '#BE185D',
    bg: '#FCE7F3',
  },
}

interface PageProps {
  searchParams: Promise<{ template?: string }>
}

export default async function CreateQrPage({ searchParams }: PageProps) {
  await connection()

  const { template } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan: Plan = (subscription?.plan as Plan) || 'free'
  const preset = template ? TEMPLATE_PRESETS[template] : undefined

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create QR Code</h1>
          <p className="text-muted-foreground mt-1">
            Your QR code points to a link you control — change the destination
            anytime.
          </p>
        </div>
      </div>

      <CreateQrForm userPlan={plan} preset={preset} />
    </div>
  )
}