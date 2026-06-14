import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { login, logout } from '@/lib/api/auth'
import * as client from '@/lib/api/client'

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(),
}))

const mockFetch = vi.mocked(client.apiFetch)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('login', () => {
  it('calls correct endpoint with POST and body', async () => {
    const credentials = { email: 'admin@test.com', password: 'pass123' }
    const response = { accessToken: 'token-abc', tokenType: 'Bearer' }
    mockFetch.mockResolvedValue(response)

    const result = await login(credentials)

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    expect(result).toEqual(response)
  })

  it('propagates errors from apiFetch', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(login({ email: 'a@b.com', password: 'pw' })).rejects.toThrow('Network error')
  })
})

describe('logout', () => {
  it('removes accessToken from localStorage', () => {
    localStorage.setItem('accessToken', 'some-token')
    logout()
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('does not throw when no token exists', () => {
    expect(() => logout()).not.toThrow()
  })
})
