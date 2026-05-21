import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/site/legal-page'

export const Route = createFileRoute('/refund')({ component: Refund })

function Refund() {
  return (
    <LegalPage title="Refund & Revision Policy" updated="May 2026">
      <p>
        We want you to love your song. Because each one is custom-made, here's how
        refunds and revisions work.
      </p>
      <h2>Revisions</h2>
      <p>
        Every package includes revisions. Request them from your order page and
        we'll refine the lyrics or production until it feels right. Major changes
        (new genre, full rewrite) may require an additional fee.
      </p>
      <ul>
        <li>Starter: one minor lyric revision.</li>
        <li>Signature: one revision.</li>
        <li>Premium: two revisions.</li>
      </ul>
      <h2>Refunds</h2>
      <p>
        Before production begins, you can cancel for a full refund. Once we've
        started writing, refunds are assessed case by case — we'll always try to
        make it right with revisions first.
      </p>
      <p>
        If we cannot deliver a song that meets our quality standard, we'll refund
        you in full.
      </p>
      <h2>Contact</h2>
      <p>Need help? Email support@storytunes.example.</p>
    </LegalPage>
  )
}
