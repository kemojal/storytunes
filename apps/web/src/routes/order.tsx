import { createFileRoute } from '@tanstack/react-router'
import { Wizard } from '#/components/order/Wizard'

type OrderSearch = { artist?: string }

export const Route = createFileRoute('/order')({
  validateSearch: (s: Record<string, unknown>): OrderSearch => ({
    artist: typeof s.artist === 'string' ? s.artist : undefined,
  }),
  component: Wizard,
})
