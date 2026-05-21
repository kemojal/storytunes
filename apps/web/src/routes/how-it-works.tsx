import { createFileRoute, Link } from '@tanstack/react-router'
import { MarketingShell } from '#/components/site/SiteNav'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/how-it-works')({ component: HowItWorks })

const STEPS = [
  [
    'Tell us who it’s for',
    'Their name (or nickname), your relationship, and the occasion. This sets the heart of the song.',
    'about 1 minute',
  ],
  [
    'Share the story',
    'Guided prompts pull out the memories, inside jokes, and the feeling you want — it’s like writing a love letter, not filling a form.',
    'about 4 minutes',
  ],
  [
    'Choose the sound',
    'Pick an artist’s voice, genre, and mood — or choose “Help me choose” and we’ll match one to your story.',
    'about 1 minute',
  ],
  [
    'We create it',
    'AI-assisted songwriting, a human review for heart and accuracy, then real production. Every song is original and quality-checked.',
    '3–10 days',
  ],
  [
    'Open the gift',
    'It arrives by email and a private share page — listen, download, and share. Revisions are included until it’s right.',
    'delivered',
  ],
] as const

function HowItWorks() {
  return (
    <MarketingShell>
      {/* header */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          How it works
        </p>
        <h1 className="mt-3 text-balance text-4xl sm:text-5xl">
          From a few memories to a song they’ll keep forever
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
          No musical skill needed. You bring the story — in about five minutes —
          and we craft an original, beautifully produced song around it.
        </p>
      </section>

      {/* steps */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <ol className="relative space-y-6 before:absolute before:left-[1.4375rem] before:top-3 before:bottom-3 before:w-px before:bg-border sm:space-y-7">
          {STEPS.map(([title, desc, meta], i) => (
            <li key={title} className="relative flex gap-5">
              <div className="z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground shadow-soft">
                {i + 1}
              </div>
              <div className="flex-1 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-lg">{title}</h2>
                  <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                    {meta}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* reassurance */}
      <section className="mx-auto max-w-3xl px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['100% original', 'Written for one person — never a template.'],
            [
              'Human-reviewed',
              'A person checks every song for heart and accuracy.',
            ],
            [
              'Revisions included',
              'We refine it until it feels exactly right.',
            ],
          ].map(([t, d]) => (
            <div
              key={t}
              className="rounded-2xl border border-border/60 bg-card/50 p-5 text-center"
            >
              <div className="font-display text-base">{t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI disclosure */}
      <section className="mx-auto max-w-3xl px-6 py-6">
        <p className="rounded-2xl border border-border/60 bg-muted/40 p-5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            A note on how songs are made:
          </span>{' '}
          we use a blend of AI-assisted tools, human songwriting, artist review,
          and production editing. Premium packages may include additional human
          performance and production. We never copy real artists or copyrighted
          music.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-6">
        <div className="rounded-3xl border border-border/60 bg-primary px-8 py-12 text-center text-primary-foreground shadow-soft-lg">
          <h2 className="text-3xl text-primary-foreground">Ready to begin?</h2>
          <p className="mx-auto mt-2 max-w-sm text-primary-foreground/75">
            Five minutes of memories is all it takes to start.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-6 rounded-full px-8"
          >
            <Link to="/order">Create their song</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  )
}
