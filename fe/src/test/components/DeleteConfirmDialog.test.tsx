import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DeleteConfirmDialog } from '@/components/system-parameters/DeleteConfirmDialog'
import * as api from '@/lib/api/system-parameters'
import * as toastModule from '@/components/ui/use-toast'
import { ApiError } from '@/lib/api/client'
import type { SystemParameter } from '@/types/system-parameter'

vi.mock('@/lib/api/system-parameters', () => ({
  deleteSystemParameter: vi.fn(),
}))

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

const PARAM: SystemParameter = {
  id: 1, key: 'TEST_KEY', value: '123', name: 'Test', description: 'desc', createdAt: '', updatedAt: '',
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

const mockDelete = vi.mocked(api.deleteSystemParameter)

beforeEach(() => { vi.clearAllMocks() })

describe('DeleteConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(<DeleteConfirmDialog open={false} param={PARAM} onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    expect(screen.queryByText('Xác nhận xóa')).not.toBeInTheDocument()
  })

  it('renders dialog title when open', () => {
    render(<DeleteConfirmDialog open={true} param={PARAM} onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument()
  })

  it('shows param key in description', () => {
    render(<DeleteConfirmDialog open={true} param={PARAM} onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    expect(screen.getByText(/TEST_KEY/)).toBeInTheDocument()
  })

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn()
    render(<DeleteConfirmDialog open={true} param={PARAM} onClose={onClose} onSuccess={vi.fn()} />, { wrapper })
    fireEvent.click(screen.getByText('Hủy bỏ'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls deleteSystemParameter and onSuccess on confirm', async () => {
    mockDelete.mockResolvedValue(null)
    const onSuccess = vi.fn()
    render(<DeleteConfirmDialog open={true} param={PARAM} onClose={vi.fn()} onSuccess={onSuccess} />, { wrapper })
    fireEvent.click(screen.getByText('Xác nhận'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(mockDelete).toHaveBeenCalledWith(1)
  })

  it('renders null description gracefully when param is null', () => {
    render(<DeleteConfirmDialog open={true} param={null} onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument()
  })

  it('toasts "Không thể xoá" when delete fails with 409 and calls onClose', async () => {
    mockDelete.mockRejectedValue(new ApiError(409, 'in use'))
    const onClose = vi.fn()
    const mockToast = vi.mocked(toastModule.toast)
    render(<DeleteConfirmDialog open={true} param={PARAM} onClose={onClose} onSuccess={vi.fn()} />, { wrapper })
    fireEvent.click(screen.getByText('Xác nhận'))
    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Không thể xoá' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('toasts error message when delete fails with non-409 ApiError and calls onClose', async () => {
    mockDelete.mockRejectedValue(new ApiError(500, 'Server error'))
    const onClose = vi.fn()
    const mockToast = vi.mocked(toastModule.toast)
    render(<DeleteConfirmDialog open={true} param={PARAM} onClose={onClose} onSuccess={vi.fn()} />, { wrapper })
    fireEvent.click(screen.getByText('Xác nhận'))
    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Lỗi', description: 'Server error' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('toasts generic error when delete throws non-ApiError', async () => {
    mockDelete.mockRejectedValue(new Error('network'))
    const onClose = vi.fn()
    const mockToast = vi.mocked(toastModule.toast)
    render(<DeleteConfirmDialog open={true} param={PARAM} onClose={onClose} onSuccess={vi.fn()} />, { wrapper })
    fireEvent.click(screen.getByText('Xác nhận'))
    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Đã có lỗi xảy ra' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose via onOpenChange when dialog is closed externally', () => {
    const onClose = vi.fn()
    render(<DeleteConfirmDialog open={true} param={PARAM} onClose={onClose} onSuccess={vi.fn()} />, { wrapper })
    // Pressing Escape closes the Radix dialog and triggers onOpenChange(false)
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
