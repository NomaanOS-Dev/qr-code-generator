import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, ArrowRight, BarChart3, Palette, Link2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ScanFlow</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/dashboard/create" />}>
              <Link href="/login">Log in</Link>
            </Button>
            <Button render={<Link href="/dashboard/create" />}>
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            🎉 Day 3 — Redirect engine live
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
            <Button size="lg" render={<Link href="/dashboard/create" />}>
              <Link href="/signup">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/dashboard/create" />}>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Editable destinations</h3>
            <p className="text-sm text-muted-foreground">
              Change where a QR code points without reprinting. Perfect for
              menus, campaigns, and packaging.
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Real analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track scans by day, device, and country. Know which campaigns
              actually work.
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Your brand</h3>
            <p className="text-sm text-muted-foreground">
              Custom colors, logos, and shapes. QR codes that match your brand
              and stay scannable.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}