import { cacheLife } from 'next/cache'

export const metadata = {
  title: 'Privacy Policy — ScanFlow',
  description: 'How ScanFlow collects, uses, and protects your data.',
}

// 👇 1. Add this cached function
async function getLastUpdatedDate() {
  'use cache'
  cacheLife('max')
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// 👇 2. Make the component async
export default async function PrivacyPage() {
  // 👇 3. Fetch the date
  const lastUpdated = await getLastUpdatedDate()

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        {/* 👇 4. Use the variable */}
        Last updated: {lastUpdated}
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            1. Information we collect
          </h2>
          <p>
            When you create a ScanFlow account, we collect your email address
            and, optionally, your name. When you create QR codes, we store the
            destination URL, customization settings, and code details.
          </p>
          <p>
            When someone scans your QR codes, we log limited analytics: scan
            time, broad device category (mobile/desktop/tablet), and
            approximate country (derived from IP geolocation). We do not store
            raw IP addresses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            2. How we use information
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and operate the ScanFlow service</li>
            <li>To display analytics to you</li>
            <li>To send transactional emails (account, billing)</li>
            <li>To prevent abuse and enforce our terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            3. Analytics data
          </h2>
          <p>
            Scan analytics are estimates, not perfect counts. They may include
            bot traffic, duplicate scans, and be affected by browser privacy
            features. We collect the minimum data needed to provide useful
            insights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            4. Data retention
          </h2>
          <p>
            Analytics data is retained according to your plan (7 days on Free,
            up to 12 months on Pro/Agency). When you delete a QR code, its
            scans are permanently deleted. When you close your account, all
            your data is deleted within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            5. Data sharing
          </h2>
          <p>
            We do not sell your data. We share data only with essential service
            providers (Supabase for database, Razorpay for payments, Sentry for
            error monitoring) — each bound by their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            6. Your rights
          </h2>
          <p>
            You can access, export, correct, or delete your data at any time
            from your dashboard. For additional requests, contact us at{' '}
            <a href="mailto:support@scanflow.app" className="text-primary hover:underline">
              support@scanflow.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            7. Contact
          </h2>
          <p>
            Questions about this policy? Email{' '}
            <a href="mailto:support@scanflow.app" className="text-primary hover:underline">
              support@scanflow.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}