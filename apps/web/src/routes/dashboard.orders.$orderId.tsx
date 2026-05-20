import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { fetchDownloadUrl, fetchOrderDetail, requestRevision } from '#/lib/server/fns'
import { StatusBadge, humanizeStatus } from '#/components/order/status'
import { formatUsd, titleCase } from '#/lib/order/constants'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'

export const Route = createFileRoute('/dashboard/orders/$orderId')({
  loader: ({ params }) => fetchOrderDetail({ data: params.orderId }),
  component: OrderDetailPage,
})

function OrderDetailPage() {
  const order = Route.useLoaderData()
  const router = useRouter()
  const [revMsg, setRevMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const latestLyrics = order.lyrics[0]
  const finals = order.files.filter((f) => f.is_final)
  const canRevise = ['delivered', 'completed'].includes(order.status)

  async function download(fileId: string) {
    const { url } = await fetchDownloadUrl({ data: fileId })
    window.open(url, '_blank')
  }

  async function submitRevision() {
    if (!revMsg.trim()) return
    setBusy(true)
    await requestRevision({
      data: { orderId: order.id, revision_type: 'minor', message: revMsg },
    })
    setRevMsg('')
    setBusy(false)
    router.invalidate()
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Back to orders
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Song for {order.recipient_name}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {order.order_number} · {titleCase(order.occasion)} · {formatUsd(order.price_cents)}
        </p>
      </div>

      {/* delivered files */}
      {finals.length > 0 && (
        <section className="space-y-3 rounded-xl border p-5">
          <h2 className="font-medium">Your song</h2>
          {order.share_token && (
            <Link
              to="/song/$token"
              params={{ token: order.share_token }}
              className="text-sm text-primary hover:underline"
            >
              Open private share page →
            </Link>
          )}
          <div className="flex flex-wrap gap-2">
            {finals.map((f) => (
              <Button key={f.id} variant="outline" size="sm" onClick={() => download(f.id)}>
                Download {f.file_type.toUpperCase()}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* lyrics */}
      {latestLyrics && (
        <section className="space-y-2 rounded-xl border p-5">
          <h2 className="font-medium">{latestLyrics.title ?? 'Lyrics'}</h2>
          <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
            {latestLyrics.lyrics_text}
          </pre>
        </section>
      )}

      {/* timeline */}
      <section className="space-y-3 rounded-xl border p-5">
        <h2 className="font-medium">Status timeline</h2>
        <ol className="space-y-2 text-sm">
          {order.events.length === 0 && (
            <li className="text-muted-foreground">Awaiting payment.</li>
          )}
          {order.events.map((e) => (
            <li key={e.id} className="flex justify-between gap-4">
              <span>{e.message ?? humanizeStatus(e.event_type)}</span>
              <span className="text-muted-foreground">
                {new Date(e.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* request revision */}
      {canRevise && (
        <section className="space-y-3 rounded-xl border p-5">
          <h2 className="font-medium">Request a revision</h2>
          <Textarea
            rows={3}
            value={revMsg}
            placeholder="What would you like changed?"
            onChange={(e) => setRevMsg(e.target.value)}
          />
          <Button onClick={submitRevision} disabled={busy || !revMsg.trim()}>
            {busy ? 'Sending…' : 'Submit request'}
          </Button>
        </section>
      )}
    </div>
  )
}
