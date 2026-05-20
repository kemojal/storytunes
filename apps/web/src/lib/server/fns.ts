import { createServerFn } from '@tanstack/react-start'
import { authedApiFetch, getServerSession, publicApiFetch } from './api'
import type {
  Artist,
  Order,
  OrderDetail,
  Revision,
  Sample,
  SessionUser,
  SharePage,
} from '#/lib/types'

export const fetchSharePage = createServerFn({ method: 'GET' })
  .inputValidator((token: string) => token)
  .handler(({ data }) => publicApiFetch<SharePage>(`/api/share/${data}`))

export const fetchArtists = createServerFn({ method: 'GET' }).handler(() =>
  publicApiFetch<Artist[]>('/api/artists'),
)

export const fetchSamples = createServerFn({ method: 'GET' }).handler(() =>
  publicApiFetch<Sample[]>('/api/samples'),
)

/** Current user (or null). Safe to call from beforeLoad guards. */
export const fetchSessionUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => {
    const session = await getServerSession()
    if (!session?.user) return null
    const u = session.user as SessionUser
    return { id: u.id, name: u.name, email: u.email, role: u.role ?? 'customer' }
  },
)

export const fetchMyOrders = createServerFn({ method: 'GET' }).handler(() =>
  authedApiFetch<Order[]>('/api/orders'),
)

export const fetchOrderDetail = createServerFn({ method: 'GET' })
  .inputValidator((orderId: string) => orderId)
  .handler(({ data }) => authedApiFetch<OrderDetail>(`/api/orders/${data}/detail`))

export const fetchDownloadUrl = createServerFn({ method: 'GET' })
  .inputValidator((fileId: string) => fileId)
  .handler(({ data }) =>
    authedApiFetch<{ url: string }>(`/api/files/${data}/download`),
  )

export const requestRevision = createServerFn({ method: 'POST' })
  .inputValidator((input: { orderId: string; revision_type: string; message: string }) => input)
  .handler(({ data }) =>
    authedApiFetch<Revision>(`/api/orders/${data.orderId}/revisions`, {
      method: 'POST',
      body: JSON.stringify({ revision_type: data.revision_type, message: data.message }),
    }),
  )
