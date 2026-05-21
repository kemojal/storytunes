import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  adminAddNote,
  adminApproveLyrics,
  adminDeliver,
  adminEditLyrics,
  adminGenerateBrief,
  adminGenerateLyrics,
  adminPresignUpload,
  adminSetStatus,
  fetchAdminOrder,
} from '#/lib/server/admin'
import { ORDER_STATUSES } from '#/lib/order/statuses'
import { StatusBadge, humanizeStatus } from '#/components/order/status'
import { formatUsd, titleCase } from '#/lib/order/constants'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'

export const Route = createFileRoute('/admin/orders/$orderId')({
  loader: ({ params }) => fetchAdminOrder({ data: params.orderId }),
  component: AdminOrderDetail,
})

function AdminOrderDetail() {
  const order = Route.useLoaderData()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const latest = order.lyrics[0]
  const [lyricsText, setLyricsText] = useState(latest?.lyrics_text ?? '')
  const [lyricsTitle, setLyricsTitle] = useState(latest?.title ?? '')
  const [note, setNote] = useState('')

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key)
    try {
      await fn()
      router.invalidate()
    } finally {
      setBusy(null)
    }
  }

  async function uploadFinal(file: File) {
    const type = file.name.endsWith('.wav')
      ? 'wav'
      : file.name.endsWith('.pdf')
        ? 'lyrics_pdf'
        : 'mp3'
    setBusy('upload')
    try {
      const { upload_url } = await adminPresignUpload({
        data: {
          orderId: order.id,
          file_type: type,
          file_name: file.name,
          mime_type: file.type || 'application/octet-stream',
          is_final: true,
        },
      })
      await fetch(upload_url, {
        method: 'PUT',
        headers: { 'content-type': file.type || 'application/octet-stream' },
        body: file,
      })
      router.invalidate()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* main */}
      <div className="space-y-6 lg:col-span-2">
        <div>
          <Link
            to="/admin/orders"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All orders
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="font-display text-2xl">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            For {order.recipient_name} ({titleCase(order.relationship)}) ·{' '}
            {titleCase(order.occasion)} · {order.package_type} ·{' '}
            {formatUsd(order.price_cents)} · {order.payment_status}
          </p>
        </div>

        {/* brief / story */}
        <section className="space-y-2 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
          <h2 className="font-display text-lg">Story</h2>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {order.story || '—'}
          </p>
          <div className="text-xs text-muted-foreground">
            Genre: {order.genre ?? '—'} · Mood:{' '}
            {(order.mood ?? []).join(', ') || '—'} · Tempo: {order.tempo ?? '—'}
          </div>
        </section>

        {/* lyrics editor */}
        <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">
              Lyrics {latest ? `(v${latest.version}, ${latest.status})` : ''}
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busy !== null}
                onClick={() =>
                  run('brief', () => adminGenerateBrief({ data: order.id }))
                }
              >
                {busy === 'brief' ? '…' : 'Generate brief'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy !== null}
                onClick={() =>
                  run('genlyrics', () =>
                    adminGenerateLyrics({ data: order.id }),
                  )
                }
              >
                {busy === 'genlyrics' ? '…' : 'Generate lyrics'}
              </Button>
            </div>
          </div>

          {latest ? (
            <>
              <input
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                placeholder="Song title"
                value={lyricsTitle}
                onChange={(e) => setLyricsTitle(e.target.value)}
              />
              <Textarea
                rows={10}
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={busy !== null}
                  onClick={() =>
                    run('savelyrics', () =>
                      adminEditLyrics({
                        data: {
                          lyricsId: latest.id,
                          lyrics_text: lyricsText,
                          title: lyricsTitle,
                        },
                      }),
                    )
                  }
                >
                  Save lyrics
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy !== null}
                  onClick={() =>
                    run('approve', () => adminApproveLyrics({ data: order.id }))
                  }
                >
                  Approve lyrics
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No lyrics yet. Generate to start.
            </p>
          )}
        </section>

        {/* files */}
        <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
          <h2 className="font-display text-lg">Files</h2>
          {order.files.length === 0 && (
            <p className="text-sm text-muted-foreground">No files uploaded.</p>
          )}
          <ul className="space-y-1 text-sm">
            {order.files.map((f) => (
              <li key={f.id} className="flex justify-between">
                <span>
                  {f.file_name}{' '}
                  <span className="text-muted-foreground">({f.file_type})</span>
                </span>
                {f.is_final && <span className="text-green-700">final</span>}
              </li>
            ))}
          </ul>
          <label className="inline-block">
            <span className="sr-only">Upload final file</span>
            <input
              type="file"
              className="text-sm"
              disabled={busy === 'upload'}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadFinal(file)
              }}
            />
          </label>
          <div>
            <Button
              disabled={busy !== null}
              onClick={() =>
                run('deliver', () =>
                  adminDeliver({ data: { orderId: order.id } }),
                )
              }
            >
              {busy === 'deliver' ? 'Delivering…' : 'Deliver to customer'}
            </Button>
          </div>
        </section>
      </div>

      {/* sidebar */}
      <div className="space-y-6">
        <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
          <h2 className="font-display text-lg">Status</h2>
          <select
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            value={order.status}
            disabled={busy !== null}
            onChange={(e) =>
              run('status', () =>
                adminSetStatus({
                  data: { orderId: order.id, status: e.target.value },
                }),
              )
            }
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanizeStatus(s)}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
          <h2 className="font-display text-lg">Internal notes</h2>
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            size="sm"
            disabled={busy !== null || !note.trim()}
            onClick={() =>
              run('note', async () => {
                await adminAddNote({
                  data: { orderId: order.id, message: note },
                })
                setNote('')
              })
            }
          >
            Add note
          </Button>
        </section>

        <section className="space-y-2 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
          <h2 className="font-display text-lg">Timeline</h2>
          <ol className="space-y-1 text-xs">
            {order.events.map((e) => (
              <li key={e.id} className="flex justify-between gap-2">
                <span>{e.message ?? humanizeStatus(e.event_type)}</span>
                <span className="text-muted-foreground">
                  {new Date(e.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
