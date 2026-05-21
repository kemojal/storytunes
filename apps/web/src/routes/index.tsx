import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { MarketingShell } from '#/components/site/SiteNav'
import { ArtistCard } from '#/components/artist-card'
import { fetchArtists } from '#/lib/server/fns'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const Route = createFileRoute('/')({
  // Never block the landing page on the api.
  loader: () => fetchArtists().catch(() => []),
  component: Home,
})

const MOMENTS = [
  [
    'Her name, in the chorus',
    'The first time she hears it, she goes quiet — then she replays it twice.',
  ],
  [
    'The memory he thought you forgot',
    'One small detail in a verse, and suddenly he’s back in that moment with you.',
  ],
  [
    'Played at the wedding',
    'Not a cover. Not a playlist. A song that didn’t exist until it was about them.',
  ],
] as const

const STEPS = [
  ['Tell us who it’s for', 'The person, the occasion, the bond between you.'],
  [
    'Share the story',
    'Guided prompts pull out the memories that matter — like writing a letter.',
  ],
  [
    'Choose the sound',
    'Pick a voice, genre, and mood, or let us match one to your story.',
  ],
  [
    'We create it',
    'AI-assisted writing, human review, real production — then quality-checked.',
  ],
  [
    'Open the gift',
    'A private page to listen, download, and share. Revisions included.',
  ],
] as const

const OCCASIONS: Array<[string, string]> = [
  ['Anniversary', 'anniversary'],
  ['Birthday', 'birthday'],
  ['Wedding', 'wedding'],
  ['Proposal', 'proposal'],
  ['Mother’s Day', 'mothers-day'],
  ['Father’s Day', 'fathers-day'],
  ['Long-distance', 'long-distance'],
  ['Friendship', 'friendship'],
]

