import { createFileRoute, Link } from '@tanstack/react-router'
import { MarketingShell } from '#/components/site/SiteNav'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/how-it-works')({ component: HowItWorks })

const STEPS = [
  ['Tell us who the song is for', 'Recipient, nickname, relationship, and occasion.'],
  ['Share the story and memories', 'Guided prompts make it feel like writing a love letter.'],
  ['Choose the artist, genre, and mood', 'Pick a voice or let us match one to your story.'],
  ['We create the song', 'AI-assisted songwriting, human review, and production.'],
  ['You receive it', 'By email and a private share link — listen, download, share.'],
] as const

function HowItWorks() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">How it works</h1>
        <ol className="mt-10 space-y-6">
          {STEPS.map(([title, desc], i) => (
            <li key={title} className="flex gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </div>
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Some songs are created using a combination of AI-assisted tools, human
          songwriting, artist review, and production editing. Premium packages may
          include additional human performance and production work.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/order">Start your song</Link>
        </Button>
      </div>
    </MarketingShell>
  )
}
