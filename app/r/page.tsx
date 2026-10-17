import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QrCode } from 'lucide-react'

export const metadata = {
  title: 'Redirect — ScanFlow',
  robots: { index: false, follow: false },
}

export default function RedirectIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <QrCode className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">ScanFlow Redirects</h1>
          <p className="text-muted-foreground">
            This is the redirect base for ScanFlow QR codes. Each QR code
            contains a unique link, like{' '}
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
              /r/a8K2pQ7x
            </code>
          </p>
        </div>

        <Button asChild>
          <Link href="/">Go to homepage</Link>
        </Button>
      </div>
    </div>
  )
}