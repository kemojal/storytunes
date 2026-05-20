import { createFileRoute, Link } from '@tanstack/react-router'
import { ADDONS, PACKAGES, formatUsd } from '#/lib/order/constants'
import { MarketingShell } from '#/components/site/SiteNav'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/pricing')({ component: Pricing })

// Signature is the recommended sweet spot.
const POPULAR = 'signature'

function Pricing() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Pricing
        </p>
        <h1 className="mt-3 text-center text-4xl">A keepsake costs less than dinner out</h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Every package is a fully original song, written for one person and
          reviewed by a human. Pick how much polish and production you want.
        </p>

        <div className="mt-12 grid items-start gap-6 md:grid-cols-3">
          {PACKAGES.map((p) => {
            const popular = p.value === POPULAR
            return (
              <div
                key={p.value}
                className={cn(
                  'relative flex flex-col rounded-3xl border bg-card/70 p-6 shadow-soft',
                  popular ? 'border-gold ring-2 ring-gold/40 md:-mt-3 md:pb-8' : 'border-border/60',
                )}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary">
                    Most loved
                  </span>
                )}
                <h2 className="font-display text-xl">{p.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{formatUsd(p.priceCents)}</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-gold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={popular ? 'default' : 'outline'}
                  className="mt-6 rounded-full"
                >
                  <Link to="/order">Choose {p.name.split(' ')[0]}</Link>
                </Button>
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Not sure they’ll love it? Every package includes revisions — we’ll
          keep refining until it feels right.
        </p>

        {/* add-ons */}
        <div className="mt-16">
          <h2 className="text-center font-display text-2xl">Make it even more theirs</h2>
          <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
            {ADDONS.map((a) => (
              <div
                key={a.value}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-sm"
              >
                <span>{a.label}</span>
                <span className="font-medium text-muted-foreground">+{formatUsd(a.priceCents)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/order">Start your song</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  )
}
