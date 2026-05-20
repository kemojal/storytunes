import { cn } from '#/lib/utils'

export function humanizeStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const TONE: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_payment: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  revision_requested: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE[status] ?? 'bg-purple-100 text-purple-800',
      )}
    >
      {humanizeStatus(status)}
    </span>
  )
}
