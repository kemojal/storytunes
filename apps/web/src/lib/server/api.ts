/**
 * Server-only api proxy. Runs inside server functions / loaders.
 *
 * Authenticates the caller via better-auth (session cookie -> session token),
 * then forwards that token to the FastAPI api as a Bearer token. The api
 * validates it against the shared `session` table.
 */
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

const API_URL = process.env.API_URL ?? 'http://localhost:8000'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? ''

export async function getServerSession() {
  const req = getRequest()
  return auth.api.getSession({ headers: req.headers })
}

export async function authedApiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const session = await getServerSession()
  const token = session?.session.token
  if (!token) throw new Error('UNAUTHORIZED')

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`api ${res.status}: ${await res.text()}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** Public (no-auth) api reads — artists, samples, share page. */
export async function publicApiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`api ${res.status}`)
  return res.json() as Promise<T>
}

/** Admin-key api calls (used only by trusted server routes). */
export async function internalApiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-internal-key': INTERNAL_API_KEY,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`api ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}
