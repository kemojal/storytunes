import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { MarketingShell } from '#/components/site/SiteNav'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/faq')({ component: Faq })

const GROUPS: Array<{ heading: string; items: Array<[string, string]> }> = [
  {
    heading: 'Before you order',
    items: [
      [
        'How long does it take?',
        'Typically 3–10 business days depending on the package. Need it sooner? Rush delivery is available as an add-on.',
      ],
      [
        'Can I choose the artist?',
        'Yes — browse voices on the Artists page and pick one, or choose “Help me choose” and we’ll match a voice to your story.',
      ],
      [
        'Can I mention their name?',
        'Absolutely. You decide whether to use their real name, a nickname, or no name at all.',
      ],
      [
        'What happens after I order?',
        'You pay securely, we email a confirmation right away, and production begins. You’ll get an email the moment your song is ready.',
      ],
    ],
  },
  {
    heading: 'Your song',
    items: [
      [
        'Can I request changes?',
        'Yes. Every package includes revisions, and you can request them right from your dashboard until it feels right.',
      ],
      [
        'Can you copy a famous artist?',
        'No — every song is 100% original. We never imitate real artists, voices, or copyrighted music. That’s what makes it truly theirs.',
      ],
      [
        'Do I need any musical skill?',
        'None at all. You share the memories in plain words; we handle the lyrics, melody, and production.',
      ],
    ],
  },
  {
    heading: 'Delivery & rights',
    items: [
      [
        'What file formats do I receive?',
        'MP3 for every package; WAV on Premium or as an add-on. Lyric sheets and a private share page are available too.',
      ],
      [
        'Can I use the song commercially?',
        'Personal use is included. Commercial licensing is available as an add-on if you need it.',
      ],
      [
        'How is it delivered?',
        'By email and a private share page where you can listen, download, and share the song like a gift.',
      ],
    ],
  },
]

function Faq() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          FAQ
        </p>
        <h1 className="mt-3 text-center text-4xl">
          Good questions. Honest answers.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
          Everything you need to know before you gift a song.
        </p>

        <div className="mt-12 space-y-10">
          {GROUPS.map((group) => (
            <section key={group.heading}>
              <h2 className="mb-3 font-display text-xl">{group.heading}</h2>
              <div className="space-y-2.5">
                {group.items.map(([q, a]) => (
                  <details
                    key={q}
                    className="group rounded-2xl border border-border/60 bg-card/60 px-5 shadow-soft transition-colors open:bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                      {q}
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-border/60 bg-primary p-8 text-center text-primary-foreground shadow-soft-lg">
          <h2 className="font-display text-2xl text-primary-foreground">
            Still thinking it over?
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-primary-foreground/75">
            The hardest part is starting. Five minutes of memories is all it
            takes — we’ll handle the music.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-6 rounded-full px-7"
          >
            <Link to="/order">Create their song</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  )
}
