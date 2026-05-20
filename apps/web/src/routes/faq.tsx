import { createFileRoute } from '@tanstack/react-router'
import { MarketingShell } from '#/components/site/SiteNav'

export const Route = createFileRoute('/faq')({ component: Faq })

const QA = [
  ['How long does it take?', 'Typically 3–10 business days depending on the package. Rush delivery is available.'],
  ['Can I choose the artist?', 'Yes — pick a voice on the Artists page, or let us match one to your story.'],
  ['Can I mention their name?', 'Yes. You choose to use their real name, a nickname, or no name at all.'],
  ['Can I request changes?', 'Each package includes revisions. You can request more from your dashboard.'],
  ['Can I use the song commercially?', 'Personal use is included. Commercial licensing is available as an add-on.'],
  ['Can you copy a famous artist?', 'No. We create original songs and never imitate real artists, voices, or copyrighted music.'],
  ['What file formats do I receive?', 'MP3 for all packages; WAV on Premium or as an add-on. Lyric sheets available too.'],
  ['What happens after I order?', 'You pay securely, we confirm by email, and production begins right away.'],
] as const

function Faq() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Frequently asked questions</h1>
        <dl className="mt-10 space-y-8">
          {QA.map(([q, a]) => (
            <div key={q}>
              <dt className="font-medium">{q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </MarketingShell>
  )
}
