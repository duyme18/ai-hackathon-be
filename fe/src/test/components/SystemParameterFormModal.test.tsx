import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SystemParameterFormModal } from '@/components/system-parameters/SystemParameterFormModal'
import * as api from '@/lib/api/system-parameters'
import * as toastModule from '@/components/ui/use-toast'
import { ApiError } from '@/lib/api/client'
import type { SystemParameter } from '@/types/system-parameter'

vi.mock('@/lib/api/system-parameters', () => ({
  createSystemParameter: vi.fn(),
  updateSystemParameter: vi.fn(),
}))

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

const PARAM: SystemParameter = {
  id: 1, key: 'TEST_KEY', value: '123', name: 'Test Name', description: 'desc', createdAt: '', updatedAt: '',
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

const mockCreate = vi.mocked(api.createSystemParameter)
const mockUpdate = vi.mocked(api.updateSystemParameter)

beforeEach(() => { vi.clearAllMocks() })

describe('SystemParameterFormModal — create mode', () => {
  it('renders create title', () => {
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    expect(screen.getByText('Thêm mới cấu hình hệ thống')).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    expect(screen.getByLabelText(/Tên cấu hình/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã cấu hình/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Giá trị/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mô tả/)).toBeInTheDocument()
  })

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn()
    render(<SystemParameterFormModal open={true} mode="create" onClose={onClose} onSuccess={vi.fn()} />, { wrapper })
    fireEvent.click(screen.getByText('Hủy bỏ'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows validation errors when submitted empty', async () => {
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    fireEvent.click(screen.getByText('Lưu'))
    await waitFor(() => {
      expect(screen.getByText('Tên cấu hình là bắt buộc')).toBeInTheDocument()
    })
  })

  it('submits form and calls onSuccess', async () => {
    mockCreate.mockResolvedValue({ ...PARAM })
    const onSuccess = vi.fn()
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={onSuccess} />, { wrapper })

    fireEvent.change(screen.getByLabelText(/Tên cấu hình/), { target: { value: 'My Config' } })
    fireEvent.change(screen.getByLabelText(/Giá trị/), { target: { value: '42' } })

    const keyInput = screen.getByLabelText(/Mã cấu hình/)
    fireEvent.change(keyInput, { target: { value: 'MY_KEY' } })

    fireEvent.click(screen.getByText('Lưu'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('auto-uppercases key input', () => {
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    const keyInput = screen.getByLabelText(/Mã cấu hình/) as HTMLInputElement
    fireEvent.change(keyInput, { target: { value: 'my_key' } })
    expect(keyInput.value).toBe('MY_KEY')
  })

  it('does not render when closed', () => {
    render(<SystemParameterFormModal open={false} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    expect(screen.queryByText('Thêm mới cấu hình hệ thống')).not.toBeInTheDocument()
  })
})

describe('SystemParameterFormModal — error handling', () => {
  const fillAndSubmit = async () => {
    fireEvent.change(screen.getByLabelText(/Tên cấu hình/), { target: { value: 'Name' } })
    fireEvent.change(screen.getByLabelText(/Giá trị/), { target: { value: 'val' } })
    fireEvent.change(screen.getByLabelText(/Mã cấu hình/), { target: { value: 'MY_KEY' } })
    fireEvent.click(screen.getByText('Lưu'))
  }

  it('toasts "Không thể sửa" when 409 in-use error on create', async () => {
    mockCreate.mockRejectedValue(new ApiError(409, 'In use message'))
    const mockToast = vi.mocked(toastModule.toast)
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    await fillAndSubmit()
    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Không thể sửa' }))
  })

  it('toasts "Mã cấu hình đã tồn tại" when 409 key-exists error on create', async () => {
    mockCreate.mockRejectedValue(new ApiError(409, 'Key already exists'))
    const mockToast = vi.mocked(toastModule.toast)
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    await fillAndSubmit()
    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Mã cấu hình đã tồn tại' }))
  })

  it('toasts error message when non-409 ApiError on create', async () => {
    mockCreate.mockRejectedValue(new ApiError(500, 'Internal error'))
    const mockToast = vi.mocked(toastModule.toast)
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    await fillAndSubmit()
    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Internal error' }))
  })

  it('toasts generic error when non-ApiError thrown on create', async () => {
    mockCreate.mockRejectedValue(new Error('network'))
    const mockToast = vi.mocked(toastModule.toast)
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    await fillAndSubmit()
    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Đã có lỗi xảy ra' }))
  })

  it('handles key paste event and filters invalid chars', () => {
    render(<SystemParameterFormModal open={true} mode="create" onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper })
    const keyInput = screen.getByLabelText(/Mã cấu hình/) as HTMLInputElement
    fireEvent.paste(keyInput, {
      clipboardData: { getData: () => 'hello world! 123' },
    })
    expect(keyInput.value).toBe('HELLOWORLD123')
  })

  it('calls onClose via onOpenChange when dialog closed externally', () => {
    const onClose = vi.fn()
    render(<SystemParameterFormModal open={true} mode="create" onClose={onClose} onSuccess={vi.fn()} />, { wrapper })
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})

describe('SystemParameterFormModal — edit mode', () => {
  it('renders edit title', () => {
    render(
      <SystemParameterFormModal open={true} mode="edit" initialData={PARAM} onClose={vi.fn()} onSuccess={vi.fn()} />,
      { wrapper }
    )
    expect(screen.getByText('Chỉnh sửa cấu hình hệ thống')).toBeInTheDocument()
  })

  it('pre-fills fields with initialData', () => {
    render(
      <SystemParameterFormModal open={true} mode="edit" initialData={PARAM} onClose={vi.fn()} onSuccess={vi.fn()} />,
      { wrapper }
    )
    expect((screen.getByLabelText(/Tên cấu hình/) as HTMLInputElement).value).toBe('Test Name')
    expect((screen.getByLabelText(/Giá trị/) as HTMLInputElement).value).toBe('123')
  })

  it('disables key field in edit mode', () => {
    render(
      <SystemParameterFormModal open={true} mode="edit" initialData={PARAM} onClose={vi.fn()} onSuccess={vi.fn()} />,
      { wrapper }
    )
    expect(screen.getByLabelText(/Mã cấu hình/)).toBeDisabled()
  })

  it('calls updateSystemParameter on submit', async () => {
    mockUpdate.mockResolvedValue({ ...PARAM, value: '999' })
    const onSuccess = vi.fn()
    render(
      <SystemParameterFormModal open={true} mode="edit" initialData={PARAM} onClose={vi.fn()} onSuccess={onSuccess} />,
      { wrapper }
    )
    fireEvent.click(screen.getByText('Lưu'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(mockUpdate).toHaveBeenCalled()
  })
})
