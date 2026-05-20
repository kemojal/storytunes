// Shared response types mirroring the FastAPI api (apps/api/app/schemas).

export type Order = {
  id: string
  order_number: string
  status: string
  payment_status: string
  recipient_name: string
  relationship: string
  occasion: string
  package_type: string
  delivery_speed: string
  artist_id: string | null
  price_cents: number
  currency: string
  expected_delivery_date: string | null
  created_at: string
}

export type Lyrics = {
  id: string
  version: number
  title: string | null
  lyrics_text: string
  status: string
  generated_by: string | null
  created_at: string
}

export type FileRec = {
  id: string
  file_type: string
  file_name: string | null
  mime_type: string | null
  size_bytes: number | null
  version: number
  is_final: boolean
  created_at: string
}

export type OrderEventRec = {
  id: string
  event_type: string
  message: string | null
  created_at: string
}

export type OrderDetail = Order & {
  recipient_nickname: string | null
  occasion_date: string | null
  genre: string | null
  mood: string[] | null
  tempo: string | null
  song_length: string | null
  story: string | null
  share_token: string | null
  lyrics: Lyrics[]
  files: FileRec[]
  events: OrderEventRec[]
}

export type Revision = {
  id: string
  order_id: string
  revision_type: string | null
  message: string
  status: string
  admin_notes: string | null
  created_at: string
}

export type Artist = {
  id: string
  name: string
  slug: string
  bio: string | null
  image_url: string | null
  voice_description: string | null
  personality: string | null
  best_for: string[] | null
  genres: string[] | null
  sample_audio_url: string | null
  is_active: boolean
}

export type Sample = {
  id: string
  title: string
  occasion: string | null
  mood: string | null
  artist_name: string | null
  audio_url: string
  description: string | null
  is_active: boolean
}

export type SharePage = {
  order_number: string
  recipient_name: string
  occasion: string
  title: string | null
  lyrics_text: string | null
  files: Array<{ file_type: string; file_name: string | null; url: string }>
}

export type DashboardStats = {
  total_orders: number
  by_status: Record<string, number>
  revenue_cents: number
  open_revisions: number
}

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
}
