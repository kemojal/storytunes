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
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold">
          StoryTunes
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">My orders</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/order">Create their song</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
        StoryTunes — turn memories into music. © {new Date().getFullYear()}
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
