import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { QrCode } from 'lucide-react'

export const metadata = {
  title: 'Log in — ScanFlow',
  description: 'Log in to your ScanFlow account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <QrCode className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ScanFlow</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Log in to manage your QR codes
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-8">
        <div className="max-w-md">
          <blockquote className="space-y-3">
            <p className="text-lg italic">
              "We changed our menu 4 times last quarter. ScanFlow let us update
              the QR without reprinting a single page."
            </p>
            <footer className="text-sm text-muted-foreground">
              — Owner, Local Restaurant
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}