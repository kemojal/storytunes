import { createFileRoute } from '@tanstack/react-router'
import { fetchSharePage } from '#/lib/server/fns'
import { titleCase } from '#/lib/order/constants'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/song/$token')({
  loader: ({ params }) => fetchSharePage({ data: params.token }),
  errorComponent: () => (
    <div className="mx-auto mt-24 max-w-md text-center text-muted-foreground">
      This song link is invalid or has expired.
    </div>
  ),
  component: SharePageView,
})

function SharePageView() {
  const song = Route.useLoaderData()
  const audio = song.files.find((f) => f.file_type === 'mp3' || f.file_type === 'wav')

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          {titleCase(song.occasion)}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {song.title ?? `A song for ${song.recipient_name}`}
        </h1>
        <p className="mt-1 text-muted-foreground">For {song.recipient_name}</p>

        {audio && (
          <audio controls src={audio.url} className="mx-auto mt-6 w-full">
            <track kind="captions" />
          </audio>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {song.files.map((f) => (
            <Button key={f.url} asChild variant="outline" size="sm">
              <a href={f.url} target="_blank" rel="noreferrer">
                Download {f.file_type.toUpperCase()}
              </a>
            </Button>
          ))}
        </div>
      </div>

      {song.lyrics_text && (
        <div className="mt-8 rounded-xl border p-6">
          <h2 className="mb-3 font-medium">Lyrics</h2>
          <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
            {song.lyrics_text}
          </pre>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Made with care by StoryTunes 🎵
      </p>
    </div>
  )
}
