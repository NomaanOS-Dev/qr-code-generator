import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scanflow.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'ScanFlow — Dynamic QR Codes for Modern Businesses',
    template: '%s | ScanFlow',
  },
  description:
    'Create dynamic QR codes you can edit anytime. Track scans with real analytics. Change where your printed QR codes point — no reprints needed.',
  keywords: [
    'QR code',
    'dynamic QR code',
    'QR code generator',
    'QR code management',
    'QR code analytics',
    'restaurant QR menu',
  ],
  authors: [{ name: 'ScanFlow' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    siteName: 'ScanFlow',
    title: 'ScanFlow — Dynamic QR Codes for Modern Businesses',
    description:
      'Create dynamic QR codes you can edit anytime. Track scans with real analytics.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScanFlow — Dynamic QR Codes for Modern Businesses',
    description:
      'Create dynamic QR codes you can edit anytime. Track scans with real analytics.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}