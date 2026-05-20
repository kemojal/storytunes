import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { adminCreateArtist, fetchAdminArtists } from '#/lib/server/admin'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/admin/artists')({
  loader: () => fetchAdminArtists(),
  component: AdminArtists,
})

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function AdminArtists() {
  const artists = Route.useLoaderData()
  const router = useRouter()
  const [name, setName] = useState('')
  const [voice, setVoice] = useState('')
  const [busy, setBusy] = useState(false)

  async function create() {
    if (!name.trim()) return
    setBusy(true)
    try {
      await adminCreateArtist({
        data: { name, slug: slugify(name), voice_description: voice || undefined },
      })
      setName('')
      setVoice('')
      router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Artists</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft">
        <div className="flex-1">
          <label className="text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Maya" />
        </div>
        <div className="flex-[2]">
          <label className="text-sm font-medium">Voice description</label>
          <Input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="Soft, warm…" />
        </div>
        <Button onClick={create} disabled={busy || !name.trim()}>
          Add artist
        </Button>
      </div>

      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-soft">
        {artists.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">No artists yet.</div>
        )}
        {artists.map((a) => (
          <div key={a.id} className="px-5 py-4">
            <div className="font-medium">{a.name}</div>
            <div className="text-xs text-muted-foreground">
              /{a.slug} {a.voice_description ? `· ${a.voice_description}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
