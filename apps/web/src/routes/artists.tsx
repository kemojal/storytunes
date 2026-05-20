import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchArtists } from '#/lib/server/fns'
import { titleCase } from '#/lib/order/constants'
import { MarketingShell } from '#/components/site/SiteNav'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/artists')({
  loader: () => fetchArtists().catch(() => []),
  component: Artists,
})

function Artists() {
  const artists = Route.useLoaderData()
  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Meet the artists</h1>
        <p className="mt-2 text-muted-foreground">
          Each voice brings a different feeling. Pick one, or let us match you.
        </p>

        {artists.length === 0 ? (
          <p className="mt-10 text-muted-foreground">Artists coming soon.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((a) => (
              <div key={a.id} className="rounded-xl border p-6">
                <div className="size-16 rounded-full bg-muted" aria-hidden />
                <h2 className="mt-4 text-lg font-semibold">{a.name}</h2>
                {a.voice_description && (
                  <p className="mt-1 text-sm text-muted-foreground">{a.voice_description}</p>
                )}
                {a.best_for && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Best for: {a.best_for.map(titleCase).join(', ')}
                  </p>
                )}
                {a.genres && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Genres: {a.genres.map(titleCase).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Button asChild size="lg">
            <Link to="/order">Start your song</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  )
}
