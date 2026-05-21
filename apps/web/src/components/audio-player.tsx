import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { cn } from '#/lib/utils'

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/** Warm, branded audio player — replaces native <audio controls>. */
export function AudioPlayer({
  src,
  className,
}: {
  src: string
  className?: string
}) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)

  function toggle() {
    const a = ref.current
    if (!a) return
    if (a.paused) {
      void a.play()
      setPlaying(true)
    } else {
      a.pause()
      setPlaying(false)
    }
  }

  function seek(e: React.MouseEvent<HTMLButtonElement>) {
    const a = ref.current
    if (!a || !dur) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * dur
  }

  const pct = dur ? (cur / dur) * 100 : 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-full px-2.5 py-2 shadow-soft-lg premium-glass border border-border/40',
        className,
      )}
    >
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 hover:scale-105 hover:opacity-95 shadow-soft"
      >
        {playing ? (
          <Pause className="size-4 animate-pulse" />
        ) : (
          <Play className="size-4 translate-x-px" />
        )}
      </button>

      <div
        className={cn(
          'wave-visualizer-container shrink-0',
          playing && 'playing',
        )}
      >
        <div className="wave-visual-bar" />
        <div className="wave-visual-bar" />
        <div className="wave-visual-bar" />
        <div className="wave-visual-bar" />
        <div className="wave-visual-bar" />
        <div className="wave-visual-bar" />
      </div>

      <button
        type="button"
        onClick={seek}
        aria-label="Seek"
        className="group relative h-2 flex-1 cursor-pointer rounded-full bg-muted/60 transition-all hover:h-2.5"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gold transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
          style={{ left: `${pct}%` }}
        />
      </button>

      <span className="w-[4.5rem] shrink-0 text-right text-xs font-semibold tracking-wide tabular-nums text-muted-foreground">
        {fmt(cur)} / {fmt(dur)}
      </span>
    </div>
  )
}
