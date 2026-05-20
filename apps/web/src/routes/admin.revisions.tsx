import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { adminUpdateRevision, fetchAdminRevisions } from '#/lib/server/admin'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/admin/revisions')({
  loader: () => fetchAdminRevisions(),
  component: AdminRevisions,
})

const NEXT_STATUS = ['requested', 'approved', 'in_progress', 'completed', 'declined']

function AdminRevisions() {
  const revisions = Route.useLoaderData()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function setStatus(revisionId: string, status: string) {
    setBusy(revisionId)
    try {
      await adminUpdateRevision({ data: { revisionId, status } })
      router.invalidate()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Revisions</h1>

      {revisions.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          No revision requests.
        </div>
      ) : (
        <div className="space-y-3">
          {revisions.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <Link
                  to="/admin/orders/$orderId"
                  params={{ orderId: r.order_id }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Order {r.order_id.slice(0, 8)}…
                </Link>
                <span className="text-xs text-muted-foreground">
                  {r.revision_type} · {r.status}
                </span>
              </div>
              <p className="mt-2 text-sm">{r.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {NEXT_STATUS.map((s) => (
                  <Button
                    key={s}
                    size="xs"
                    variant={r.status === s ? 'default' : 'outline'}
                    disabled={busy === r.id}
                    onClick={() => setStatus(r.id, s)}
                  >
                    {s.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
