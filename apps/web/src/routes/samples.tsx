import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchSamples } from '#/lib/server/fns'
import { titleCase } from '#/lib/order/constants'
import { MarketingShell } from '#/components/site/SiteNav'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/samples')({
  loader: () => fetchSamples().catch(() => []),
  component: Samples,
})

function Samples() {
  const samples = Route.useLoaderData()
  return (
    <MarketingShell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Listen to samples</h1>
        <p className="mt-2 text-muted-foreground">
          A few songs we’ve created. Yours will be written just for them.
        </p>

        {samples.length === 0 ? (
          <p className="mt-10 text-muted-foreground">Samples coming soon.</p>
        ) : (
          <div className="mt-10 space-y-4">
            {samples.map((s) => (
              <div key={s.id} className="rounded-xl border p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">{s.title}</h2>
                  <span className="text-xs text-muted-foreground">
                    {[s.occasion && titleCase(s.occasion), s.artist_name].filter(Boolean).join(' · ')}
                  </span>
                </div>
                {s.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                )}
                <audio controls src={s.audio_url} className="mt-3 w-full">
                  <track kind="captions" />
                </audio>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Button asChild size="lg">
            <Link to="/order">Create one like this</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  )
}
