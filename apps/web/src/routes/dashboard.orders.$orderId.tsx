import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  fetchDownloadUrl,
  fetchOrderDetail,
  requestRevision,
  startOrderCheckout,
} from '#/lib/server/fns'
import { StatusBadge, humanizeStatus } from '#/components/order/status'
import { formatUsd, titleCase } from '#/lib/order/constants'
import { AudioPlayer } from '#/components/audio-player'
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
  const [payError, setPayError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const latestLyrics = order.lyrics[0]
  const finals = order.files.filter((f) => f.is_final)
  const audioFile = finals.find(
    (f) => f.file_type === 'mp3' || f.file_type === 'wav',
  )
  const isDelivered = ['delivered', 'completed'].includes(order.status)
  const needsPayment = ['pending_payment', 'draft'].includes(order.status)
  const canRevise = ['delivered', 'completed'].includes(order.status)

  async function payNow() {
    setBusy(true)
    setPayError(null)
    try {
      const { url } = await startOrderCheckout({ data: order.id })
      if (url) window.location.href = url
      else setPayError('Checkout could not be created.')
    } catch (e) {
      setPayError(
        e instanceof Error && /api key/i.test(e.message)
          ? 'Payments aren’t configured (missing Stripe key).'
          : e instanceof Error
            ? e.message
            : 'Could not start checkout.',
      )
    } finally {
      setBusy(false)
    }
  }

  // Fetch a presigned URL for the final audio so it plays inline.
  useEffect(() => {
    let active = true
    if (audioFile) {
      fetchDownloadUrl({ data: audioFile.id }).then(
        ({ url }) => active && setAudioUrl(url),
        () => {},
      )
    }
    return () => {
      active = false
    }
  }, [audioFile?.id])

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

  const summary: Array<[string, string]> = [
    [
      'For',
      `${order.recipient_name}${order.relationship ? ` · ${titleCase(order.relationship)}` : ''}`,
    ],
    ['Occasion', titleCase(order.occasion)],
    ['Package', titleCase(order.package_type)],
    ['Delivery', order.delivery_speed === 'rush' ? 'Rush' : 'Standard'],
    ['Total', formatUsd(order.price_cents)],
    [
      'Est. delivery',
      order.expected_delivery_date
        ? new Date(order.expected_delivery_date).toLocaleDateString()
        : '—',
    ],
  ]

  return (
    <div className="space-y-7">
      {/* header */}
      <div>
        <Link
          to="/dashboard"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl">
            Song for {order.recipient_name}
          </h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.order_number} · {titleCase(order.occasion)} ·{' '}
          {formatUsd(order.price_cents)}
        </p>
      </div>

      {/* delivered hero OR in-production */}
      {isDelivered ? (
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-primary text-primary-foreground shadow-soft-lg">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">
              Your song is ready 🎵
            </p>
            <h2 className="mt-2 font-display text-2xl text-primary-foreground">
              {latestLyrics?.title ?? `For ${order.recipient_name}`}
            </h2>
            {audioUrl && <AudioPlayer src={audioUrl} className="mt-5" />}
            <div className="mt-5 flex flex-wrap gap-2">
              {finals.map((f) => (
                <Button
                  key={f.id}
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() => download(f.id)}
                >
                  ↓ {f.file_type.toUpperCase()}
                </Button>
              ))}
              {order.share_token && (
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                >
                  <Link to="/song/$token" params={{ token: order.share_token }}>
                    Open gift page →
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      ) : needsPayment ? (
        <section className="rounded-3xl border border-gold/40 bg-card/70 p-6 text-center shadow-soft sm:p-8">
          <h2 className="font-display text-xl">
            Almost there — complete your payment
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {order.recipient_name}’s song is ready to enter production as soon
            as payment is confirmed.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="font-display text-2xl">
              {formatUsd(order.price_cents)}
            </span>
            <Button
              onClick={payNow}
              disabled={busy}
              size="lg"
              className="rounded-full px-7"
            >
              {busy ? 'Redirecting…' : 'Complete payment →'}
            </Button>
          </div>
          {payError && (
            <p className="mt-3 text-sm text-destructive">{payError}</p>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-border/60 bg-card/70 p-6 text-center shadow-soft">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            ♪
          </div>
          <h2 className="mt-3 font-display text-xl">In production</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            We’re crafting {order.recipient_name}’s song — currently{' '}
            <span className="font-medium text-foreground">
              {humanizeStatus(order.status)}
            </span>
            . We’ll email you the moment it’s ready.
          </p>
        </section>
      )}

      {/* summary */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft sm:p-6">
        <h2 className="mb-3 font-display text-lg">Order details</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          {summary.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* lyrics */}
      {latestLyrics && (
        <section className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-lg">
            {latestLyrics.title ?? 'Lyrics'}
          </h2>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-foreground/80">
            {latestLyrics.lyrics_text}
          </pre>
        </section>
      )}

      {/* timeline */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 font-display text-lg">Progress</h2>
        {order.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Awaiting payment.</p>
        ) : (
          <ol className="relative space-y-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {order.events.map((e, i) => (
              <li key={e.id} className="relative flex items-start gap-4 pl-6">
                <span
                  className={`absolute left-0 top-1.5 size-2.5 rounded-full ${
                    i === order.events.length - 1
                      ? 'bg-gold ring-4 ring-gold/20'
                      : 'bg-border'
                  }`}
                />
                <div className="flex flex-1 justify-between gap-4 text-sm">
                  <span>{e.message ?? humanizeStatus(e.event_type)}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* request revision */}
      {canRevise && (
        <section className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-lg">Request a revision</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Want a tweak? Tell us and we’ll refine it.
          </p>
          <Textarea
            rows={3}
            className="mt-3"
            value={revMsg}
            placeholder="e.g. Could you mention our daughter’s name in the final chorus?"
            onChange={(e) => setRevMsg(e.target.value)}
          />
          <Button
            onClick={submitRevision}
            disabled={busy || !revMsg.trim()}
            className="mt-3 rounded-full"
          >
            {busy ? 'Sending…' : 'Submit request'}
          </Button>
        </section>
      )}
    </div>
  )
}
