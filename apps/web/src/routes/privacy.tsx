import { createFileRoute, Link } from '@tanstack/react-router'
import { LegalPage } from '#/components/site/legal-page'

export const Route = createFileRoute('/privacy')({ component: Privacy })

function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="May 2026">
      <p>
        We respect your privacy. This explains what we collect and how we use it.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account info: your name and email (for sign-in and updates).</li>
        <li>Order details: the story, preferences, and recipient info you share.</li>
        <li>Payment info: handled by Stripe — we never store card numbers.</li>
        <li>Usage analytics to improve the product.</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        To create and deliver your song, send order updates, process payments, and
        improve our service. We do not sell your personal data.
      </p>
      <h2>Your data, your control</h2>
      <p>
        You can export or delete your data anytime from your{' '}
        <Link to="/dashboard">dashboard</Link> (Account &amp; data). Deletion removes
        your account, orders, and generated content.
      </p>
      <h2>Retention &amp; security</h2>
      <p>
        We keep order data while your account is active and as needed for legal and
        operational purposes. Files are stored privately and shared via secure links.
      </p>
      <h2>Contact</h2>
      <p>Privacy questions? Email privacy@storytunes.example.</p>
    </LegalPage>
  )
}
