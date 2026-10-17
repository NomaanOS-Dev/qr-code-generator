export const metadata = {
  title: 'Terms of Service — ScanFlow',
  description: 'Terms governing your use of ScanFlow.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            1. Acceptance of terms
          </h2>
          <p>
            By using ScanFlow, you agree to these terms. If you don&apos;t
            agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            2. Your account
          </h2>
          <p>
            You must provide accurate information when creating an account.
            You are responsible for maintaining the security of your password
            and for all activity under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            3. Acceptable use
          </h2>
          <p>You may not use ScanFlow to create QR codes that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Link to illegal content or services</li>
            <li>Facilitate phishing, fraud, or malware distribution</li>
            <li>Infringe on intellectual property rights</li>
            <li>Harass, threaten, or harm others</li>
            <li>Violate any applicable laws</li>
          </ul>
          <p>
            We may deactivate QR codes that violate these rules without notice
            and without refund.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            4. Payments and refunds
          </h2>
          <p>
            Subscriptions are billed monthly in advance. You may cancel anytime;
            access continues until the end of the current billing period. We
            offer full refunds within 7 days of payment if you cancel.
          </p>
          <p>
            Prices are in INR and exclusive of GST, which is added at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            5. Service availability
          </h2>
          <p>
            We aim for 99.9% uptime but do not guarantee uninterrupted service.
            Scheduled maintenance will be announced in advance when possible.
            If our redirect service is down, your printed QR codes may
            temporarily fail to work.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            6. Data and content
          </h2>
          <p>
            You retain ownership of the content you upload. By using ScanFlow,
            you grant us a license to store, process, and display it as needed
            to provide the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            7. Termination
          </h2>
          <p>
            You may delete your account anytime. We may suspend or terminate
            accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            8. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, ScanFlow is not liable for
            indirect, incidental, or consequential damages. Our total liability
            is limited to the amount you paid us in the 12 months before the
            claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            9. Changes to terms
          </h2>
          <p>
            We may update these terms. Material changes will be announced by
            email or on the website 30 days in advance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">
            10. Contact
          </h2>
          <p>
            Questions? Email{' '}
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