function Home() {
  const artists = Route.useLoaderData()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      // 1. Hero entrance
      const tl = gsap.timeline({
        defaults: { ease: 'power4.out', duration: 1.1 },
      })
      tl.fromTo('.gsap-hero-badge', { opacity: 0, y: 15 }, { opacity: 1, y: 0, delay: 0.1 })
        .fromTo('.gsap-hero-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 1.3 }, '-=0.9')
        .fromTo('.gsap-hero-desc', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.1 }, '-=1.0')
        .fromTo(
          '.gsap-hero-btns',
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.9 },
          '-=0.9',
        )

      // 2. Parallax scale on hero artwork
      gsap.fromTo(
        '.gsap-hero-art',
        { scale: 1.05, y: 15 },
        {
          scale: 1,
          y: 0,
          scrollTrigger: {
            trigger: '.gsap-hero-art',
            start: 'top bottom',
            end: 'bottom center',
            scrub: 1,
          },
        },
      )

      // 3. Staggered fade in on reaction moment cards
      gsap.fromTo('.gsap-moment-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gsap-moments-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      // 4. Taipei demo section
      gsap.fromTo('.gsap-demo-card',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gsap-demo-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      // 5. How it works steps
      gsap.fromTo('.gsap-step-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-steps-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      // 6. Occasions grid
      gsap.fromTo('.gsap-occasion-card',
        { opacity: 0, scale: 0.95, y: 15 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-occasions-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      // 7. Meet the voices
      gsap.fromTo('.gsap-voice-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gsap-voices-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
      
      // Force scrolltrigger recalculation on initial mount to prevent misalignment
      ScrollTrigger.refresh()
    }, containerRef)

    return () => ctx.revert()
  }, [artists])

  return (
    <MarketingShell>
      <div ref={containerRef} className="overflow-hidden">
        {/* hero */}
        <section className="relative mx-auto max-w-3xl px-6 pt-20 pb-10 text-center sm:pt-28">
          <p className="gsap-hero-badge mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Custom songs · written for one person
          </p>
          <h1 className="gsap-hero-title text-balance text-4xl leading-[1.04] sm:text-6xl">
            Say what you’ve always meant to say —
            <br className="hidden sm:block" /> in a{' '}
            <em className="font-display not-italic text-rose">
              song just for them
            </em>
            .
          </h1>
          <p className="gsap-hero-desc mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            Share your story. We turn it into an original, beautifully produced
            song — the kind of gift they’ll keep forever and never see coming.
          </p>
          <div className="gsap-hero-btns mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/order">Create their song</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-7"
            >
              <Link to="/samples">Hear a sample first</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground/80">
            100% original · human-reviewed · revisions included · from $49
          </p>
        </section>

        {/* hero visual */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <div className="overflow-hidden rounded-3xl border border-border/60 shadow-soft-lg">
            <img
              src="/hero-art.webp"
              alt="A custom song, delivered like a gift"
              className="gsap-hero-art mx-auto w-full object-cover"
              loading="eager"
            />
          </div>
        </section>

        {/* emotional pitch */}
        <section className="mx-auto max-w-2xl px-6 py-10 text-center">
          <h2 className="text-3xl">Some feelings don’t fit in a card.</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Flowers wilt. Gift cards get spent. But the first time someone hears
            their own story sung back to them — that lands somewhere a present
            never reaches. That’s what we make.
          </p>
        </section>

        {/* reaction moments */}
        <section className="gsap-moments-grid mx-auto max-w-5xl px-6 py-12">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            The reaction you’re hoping for
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {MOMENTS.map(([title, body], i) => (
              <figure
                key={title}
                className="gsap-moment-card group relative overflow-hidden rounded-2xl border border-border/60 shadow-soft"
              >
                <img
                  src={`/moments/moment-${i + 1}.webp`}
                  alt=""
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <figcaption className="absolute inset-x-5 bottom-5 text-white">
                  <blockquote className="font-display text-xl leading-snug drop-shadow">
                    {title}
                  </blockquote>
                  <p className="mt-1.5 text-sm text-white/85 drop-shadow">
                    {body}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* paragraph -> song demo */}
        <section className="gsap-demo-section mx-auto max-w-4xl px-6 py-12">
          <div className="grid items-stretch gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-soft sm:grid-cols-2 sm:p-8">
            <div className="gsap-demo-card">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                You write a few lines
              </p>
              <p className="mt-3 text-pretty text-muted-foreground">
                “We met in a tiny café in Taipei, hid from the rain, split a
                mango smoothie. Five years later she still calls me stubborn.”
              </p>
            </div>
            <div className="gsap-demo-card rounded-2xl bg-primary p-6 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
                We write the song
              </p>
              <p className="mt-3 font-display text-[15px] leading-relaxed">
                “Taipei rain, a mango afternoon —<br />
                five years on, still humming our tune.
                <br />
                Call me stubborn, I’ll stay right here…”
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No musical skill needed. Just the memories — we do the rest.
          </p>
        </section>

        {/* how it works */}
        <section className="gsap-steps-section mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-center text-3xl">
            From your story to their song
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-muted-foreground">
            Five simple steps. It feels less like a form, more like writing a
            love letter.
          </p>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(([title, desc], i) => (
              <li
                key={title}
                className="gsap-step-card rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <img
                  src={`/icons/step-${i + 1}.svg`}
                  alt=""
                  className="size-9"
                />
                <div className="mt-4 font-medium">{title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* occasions */}
        <section className="gsap-occasions-section mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-center text-2xl">
            Perfect for the moments that matter
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {OCCASIONS.map(([label, slug]) => (
              <Link
                key={slug}
                to="/order"
                className="gsap-occasion-card group relative block overflow-hidden rounded-2xl border border-border/60 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/50"
              >
                <img
                  src={`/occasions/occasion-${slug}.jpg`}
                  alt=""
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-3 px-2 text-center font-display text-base text-white drop-shadow">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* artists */}
        {artists.length > 0 && (
          <section className="gsap-voices-section mx-auto max-w-6xl px-6 py-12">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl">Meet the voices</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick the one that sounds like your story.
                </p>
              </div>
              <Link
                to="/artists"
                className="shrink-0 text-sm font-medium text-foreground hover:text-rose"
              >
                See all →
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
              {artists.slice(0, 4).map((a) => (
                <div key={a.id} className="gsap-voice-card">
                  <ArtistCard artist={a} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* guarantee strip */}
        <section className="mx-auto max-w-4xl px-6 py-10">
          <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/50 p-6 text-center text-sm sm:grid-cols-3">
            <div>
              <div className="font-display text-lg">Made for them, only</div>
              <p className="mt-1 text-muted-foreground">
                Original lyrics & music — never a template.
              </p>
            </div>
            <div>
              <div className="font-display text-lg">Loved, or revised</div>
              <p className="mt-1 text-muted-foreground">
                Every package includes revisions until it’s right.
              </p>
            </div>
            <div>
              <div className="font-display text-lg">In time for the date</div>
              <p className="mt-1 text-muted-foreground">
                Standard 3–10 days, with rush delivery available.
              </p>
            </div>
          </div>
        </section>

        {/* closing CTA */}
        <section className="mx-auto max-w-3xl px-6 pb-8">
          <div className="rounded-3xl border border-border/60 bg-primary px-8 py-14 text-center text-primary-foreground shadow-soft-lg">
            <h2 className="text-balance text-3xl text-primary-foreground sm:text-4xl">
              Give them a song that could only have been written for them.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/75">
              It takes about five minutes to start. The moment they hear it
              lasts a lot longer.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-7 rounded-full px-8"
            >
              <Link to="/order">Create their song</Link>
            </Button>
          </div>
        </section>
      </div>
    </MarketingShell>
  )
}
