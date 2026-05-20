import { createFileRoute, Link } from '@tanstack/react-router'
import { ADDONS, PACKAGES, formatUsd } from '#/lib/order/constants'
import { MarketingShell } from '#/components/site/SiteNav'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/pricing')({ component: Pricing })

function Pricing() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-center text-3xl font-semibold">Simple, gift-worthy pricing</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Choose the level of polish. Every song is original and made for them.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <div key={p.value} className="flex flex-col rounded-2xl border p-6">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <div className="mt-2 text-3xl font-bold">{formatUsd(p.priceCents)}</div>
              <p className="mt-1 text-xs text-muted-foreground">{p.blurb}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Button asChild className="mt-6">
                <Link to="/order">Choose {p.name}</Link>
              </Button>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-xl font-semibold">Add-ons</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ADDONS.map((a) => (
            <div key={a.value} className="flex justify-between rounded-lg border px-4 py-3 text-sm">
              <span>{a.label}</span>
              <span className="text-muted-foreground">+{formatUsd(a.priceCents)}</span>
            </div>
          ))}
        </div>
      </div>
    </MarketingShell>
  )
}
