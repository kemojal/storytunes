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
    <div className="mx-auto max-w-xl px-4 py-14 sm:py-20">
      <div className="rise-in overflow-hidden rounded-[1.75rem] border border-border/60 bg-card text-center shadow-soft-lg">
        {/* gift header band */}
        <div className="bg-primary px-8 pt-10 pb-12 text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-70">
            A song for you · {titleCase(song.occasion)}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight">
            {song.title ?? `For ${song.recipient_name}`}
          </h1>
          <p className="mt-2 text-sm opacity-75">Made for {song.recipient_name}</p>
        </div>

        <div className="px-6 pb-8 sm:px-8">
          {audio && (
            <audio controls src={audio.url} className="-mt-6 w-full">
              <track kind="captions" />
            </audio>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {song.files.map((f) => (
              <Button key={f.url} asChild variant="outline" size="sm" className="rounded-full">
                <a href={f.url} target="_blank" rel="noreferrer">
                  ↓ {f.file_type.toUpperCase()}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {song.lyrics_text && (
        <div className="mt-6 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-soft sm:p-8">
          <h2 className="mb-4 text-center font-display text-xl">Lyrics</h2>
          <pre className="whitespace-pre-wrap text-center font-sans text-[15px] leading-relaxed text-foreground/80">
            {song.lyrics_text}
          </pre>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground/70">
        Made with care by StoryTunes ♪
      </p>
    </div>
  )
}
