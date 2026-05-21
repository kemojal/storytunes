import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchSamples } from '#/lib/server/fns'
import { titleCase } from '#/lib/order/constants'
import { MarketingShell } from '#/components/site/SiteNav'
import { AudioPlayer } from '#/components/audio-player'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/samples')({
  loader: () => fetchSamples().catch(() => []),
  component: Samples,
})

// Reuse the realistic occasion photos as cover art (occasion slugs use hyphens).
function coverFor(occasion: string | null): string {
  if (!occasion) return '/samples/share-cover-default.png'
  return `/occasions/occasion-${occasion.replace(/_/g, '-')}.jpg`
}

function Samples() {
  const samples = Route.useLoaderData()
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl">Hear what “made for them” sounds like</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          A few songs we’ve crafted for real occasions. Yours won’t sound like
          any of these — it’ll sound like{' '}
          <em className="not-italic text-rose">your</em> story.
        </p>

        {samples.length === 0 ? (
          <p className="mt-12 text-muted-foreground">Samples coming soon.</p>
        ) : (
          <div className="mt-10 space-y-4">
            {samples.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-soft sm:p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={coverFor(s.occasion)}
                    alt=""
                    className="size-16 shrink-0 rounded-xl object-cover sm:size-20"
                    onError={(e) => {
                      ;(e.currentTarget).src =
                        '/samples/share-cover-default.png'
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-lg leading-tight">
                      {s.title}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[s.occasion && titleCase(s.occasion), s.artist_name]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    {s.description && (
                      <p className="mt-1 truncate text-sm text-muted-foreground/90">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>
                <AudioPlayer src={s.audio_url} className="mt-3" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 rounded-3xl border border-border/60 bg-card/60 p-8 text-center shadow-soft">
          <h2 className="font-display text-2xl">Imagine theirs playing here</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Five minutes of memories is all it takes to start.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full px-7">
            <Link to="/order">Create one like this</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  )
}
