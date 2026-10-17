import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QrCode, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'QR Code Not Found — ScanFlow',
  robots: { index: false, follow: false },
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">QR Code Not Found</h1>
          <p className="text-muted-foreground">
            This QR code doesn't exist, has been deleted, or is currently inactive.
          </p>
        </div>

        <Button asChild>
          <Link href="/">Go to homepage</Link>
        </Button>
      </div>
    </div>
  )
}