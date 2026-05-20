// Mirrors apps/api/app/models/business.py ORDER_STATUSES (PDD §12).
export const ORDER_STATUSES = [
  'draft',
  'pending_payment',
  'paid',
  'story_review',
  'lyrics_generation',
  'lyrics_review',
  'music_generation',
  'audio_review',
  'ready_for_delivery',
  'delivered',
  'revision_requested',
  'revision_in_progress',
  'completed',
  'cancelled',
  'refunded',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]
