import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail, MessageSquare, Clock } from 'lucide-react'

export const metadata = {
  title: 'Contact — ScanFlow',
  description: 'Get in touch with the ScanFlow team.',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Contact us</h1>
        <p className="text-lg text-muted-foreground">
          We usually respond within 24 hours on business days.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Email us</CardTitle>
            <CardDescription>
              For all inquiries, support, and billing questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a href="mailto:support@scanflow.app">
                support@scanflow.app
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Response time</CardTitle>
            <CardDescription>
              Priority support on Pro and Agency plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Free & Starter: within 48 hours</p>
            <p>Pro: within 24 hours</p>
            <p>Agency: within 4 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Before you write</CardTitle>
          <CardDescription>
            Many questions are already answered in our docs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-sm space-y-2">
            <li>
              →{' '}
              <Link href="/docs" className="text-primary hover:underline">
                Getting started guide
              </Link>
            </li>
            <li>
              →{' '}
              <Link href="/docs#faq" className="text-primary hover:underline">
                Frequently asked questions
              </Link>
            </li>
            <li>
              →{' '}
              <Link href="/pricing" className="text-primary hover:underline">
                Pricing and plan details
              </Link>
            </li>
            <li>
              →{' '}
              <Link href="/status" className="text-primary hover:underline">
                System status
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}