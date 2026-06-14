import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useSystemParameterList,
  useSystemParameterDetail,
  useCheckInUse,
  useCreateSystemParameter,
  useUpdateSystemParameter,
  useDeleteSystemParameter,
} from '@/hooks/useSystemParameters'
import * as api from '@/lib/api/system-parameters'

vi.mock('@/lib/api/system-parameters', () => ({
  listSystemParameters: vi.fn(),
  getSystemParameter: vi.fn(),
  createSystemParameter: vi.fn(),
  updateSystemParameter: vi.fn(),
  deleteSystemParameter: vi.fn(),
  checkInUse: vi.fn(),
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockList = vi.mocked(api.listSystemParameters)
const mockGet = vi.mocked(api.getSystemParameter)
const mockCreate = vi.mocked(api.createSystemParameter)
const mockUpdate = vi.mocked(api.updateSystemParameter)
const mockDelete = vi.mocked(api.deleteSystemParameter)

const PAGE_RESPONSE = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 }
const PARAM = { id: 1, key: 'KEY', value: 'val', name: null, description: null, createdAt: '', updatedAt: '' }

beforeEach(() => { vi.clearAllMocks() })

describe('useSystemParameterList', () => {
  it('fetches list successfully', async () => {
    mockList.mockResolvedValue({ ...PAGE_RESPONSE, content: [PARAM], totalElements: 1 })
    const { result } = renderHook(() => useSystemParameterList({ page: 0, size: 10 }), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.totalElements).toBe(1)
  })

  it('sets isError on failure', async () => {
    mockList.mockRejectedValue(new Error('Server error'))
    const { result } = renderHook(() => useSystemParameterList({}), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useSystemParameterDetail', () => {
  it('fetches detail when id > 0', async () => {
    mockGet.mockResolvedValue(PARAM)
    const { result } = renderHook(() => useSystemParameterDetail(1), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe(1)
  })

  it('does not fetch when id is 0', () => {
    const { result } = renderHook(() => useSystemParameterDetail(0), { wrapper: makeWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockGet).not.toHaveBeenCalled()
  })
})

describe('useCheckInUse', () => {
  it('starts as idle (enabled: false)', () => {
    const { result } = renderHook(() => useCheckInUse(1), { wrapper: makeWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(api.checkInUse).not.toHaveBeenCalled()
  })

  it('accepts null id', () => {
    const { result } = renderHook(() => useCheckInUse(null), { wrapper: makeWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('calls checkInUse when refetch is triggered', async () => {
    vi.mocked(api.checkInUse).mockResolvedValue({ inUse: true })
    const { result } = renderHook(() => useCheckInUse(3), { wrapper: makeWrapper() })
    await result.current.refetch()
    expect(api.checkInUse).toHaveBeenCalledWith(3)
  })
})

describe('useCreateSystemParameter', () => {
  it('calls createSystemParameter on mutate', async () => {
    mockCreate.mockResolvedValue(PARAM)
    const { result } = renderHook(() => useCreateSystemParameter(), { wrapper: makeWrapper() })
    await result.current.mutateAsync({ name: 'New', key: 'NEW_KEY', value: '1' })
    expect(mockCreate).toHaveBeenCalledWith({ name: 'New', key: 'NEW_KEY', value: '1' })
  })
})

describe('useUpdateSystemParameter', () => {
  it('calls updateSystemParameter with id and data', async () => {
    mockUpdate.mockResolvedValue({ ...PARAM, value: 'updated' })
    const { result } = renderHook(() => useUpdateSystemParameter(), { wrapper: makeWrapper() })
    await result.current.mutateAsync({ id: 1, data: { name: 'Up', key: 'KEY', value: 'updated' } })
    expect(mockUpdate).toHaveBeenCalledWith(1, { name: 'Up', key: 'KEY', value: 'updated' })
  })
})

describe('useDeleteSystemParameter', () => {
  it('calls deleteSystemParameter with id', async () => {
    mockDelete.mockResolvedValue(null)
    const { result } = renderHook(() => useDeleteSystemParameter(), { wrapper: makeWrapper() })
    await result.current.mutateAsync(5)
    expect(mockDelete).toHaveBeenCalledWith(5)
  })
})

describe('mutation onError handlers', () => {
  it('useCreateSystemParameter handles error without throwing from hook', async () => {
    const { ApiError } = await import('@/lib/api/client')
    mockCreate.mockRejectedValue(new ApiError(409, 'Conflict'))
    const { result } = renderHook(() => useCreateSystemParameter(), { wrapper: makeWrapper() })
    await expect(result.current.mutateAsync({ name: 'x', key: 'X', value: 'v' })).rejects.toBeInstanceOf(ApiError)
  })

  it('useUpdateSystemParameter handles error without throwing from hook', async () => {
    const { ApiError } = await import('@/lib/api/client')
    mockUpdate.mockRejectedValue(new ApiError(404, 'Not found'))
    const { result } = renderHook(() => useUpdateSystemParameter(), { wrapper: makeWrapper() })
    await expect(result.current.mutateAsync({ id: 1, data: { name: 'x', key: 'X', value: 'v' } })).rejects.toBeInstanceOf(ApiError)
  })

  it('useDeleteSystemParameter handles error without throwing from hook', async () => {
    const { ApiError } = await import('@/lib/api/client')
    mockDelete.mockRejectedValue(new ApiError(500, 'Server error'))
    const { result } = renderHook(() => useDeleteSystemParameter(), { wrapper: makeWrapper() })
    await expect(result.current.mutateAsync(99)).rejects.toBeInstanceOf(ApiError)
  })
})
