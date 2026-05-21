import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchArtists } from '#/lib/server/fns'
import { MarketingShell } from '#/components/site/SiteNav'
import { ArtistCard } from '#/components/artist-card'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/artists')({
  loader: () => fetchArtists(),
  errorComponent: () => (
    <MarketingShell>
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl">We couldn’t load the artists</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh in a moment. (Developing? Make sure the API is running
          —<code> pnpm dev</code> starts it on <code>:8008</code>.)
        </p>
      </div>
    </MarketingShell>
  ),
  component: Artists,
})

function Artists() {
  const artists = Route.useLoaderData()
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-lg">
          <h1 className="text-4xl">The voice behind your song</h1>
          <p className="mt-3 text-muted-foreground">
            Every artist carries a different feeling. Pick the one that sounds
            like your story — or let us match you.
          </p>
        </div>

        {artists.length === 0 ? (
          <p className="mt-12 text-muted-foreground">Artists coming soon.</p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {artists.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/order">Start your song</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  )
}
