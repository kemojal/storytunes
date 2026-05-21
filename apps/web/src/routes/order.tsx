import { createFileRoute, Outlet } from '@tanstack/react-router'

type OrderSearch = { artist?: string }

// Layout for /order and its children (/order/success). Renders the child route.
export const Route = createFileRoute('/order')({
  validateSearch: (s: Record<string, unknown>): OrderSearch => ({
    artist: typeof s.artist === 'string' ? s.artist : undefined,
  }),
  component: Outlet,
})
