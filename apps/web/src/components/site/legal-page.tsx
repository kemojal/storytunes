import type { ReactNode } from 'react'
import { MarketingShell } from '#/components/site/SiteNav'

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:mt-8 prose-h2:text-xl prose-a:text-rose">
          {children}
        </div>
      </div>
    </MarketingShell>
  )
}
