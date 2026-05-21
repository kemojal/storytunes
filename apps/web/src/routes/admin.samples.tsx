import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  adminCreateSample,
  adminDeleteSample,
  fetchAdminSamples,
} from '#/lib/server/admin'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/admin/samples')({
  loader: () => fetchAdminSamples(),
  component: AdminSamples,
})

function AdminSamples() {
  const samples = Route.useLoaderData()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [busy, setBusy] = useState(false)

  async function create() {
    if (!title.trim() || !audioUrl.trim()) return
    setBusy(true)
    try {
      await adminCreateSample({ data: { title, audio_url: audioUrl } })
      setTitle('')
      setAudioUrl('')
      router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    setBusy(true)
    try {
      await adminDeleteSample({ data: id })
      router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Samples</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
        <div className="flex-1">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex-[2]">
          <label className="text-sm font-medium">Audio URL</label>
          <Input
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <Button
          onClick={create}
          disabled={busy || !title.trim() || !audioUrl.trim()}
        >
          Add sample
        </Button>
      </div>

      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-soft">
        {samples.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            No samples yet.
          </div>
        )}
        {samples.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.audio_url}</div>
            </div>
            <Button
              size="xs"
              variant="outline"
              disabled={busy}
              onClick={() => remove(s.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
