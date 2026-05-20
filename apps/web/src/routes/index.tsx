import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { MarketingShell } from '#/components/site/SiteNav'

export const Route = createFileRoute('/')({ component: Home })

const STEPS = [
  ['Tell us who it’s for', 'Recipient, occasion, and the relationship.'],
  ['Share the story', 'Memories, inside jokes, and the feeling you want.'],
  ['Choose the style', 'Artist, genre, mood, and length.'],
  ['We create the song', 'AI-assisted writing + human review and production.'],
  ['Receive & share', 'A private page to listen, download, and gift.'],
] as const

function Home() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Turn your story into a song they’ll never forget.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Share the memories. Choose the artist. We’ll create a custom song for
          someone you love.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/order">Create their song</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/samples">Listen to samples</Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold">How it works</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(([title, desc], i) => (
              <li key={title} className="rounded-xl border bg-background p-5">
                <div className="text-sm font-bold text-primary">Step {i + 1}</div>
                <div className="mt-2 font-medium">{title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </MarketingShell>
  )
}
