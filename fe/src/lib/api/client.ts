const BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? ''

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  })

  const json = await res.json().catch(() => ({ status: res.status, message: res.statusText, data: null }))

  if (!res.ok) {
    throw new ApiError(res.status, json.message ?? res.statusText)
  }

  return (json as { data: T }).data
}
