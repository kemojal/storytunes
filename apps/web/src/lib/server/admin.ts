import { createServerFn } from '@tanstack/react-start'
import { authedApiFetch } from './api'
import type {
  Artist,
  DashboardStats,
  Lyrics,
  Order,
  OrderDetail,
  Revision,
  Sample,
} from '#/lib/types'

// ---- reads ----
export const fetchAdminDashboard = createServerFn({ method: 'GET' }).handler(
  () => authedApiFetch<DashboardStats>('/api/admin/dashboard'),
)

export const fetchAdminOrders = createServerFn({ method: 'GET' })
  .inputValidator((status: string | undefined) => status)
  .handler(({ data }) =>
    authedApiFetch<Order[]>(
      `/api/admin/orders${data ? `?status=${data}` : ''}`,
    ),
  )

export const fetchAdminOrder = createServerFn({ method: 'GET' })
  .inputValidator((orderId: string) => orderId)
  .handler(({ data }) =>
    authedApiFetch<OrderDetail>(`/api/admin/orders/${data}`),
  )

export const fetchAdminRevisions = createServerFn({ method: 'GET' }).handler(
  () => authedApiFetch<Revision[]>('/api/admin/revisions'),
)

// ---- order/production mutations ----
export const adminSetStatus = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: { orderId: string; status: string; message?: string }) => d,
  )
  .handler(({ data }) =>
    authedApiFetch<Order>(`/api/admin/orders/${data.orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: data.status, message: data.message }),
    }),
  )

export const adminAddNote = createServerFn({ method: 'POST' })
  .inputValidator((d: { orderId: string; message: string }) => d)
  .handler(({ data }) =>
    authedApiFetch<{ status: string }>(
      `/api/admin/orders/${data.orderId}/notes`,
      {
        method: 'POST',
        body: JSON.stringify({ message: data.message }),
      },
    ),
  )

export const adminGenerateBrief = createServerFn({ method: 'POST' })
  .inputValidator((orderId: string) => orderId)
  .handler(({ data }) =>
    authedApiFetch<{ status: string }>(
      `/api/admin/orders/${data}/generate-brief`,
      {
        method: 'POST',
      },
    ),
  )

export const adminGenerateLyrics = createServerFn({ method: 'POST' })
  .inputValidator((orderId: string) => orderId)
  .handler(({ data }) =>
    authedApiFetch<{ status: string }>(
      `/api/admin/orders/${data}/generate-lyrics`,
      {
        method: 'POST',
      },
    ),
  )

export const adminEditLyrics = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: {
      lyricsId: string
      lyrics_text?: string
      title?: string
      status?: string
    }) => d,
  )
  .handler(({ data }) =>
    authedApiFetch<Lyrics>(`/api/admin/lyrics/${data.lyricsId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        lyrics_text: data.lyrics_text,
        title: data.title,
        status: data.status,
      }),
    }),
  )

export const adminApproveLyrics = createServerFn({ method: 'POST' })
  .inputValidator((orderId: string) => orderId)
  .handler(({ data }) =>
    authedApiFetch<Order>(`/api/admin/orders/${data}/approve-lyrics`, {
      method: 'POST',
    }),
  )

export const adminDeliver = createServerFn({ method: 'POST' })
  .inputValidator((d: { orderId: string; message?: string }) => d)
  .handler(({ data }) =>
    authedApiFetch<Order>(`/api/admin/orders/${data.orderId}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ message: data.message }),
    }),
  )

// Presign an upload URL (client then PUTs bytes straight to R2).
export const adminPresignUpload = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: {
      orderId: string
      file_type: string
      file_name: string
      mime_type: string
      is_final: boolean
    }) => d,
  )
  .handler(({ data }) =>
    authedApiFetch<{
      upload_url: string
      storage_key: string
      file_id: string
    }>(`/api/files/orders/${data.orderId}/presign-upload`, {
      method: 'POST',
      body: JSON.stringify({
        file_type: data.file_type,
        file_name: data.file_name,
        mime_type: data.mime_type,
        is_final: data.is_final,
      }),
    }),
  )

// ---- revisions ----
export const adminUpdateRevision = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: { revisionId: string; status?: string; admin_notes?: string }) => d,
  )
  .handler(({ data }) =>
    authedApiFetch<Revision>(`/api/admin/revisions/${data.revisionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: data.status,
        admin_notes: data.admin_notes,
      }),
    }),
  )

// ---- artists ----
export const fetchAdminArtists = createServerFn({ method: 'GET' }).handler(() =>
  authedApiFetch<Artist[]>('/api/artists'),
)

export const adminCreateArtist = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: { name: string; slug: string; voice_description?: string }) => d,
  )
  .handler(({ data }) =>
    authedApiFetch<Artist>('/api/artists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  )

export const adminDeleteSample = createServerFn({ method: 'POST' })
  .inputValidator((sampleId: string) => sampleId)
  .handler(({ data }) =>
    authedApiFetch<void>(`/api/samples/${data}`, { method: 'DELETE' }),
  )

export const adminCreateSample = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: {
      title: string
      audio_url: string
      occasion?: string
      artist_name?: string
      description?: string
    }) => d,
  )
  .handler(({ data }) =>
    authedApiFetch<Sample>('/api/samples', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  )

export const fetchAdminSamples = createServerFn({ method: 'GET' }).handler(() =>
  authedApiFetch<Sample[]>('/api/samples'),
)
