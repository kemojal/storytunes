import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

const LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/artists', label: 'Artists' },
  { to: '/samples', label: 'Samples' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
] as const

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
            ♪
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">StoryTunes</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium [&.active]:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
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

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            ♪
          </span>
          <span className="font-display">StoryTunes</span>
        </div>
        <p className="text-sm text-muted-foreground">Turn memories into music.</p>
        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} StoryTunes · A custom song for someone you love
        </p>
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
