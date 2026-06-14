import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiError, apiFetch } from '@/lib/api/client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

function makeResponse(body: unknown, ok: boolean, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
  }
}

describe('ApiError', () => {
  it('stores status and message', () => {
    const err = new ApiError(404, 'Not found')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Not found')
    expect(err.name).toBe('ApiError')
    expect(err instanceof ApiError).toBe(true)
    expect(err instanceof Error).toBe(true)
  })
})

describe('apiFetch', () => {
  it('returns data from successful response', async () => {
    mockFetch.mockResolvedValue(makeResponse({ status: 200, message: 'OK', data: { id: 1 } }, true))
    const result = await apiFetch<{ id: number }>('/api/test')
    expect(result).toEqual({ id: 1 })
  })

  it('attaches Authorization header when token exists', async () => {
    localStorage.setItem('accessToken', 'my-token')
    mockFetch.mockResolvedValue(makeResponse({ data: null }, true))
    await apiFetch('/api/test')
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token')
  })

  it('omits Authorization header when no token', async () => {
    mockFetch.mockResolvedValue(makeResponse({ data: null }, true))
    await apiFetch('/api/test')
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('throws ApiError on non-ok response', async () => {
    mockFetch.mockResolvedValue(makeResponse({ message: 'Not found' }, false, 404))
    await expect(apiFetch('/api/test')).rejects.toThrow(ApiError)
  })

  it('throws ApiError with correct status', async () => {
    mockFetch.mockResolvedValue(makeResponse({ message: 'Conflict' }, false, 409))
    try {
      await apiFetch('/api/test')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).status).toBe(409)
    }
  })

  it('handles json parse failure gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => Promise.reject(new Error('invalid json')),
    })
    await expect(apiFetch('/api/test')).rejects.toThrow(ApiError)
  })

  it('merges custom headers with default headers', async () => {
    mockFetch.mockResolvedValue(makeResponse({ data: null }, true))
    await apiFetch('/api/test', { headers: { 'X-Custom': 'value' } })
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['X-Custom']).toBe('value')
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })
})
