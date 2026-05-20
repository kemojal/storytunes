/**
 * Browser/server client for the FastAPI business api.
 *
 * Auth: forward the better-auth session token as a Bearer token. The api
 * validates it against the shared `session` table (see api core/security.py).
 * On the server, get the token from the request; in the browser, better-auth
 * stores it in a cookie that the api can also read if same-site — prefer
 * passing it explicitly from loaders/server functions.
 */
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = opts
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!res.ok) {
    throw new ApiError(res.status, await res.text())
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
