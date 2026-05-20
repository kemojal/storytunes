import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { MarketingShell } from '#/components/site/SiteNav'

export const Route = createFileRoute('/')({ component: Home })

const STEPS = [
  ['Tell us who it’s for', 'Recipient, occasion, and your relationship.'],
  ['Share the story', 'Memories, inside jokes, and the feeling you want.'],
  ['Choose the style', 'Artist, genre, mood, and length.'],
  ['We create the song', 'AI-assisted writing, human review, real production.'],
  ['Receive & share', 'A private page to listen, download, and gift.'],
] as const

const OCCASIONS = [
  'Anniversary', 'Birthday', 'Wedding', 'Proposal',
  'Mother’s Day', 'Father’s Day', 'Friendship', 'Just because',
] as const

function Home() {
  return (
    <MarketingShell>
      {/* hero */}
      <section className="relative mx-auto max-w-3xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <p className="rise-in mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Custom songs · made for one person
        </p>
        <h1 className="rise-in text-balance text-4xl leading-[1.05] sm:text-6xl">
          Turn your story into a song
          <br className="hidden sm:block" />{' '}
          they’ll <em className="font-display not-italic text-rose">never forget</em>.
        </h1>
        <p className="rise-in mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
          Share the memories. Choose the artist. We’ll craft a personal, original
          song for someone you love — delivered like a gift.
        </p>
        <div className="rise-in mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link to="/order">Create their song</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-7">
            <Link to="/samples">Listen to samples</Link>
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground/80">
          From $49 · delivered in 3–10 days · 100% original
        </p>
      </section>

      {/* occasions */}
      <section className="mx-auto max-w-3xl px-6 pb-10">
        <div className="flex flex-wrap justify-center gap-2">
          {OCCASIONS.map((o) => (
            <span
              key={o}
              className="rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-sm text-muted-foreground"
            >
              {o}
            </span>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-3xl">How it works</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-muted-foreground">
          It feels less like a form and more like writing a love letter.
        </p>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(([title, desc], i) => (
            <li
              key={title}
              className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                {i + 1}
              </div>
              <div className="mt-4 font-medium">{title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* closing CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-8">
        <div className="rounded-3xl border border-border/60 bg-primary px-8 py-12 text-center text-primary-foreground shadow-soft-lg">
          <h2 className="text-3xl text-primary-foreground">
            Give them a song that could only be written for them.
          </h2>
          <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full px-7">
            <Link to="/order">Start your song</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  )
}
