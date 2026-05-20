import { createFileRoute } from '@tanstack/react-router'
import { Wizard } from '#/components/order/Wizard'

export const Route = createFileRoute('/order')({ component: Wizard })
