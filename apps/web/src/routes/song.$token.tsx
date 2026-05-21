import { createFileRoute } from '@tanstack/react-router'
import { fetchSharePage } from '#/lib/server/fns'
import { titleCase } from '#/lib/order/constants'
import { AudioPlayer } from '#/components/audio-player'
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
  const audio = song.files.find(
    (f) => f.file_type === 'mp3' || f.file_type === 'wav',
  )

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:py-20">
      <div className="relative">
        <div className="ambient-glow-reflection" />
        <div className="rise-in overflow-hidden rounded-[1.75rem] border border-border/50 premium-glass text-center shadow-soft-lg">
          {/* gift header band */}
          <div className="relative overflow-hidden px-8 pt-10 pb-12 text-primary-foreground bg-primary">
            {/* Golden ambient gradient overlay inside the primary header band for a premium luster */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--gold),transparent_55%)] opacity-20" />

            <img
              src="/samples/share-cover-default.png"
              alt=""
              className="mx-auto mb-6 size-28 rounded-2xl object-cover shadow-soft-lg tilt-card-premium cursor-pointer transition-transform duration-500"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              A song for you · {titleCase(song.occasion)}
            </p>
            <h1 className="mt-3 font-display text-4.5xl leading-tight font-bold tracking-tight text-white drop-shadow-md">
              {song.title ?? `For ${song.recipient_name}`}
            </h1>
            <p className="mt-2 text-sm text-white/80 font-medium">
              Made for {song.recipient_name}
            </p>
          </div>

          <div className="px-6 pb-8 sm:px-8 bg-card/35">
            {audio && (
              <AudioPlayer src={audio.url} className="-mt-6 relative z-10" />
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {song.files.map((f) => (
                <Button
                  key={f.url}
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full shadow-soft hover:bg-primary/5 hover:text-primary transition-all duration-300 font-semibold border-border/50 px-4"
                >
                  <a href={f.url} target="_blank" rel="noreferrer">
                    ↓ {f.file_type.toUpperCase()}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {song.lyrics_text && (
        <div className="relative mt-8">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold/10 to-rose/10 blur-xl opacity-40" />
          <div className="relative rounded-2xl border border-border/50 bg-card/80 premium-glass p-6 shadow-soft sm:p-8">
            <h2 className="mb-5 text-center font-display text-2xl font-bold tracking-tight text-foreground/90">
              Lyrics
            </h2>
            <div className="max-h-[320px] overflow-y-auto px-4 py-2">
              <pre className="whitespace-pre-wrap text-center font-sans text-[15.5px] leading-relaxed tracking-wide text-foreground/85 font-medium">
                {song.lyrics_text}
              </pre>
            </div>
          </div>
        </div>
      )}

      <p className="mt-10 text-center text-xs font-semibold tracking-wider text-muted-foreground/60">
        MADE WITH CARE BY STORYTUNES ♪
      </p>
    </div>
  )
}
