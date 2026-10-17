'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { RazorpayPlanKey } from '@/lib/razorpay'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayCheckoutProps {
  planKey: RazorpayPlanKey
  planLabel: string
  amountINR: number
  userEmail: string
  userName: string
  userContact?: string
  children?: React.ReactNode
}

export function RazorpayCheckoutButton({
  planKey,
  planLabel,
  amountINR,
  userEmail,
  userName,
  userContact,
  children,
}: RazorpayCheckoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function loadScript(): Promise<boolean> {
    if (window.Razorpay) return true
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  async function handleCheckout() {
    setLoading(true)

    const loaded = await loadScript()
    if (!loaded) {
      toast.error('Failed to load Razorpay. Check your connection.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create subscription')
      }

      const data = await res.json()

      const options = {
        key: data.key,
        subscription_id: data.subscriptionId,
        name: 'ScanFlow',
        description: `${planLabel} — Monthly`,
        image: '/logo.png', // optional
        prefill: {
          name: userName,
          email: userEmail,
          contact: userContact ?? '',
        },
        theme: { color: '#2563EB' },
        handler: function (response: any) {
          // Payment succeeded — webhook will update the DB
          // Redirect to billing page with success indicator
          toast.success('Subscription activated!')
          router.push('/dashboard/billing?upgraded=true')
          router.refresh()
        },
        modal: {
          ondismiss: function () {
            toast.info('Checkout cancelled')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        toast.error(
          `Payment failed: ${response.error?.description ?? 'Unknown error'}`
        )
      })
      rzp.open()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening checkout...
        </>
      ) : (
        children ?? `Subscribe — ₹${amountINR.toLocaleString('en-IN')}/mo`
      )}
    </Button>
  )
}