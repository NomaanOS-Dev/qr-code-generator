import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'
import { QrCode } from 'lucide-react'

export const metadata = {
  title: 'Sign up — ScanFlow',
  description: 'Create your ScanFlow account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <QrCode className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ScanFlow</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground mt-2">
              Start managing your QR codes in under a minute
            </p>
          </div>

          <SignupForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side — brand panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-8">
        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-bold">
            The QR code you print today, still works tomorrow.
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Change destinations after printing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Track scans with real analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Brand with your logo and colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Organize by campaign, location, or client</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}