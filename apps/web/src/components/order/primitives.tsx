import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'

export function StepHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="space-y-1.5">
      <h2 className="font-display text-2xl tracking-tight sm:text-[1.7rem]">
        {title}
      </h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label?: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

/** A selectable pill. Use for single- or multi-select option grids. */
export function OptionChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-full border px-4 py-2 text-sm transition-all duration-150',
        selected
          ? 'border-primary bg-primary text-primary-foreground shadow-soft'
          : 'border-border bg-card text-foreground/80 hover:border-foreground/25 hover:bg-accent/50 hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

export function ChipGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}
