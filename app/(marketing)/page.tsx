import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Link2,
  BarChart3,
  Palette,
  Globe,
  Zap,
  Shield,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react'

export const metadata = {
  title: 'ScanFlow — Dynamic QR Codes for Modern Businesses',
  description:
    'Create dynamic QR codes you can edit anytime. Track scans with real analytics. Change where your printed QR codes point — no reprints needed.',
  openGraph: {
    title: 'ScanFlow — Dynamic QR Codes for Modern Businesses',
    description:
      'Create dynamic QR codes you can edit anytime. Track scans with real analytics.',
    type: 'website',
  },
}

const FEATURES = [
  {
    icon: Link2,
    title: 'Editable destinations',
    description:
      'Change where a QR code points without reprinting. Perfect for menus, campaigns, and packaging.',
  },
  {
    icon: BarChart3,
    title: 'Real analytics',
    description:
      'Track scans by day, device, and country. Know which campaigns actually work.',
  },
  {
    icon: Palette,
    title: 'Your brand',
    description:
      'Custom colors, logos, and shapes. QR codes that match your brand and stay scannable.',
  },
  {
    icon: Globe,
    title: 'Custom domains',
    description:
      'Serve QR codes from your own domain like go.yourbrand.com instead of a generic link.',
  },
  {
    icon: Users,
    title: 'Team workspaces',
    description:
      'Invite teammates, assign roles, and manage QR codes across clients or locations.',
  },
  {
    icon: Shield,
    title: 'Reliable infrastructure',
    description:
      'Rate-limited, monitored, and SSL-encrypted. Your printed codes always work.',
  },
]

const STATS = [
  { value: '99.9%', label: 'Uptime target' },
  { value: '<150ms', label: 'Redirect latency' },
  { value: '100%', label: 'Editable codes' },
  { value: '24/7', label: 'Monitoring' },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Trusted by restaurants, agencies, and retailers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The QR code you print today,{' '}
            <span className="text-primary">still works tomorrow.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create dynamic QR codes you can edit anytime, brand with your logo,
            and track every scan — without ever reprinting.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Free forever plan · No credit card required
          </p>
        </div>

        {/* Hero preview */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="rounded-xl border-2 border-border bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 md:p-8 shadow-2xl">
            <div className="rounded-lg bg-background border shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground">
                  scanflow.app/dashboard
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: 'Summer Menu', scans: 842, color: '#7C2D12' },
                    { name: 'Holiday Promo', scans: 1643, color: '#1E40AF' },
                    { name: 'Wifi Access', scans: 495, color: '#5B21B6' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="rounded-lg border bg-card p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-2xl font-bold">{item.scans}</span>
                        <span className="text-xs text-muted-foreground">
                          scans
                        </span>
                      </div>
                      <div
                        className="mt-3 h-2 rounded-full"
                        style={{ backgroundColor: item.color + '20' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: item.color,
                            width: `${(item.scans / 1643) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to manage QR codes
          </h2>
          <p className="text-lg text-muted-foreground">
            Built for businesses that print QR codes and need to keep them
            working.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three steps. Under a minute. No technical knowledge needed.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Create your QR code',
                description:
                  'Enter a destination URL. Pick your colors and logo. Download in PNG or SVG.',
              },
              {
                step: '2',
                title: 'Print anywhere',
                description:
                  'Use it on menus, flyers, packaging, business cards — anywhere a QR code fits.',
              },
              {
                step: '3',
                title: 'Update anytime',
                description:
                  'Change the destination in your dashboard. Your printed QR code keeps working.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-center">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Made for real businesses
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you change menus weekly or run hundreds of client campaigns.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: 'Restaurants',
              description:
                'Update menus seasonally without reprinting 500 copies.',
              icon: '🍽️',
            },
            {
              title: 'Marketing agencies',
              description:
                'Manage QR campaigns for every client in one dashboard.',
              icon: '📊',
            },
            {
              title: 'Retail & events',
              description:
                'Promotions, product info, schedules — all updatable.',
              icon: '🛍️',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border bg-card p-6 text-center"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free. Upgrade when you need more.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { name: 'Free', price: '₹0', features: '2 QR codes' },
              { name: 'Starter', price: '₹749', features: '10 QR codes' },
              { name: 'Pro', price: '₹1,499', features: '50 QR codes' },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-lg border bg-card p-6"
              >
                <p className="text-sm text-muted-foreground">{plan.name}</p>
                <p className="text-3xl font-bold mt-2">{plan.price}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.features}
                </p>
              </div>
            ))}
          </div>
          <Button size="lg" asChild>
            <Link href="/pricing">
              See all plans <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'What is a dynamic QR code?',
                a: 'A dynamic QR code points to a URL you control (like scanflow.app/r/abc123). You can change where it redirects at any time — the printed code stays the same.',
              },
              {
                q: 'Do my printed QR codes ever expire?',
                a: 'No. As long as your account is active, your QR codes keep working. If you cancel your subscription, codes beyond the free plan limit get deactivated.',
              },
              {
                q: 'Can I use my own domain?',
                a: 'Yes, on the Pro plan and above. Add a CNAME record to your DNS, verify it in ScanFlow, and your QR codes will use go.yourbrand.com instead of scanflow.app.',
              },
              {
                q: 'What happens if I downgrade to free?',
                a: 'Your codes stay active but you can only manage up to 2. Additional codes beyond the free limit are paused until you upgrade again.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes. If you cancel within 7 days of payment, we refund the full amount. Contact support to request it.',
              },
              {
                q: 'Is there a free plan?',
                a: 'Yes — 2 dynamic QR codes with 7-day analytics. No credit card required.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="rounded-lg border bg-card p-4 group"
              >
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to stop reprinting QR codes?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of businesses using ScanFlow to manage their printed
            QR codes.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Start free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}