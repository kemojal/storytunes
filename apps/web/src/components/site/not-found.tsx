import { Link } from '@tanstack/react-router'
import { MarketingShell } from '#/components/site/SiteNav'
import { Button } from '#/components/ui/button'

export function NotFound() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <div className="font-display text-6xl text-rose">404</div>
        <h1 className="mt-4 text-2xl">This page wandered off-key</h1>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist — but a song still can.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button asChild className="rounded-full px-6">
            <Link to="/">Back home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link to="/order">Create a song</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  )
}
