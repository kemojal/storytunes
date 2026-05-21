import { Link } from '@tanstack/react-router'
import { titleCase } from '#/lib/order/constants'
import type { Artist } from '#/lib/types'

/** Full-bleed portrait card. Tapping it preselects the artist in the wizard. */
export function ArtistCard({ artist: a }: { artist: Artist }) {
  return (
    <Link to="/order" search={{ artist: a.slug }} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-soft">
        <img
          src={a.image_url ?? `/artists/${a.slug}.png`}
          alt={a.name}
          className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            ;(e.currentTarget).src = '/logo-mark.svg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 text-white">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold text-primary shadow-soft transition-transform group-hover:scale-110">
              ▶
            </span>
            <span className="font-display text-base leading-tight drop-shadow">
              {a.name}
            </span>
          </div>
          {a.genres && (
            <p className="mt-1.5 truncate text-[11px] text-white/80">
              {a.genres.slice(0, 3).map(titleCase).join(' · ')}
            </p>
          )}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          Choose →
        </span>
      </div>
    </Link>
  )
}
