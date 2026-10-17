import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Rocket,
  QrCode,
  BarChart3,
  Palette,
  Globe,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export const metadata = {
  title: 'Documentation — ScanFlow',
  description: 'Getting started with ScanFlow dynamic QR codes.',
}

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to get started with ScanFlow.
        </p>
      </div>

      {/* Quick start */}
      <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-6 mb-12">
        <div className="flex items-start gap-3 mb-4">
          <Rocket className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold">Quick start</h2>
            <p className="text-sm text-muted-foreground">
              Create your first QR code in under 60 seconds.
            </p>
          </div>
        </div>
        <ol className="space-y-3 text-sm">
          {[
            'Sign up for a free account at scanflow.app/signup',
            'Click "Create QR" in your dashboard',
            'Enter a name and destination URL (e.g., your menu page)',
            'Customize colors and add your logo (optional)',
            'Click "Create QR Code" — done!',
            'Download PNG or SVG and print',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Button className="mt-4" asChild>
          <Link href="/signup">
            Get started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Sections */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {[
          {
            icon: QrCode,
            title: 'Creating QR codes',
            description: 'Learn how to make dynamic QR codes',
            href: '#creating',
          },
          {
            icon: Palette,
            title: 'Customizing',
            description: 'Colors, logos, and styles',
            href: '#customizing',
          },
          {
            icon: BarChart3,
            title: 'Analytics',
            description: 'Understanding your scan data',
            href: '#analytics',
          },
          {
            icon: Globe,
            title: 'Custom domains',
            description: 'Use your own domain',
            href: '#domains',
          },
          {
            icon: Users,
            title: 'Team & workspaces',
            description: 'Invite team members',
            href: '#team',
          },
          {
            icon: Shield,
            title: 'FAQ',
            description: 'Common questions answered',
            href: '#faq',
          },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-lg border p-4 hover:border-primary hover:bg-primary/5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10">
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Detailed sections */}
      <div className="space-y-12">
        <section id="creating">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Creating QR codes
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Every QR code you create is <strong>dynamic</strong> — meaning the
              destination can be changed anytime without reprinting.
            </p>
            <p>
              To create a QR code, go to your dashboard and click{' '}
              <strong>Create QR</strong>. You&apos;ll need:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Name</strong> — internal label (only you see it)
              </li>
              <li>
                <strong>Destination URL</strong> — where the QR code points
              </li>
              <li>
                <strong>Colors</strong> — foreground and background
              </li>
              <li>
                <strong>Logo</strong> — optional, requires Starter plan
              </li>
            </ul>
            <p>
              Once created, download the QR as PNG (for digital use) or SVG
              (for print). SVG scales infinitely without losing quality — use
              it for professional printing.
            </p>
          </div>
        </section>

        <section id="customizing">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Customizing
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>You can customize every QR code:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Foreground color</strong> — the QR pattern. Keep dark
                for best contrast.
              </li>
              <li>
                <strong>Background color</strong> — the space around the
                pattern. Keep light.
              </li>
              <li>
                <strong>Logo</strong> — square image, up to 1 MB. Keep under
                20% of QR size.
              </li>
              <li>
                <strong>Error correction</strong> — how much damage the QR can
                take and still scan. Higher = more reliable with logos.
              </li>
            </ul>
            <p>
              Always test your QR code with a phone before printing hundreds of
              copies. Some color combinations look fine on screen but fail to
              scan.
            </p>
          </div>
        </section>

        <section id="analytics">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Every scan is logged with device type, country, and timestamp.
              Analytics retention depends on your plan:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Free: 7 days of history</li>
              <li>Starter: 30 days</li>
              <li>Pro & Agency: 12 months</li>
            </ul>
            <p>
              Access analytics from any QR code&apos;s detail page, or from the
              global Analytics dashboard in the sidebar.
            </p>
            <p>
              <strong>Note:</strong> Scan counts are estimates. They include
              bot traffic, duplicate scans, and may be affected by browser
              privacy features. See our{' '}
              <Link href="/blog/qr-code-analytics-metrics" className="text-primary hover:underline">
                analytics guide
              </Link>{' '}
              for details.
            </p>
          </div>
        </section>

        <section id="domains">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Custom domains
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              On the Pro plan and above, you can serve QR codes from your own
              domain (e.g., <code>go.yourbrand.com</code> instead of{' '}
              <code>scanflow.app</code>).
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Go to Domains in your dashboard</li>
              <li>Click Add Domain and enter your domain</li>
              <li>
                Add the CNAME record shown at your DNS provider
              </li>
              <li>Wait for DNS to propagate (5-60 minutes)</li>
              <li>Click Verify DNS to confirm</li>
              <li>Assign the domain to any QR code</li>
            </ol>
            <p>
              SSL certificates provision automatically within 24 hours of
              successful verification.
            </p>
          </div>
        </section>

        <section id="team">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team & workspaces
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Workspaces keep QR codes separate. Each user starts with a
              default workspace and can create more.
            </p>
            <p>Invite team members by email with these roles:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Owner</strong> — full control, billing, deletion
              </li>
              <li>
                <strong>Admin</strong> — manage members and QR codes
              </li>
              <li>
                <strong>Member</strong> — create and edit QR codes
              </li>
              <li>
                <strong>Viewer</strong> — read-only access
              </li>
            </ul>
            <p>
              Team member limits depend on your plan (1 on Free/Starter, 3 on
              Pro, 10 on Agency).
            </p>
          </div>
        </section>

        <section id="faq">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            FAQ
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'What happens if I cancel my subscription?',
                a: 'Your plan downgrades to Free. Your QR codes stay active up to the Free plan limit (2 codes). Additional codes beyond that limit are paused — they keep their data but stop redirecting until you upgrade again.',
              },
              {
                q: 'Can I export my QR codes?',
                a: 'Yes — from the dashboard, select multiple QR codes and click "Download ZIP" in the bulk actions bar. You get PNG + SVG for each, plus a README.',
              },
              {
                q: 'Do my QR codes expire?',
                a: 'No. As long as your account is active, your QR codes keep working. Only if you delete a QR code or downgrade beyond your plan limit do they stop redirecting.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'All major cards, UPI, net banking, and wallets via Razorpay.',
              },
              {
                q: 'How do I contact support?',
                a: 'Email support@scanflow.app or use the contact form on the website. Pro and Agency plans include priority support.',
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
        </section>
      </div>

      <div className="mt-16 rounded-lg border p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Still have questions? We&apos;re here to help.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" asChild>
            <Link href="/contact">Contact support</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Start free</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}