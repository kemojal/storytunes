import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchMyOrders } from '#/lib/server/fns'
import { formatUsd } from '#/lib/order/constants'
import { StatusBadge } from '#/components/order/status'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/dashboard/')({
  loader: () => fetchMyOrders(),
  component: MyOrders,
})

function MyOrders() {
  const orders = Route.useLoaderData()

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">My orders</h1>
        <Button asChild className="rounded-full">
          <Link to="/order">+ New song</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-border/60 bg-card/70 p-12 text-center shadow-soft">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-xl text-accent-foreground">
            ♪
          </div>
          <p className="mt-4 font-display text-xl">No songs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your first custom song is a few minutes away.
          </p>
          <Button asChild className="mt-6 rounded-full px-6">
            <Link to="/order">Create your first song</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to="/dashboard/orders/$orderId"
              params={{ orderId: o.id }}
              className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-5 py-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/50"
            >
              <div>
                <div className="font-medium">For {o.recipient_name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {o.order_number} · {o.occasion}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{formatUsd(o.price_cents)}</span>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
