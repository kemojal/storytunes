import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { useEffect, useState } from 'react'
import { cn } from '#/lib/utils'

const LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/artists', label: 'Artists' },
  { to: '/samples', label: 'Samples' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
] as const

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-500 ease-out border-b',
        scrolled
          ? 'h-14 bg-background/80 backdrop-blur-xl border-border/60 shadow-soft'
          : 'h-20 bg-transparent border-transparent',
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <img
            src="/logo-mark.svg"
            alt=""
            className="size-8 rounded-lg shadow-soft transition-transform group-hover:scale-105"
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            StoryTunes
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="nav-link-premium text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium [&.active]:text-foreground py-1"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link to="/dashboard">My orders</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to="/order">Create their song</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

const FOOTER_EXPLORE = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/artists', label: 'Artists' },
  { to: '/samples', label: 'Samples' },
  { to: '/pricing', label: 'Pricing' },
] as const

const FOOTER_SUPPORT = [
  { to: '/faq', label: 'FAQ' },
  { to: '/dashboard', label: 'My orders' },
  { to: '/order', label: 'Start a song' },
] as const

const FOOTER_LEGAL = [
  { to: '/terms', label: 'Terms of Service' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/refund', label: 'Refund Policy' },
] as const

function FooterCol({
  title,
  links,
}: {
  title: string
  links: ReadonlyArray<{ to: string; label: string }>
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-mark.svg" alt="" className="size-7 rounded-lg" />
              <span className="font-display text-lg font-semibold">
                StoryTunes
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Turn your story into a song they’ll never forget.
            </p>
            <Button asChild size="sm" className="mt-5 rounded-full px-5">
              <Link to="/order">Create their song</Link>
            </Button>
          </div>

          <FooterCol title="Explore" links={FOOTER_EXPLORE} />
          <FooterCol title="Support" links={FOOTER_SUPPORT} />

          <FooterCol title="Legal" links={FOOTER_LEGAL} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} StoryTunes — a custom song for someone
            you love.
          </span>
          <span>Made with care ♪</span>
        </div>
      </div>
    </footer>
  )
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
