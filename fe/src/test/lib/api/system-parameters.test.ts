import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listSystemParameters,
  getSystemParameter,
  createSystemParameter,
  updateSystemParameter,
  deleteSystemParameter,
  checkInUse,
} from '@/lib/api/system-parameters'
import * as client from '@/lib/api/client'

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(),
}))

const mockFetch = vi.mocked(client.apiFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listSystemParameters', () => {
  it('calls correct URL with no params', async () => {
    mockFetch.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 })
    await listSystemParameters()
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters')
  })

  it('appends keyword query param', async () => {
    mockFetch.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 })
    await listSystemParameters({ keyword: 'test' })
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters?keyword=test')
  })

  it('appends page and size params', async () => {
    mockFetch.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 })
    await listSystemParameters({ page: 2, size: 20 })
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters?page=2&size=20')
  })

  it('appends all params together', async () => {
    mockFetch.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 })
    await listSystemParameters({ keyword: 'key', page: 1, size: 10 })
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters?keyword=key&page=1&size=10')
  })
})

describe('getSystemParameter', () => {
  it('calls correct URL with id', async () => {
    mockFetch.mockResolvedValue({ id: 1, key: 'KEY', value: 'val', name: null, description: null, createdAt: '', updatedAt: '' })
    await getSystemParameter(42)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters/42')
  })
})

describe('createSystemParameter', () => {
  it('calls POST with body', async () => {
    const data = { name: 'Test', key: 'TEST_KEY', value: '123' }
    mockFetch.mockResolvedValue({ ...data, id: 1, description: null, createdAt: '', updatedAt: '' })
    await createSystemParameter(data)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })
})

describe('updateSystemParameter', () => {
  it('calls PUT with id and body', async () => {
    const data = { name: 'Updated', key: 'KEY', value: 'new-val' }
    mockFetch.mockResolvedValue({ ...data, id: 5, description: null, createdAt: '', updatedAt: '' })
    await updateSystemParameter(5, data)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters/5', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  })
})

describe('deleteSystemParameter', () => {
  it('calls DELETE with id', async () => {
    mockFetch.mockResolvedValue(null)
    await deleteSystemParameter(3)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters/3', { method: 'DELETE' })
  })
})

describe('checkInUse', () => {
  it('calls in-use endpoint', async () => {
    mockFetch.mockResolvedValue({ inUse: false })
    await checkInUse(7)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/system-parameters/7/in-use')
  })
})
