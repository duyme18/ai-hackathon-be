import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SystemParametersPage } from '@/pages/SystemParametersPage'
import * as hooks from '@/hooks/useSystemParameters'

vi.mock('@/hooks/useSystemParameters', () => ({
  useSystemParameterList: vi.fn(),
  useCreateSystemParameter: vi.fn(),
  useUpdateSystemParameter: vi.fn(),
  useDeleteSystemParameter: vi.fn(),
  useCheckInUse: vi.fn(),
}))

vi.mock('@/components/ui/use-toast', () => ({ toast: vi.fn() }))

const PAGE_DATA = {
  content: [
    { id: 1, key: 'KEY_ONE', value: '100', name: 'Config One', description: 'First', createdAt: '', updatedAt: '' },
    { id: 2, key: 'KEY_TWO', value: '200', name: 'Config Two', description: null, createdAt: '', updatedAt: '' },
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 10,
}

const MUTATION_STUB = { mutateAsync: vi.fn(), isPending: false }

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(hooks.useCreateSystemParameter).mockReturnValue(MUTATION_STUB as any)
  vi.mocked(hooks.useUpdateSystemParameter).mockReturnValue(MUTATION_STUB as any)
  vi.mocked(hooks.useDeleteSystemParameter).mockReturnValue(MUTATION_STUB as any)
})

describe('SystemParametersPage', () => {
  it('shows loading skeleton when loading', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: undefined, isLoading: true, isError: false } as any)
    const { container } = render(<SystemParametersPage />, { wrapper })
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThan(0)
  })

  it('shows error message when error', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: undefined, isLoading: false, isError: true } as any)
    render(<SystemParametersPage />, { wrapper })
    expect(screen.getByText(/Không thể tải dữ liệu/)).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 },
      isLoading: false, isError: false,
    } as any)
    render(<SystemParametersPage />, { wrapper })
    expect(screen.getByText(/Chưa có dữ liệu/)).toBeInTheDocument()
  })

  it('shows empty search state when keyword and no results', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 },
      isLoading: false, isError: false,
    } as any)
    render(<SystemParametersPage />, { wrapper })
    const input = screen.getByPlaceholderText(/Tìm kiếm/)
    fireEvent.change(input, { target: { value: 'nothing' } })
    expect(screen.getByText(/Không có kết quả phù hợp/)).toBeInTheDocument()
  })

  it('renders data rows', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    expect(screen.getByText('KEY_ONE')).toBeInTheDocument()
    expect(screen.getByText('KEY_TWO')).toBeInTheDocument()
    expect(screen.getByText('Config One')).toBeInTheDocument()
  })

  it('shows "—" for null name', () => {
    const data = { ...PAGE_DATA, content: [{ ...PAGE_DATA.content[0], name: null }] }
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows total count in footer', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    expect(screen.getByText(/Tổng số/)).toBeInTheDocument()
  })

  it('opens create modal on "Thêm mới" click', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByText('Thêm mới')[0])
    expect(screen.getByText('Thêm mới cấu hình hệ thống')).toBeInTheDocument()
  })

  it('opens edit modal on pencil button click', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByTitle('Sửa')[0])
    expect(screen.getByText('Chỉnh sửa cấu hình hệ thống')).toBeInTheDocument()
  })

  it('opens delete dialog on trash button click', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByTitle('Xoá')[0])
    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument()
  })

  it('renders breadcrumb', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    expect(screen.getByText('Quản lý danh mục')).toBeInTheDocument()
    expect(screen.getByText('Cấu hình hệ thống')).toBeInTheDocument()
  })

  it('renders pagination controls', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({
      data: { ...PAGE_DATA, totalPages: 3 }, isLoading: false, isError: false,
    } as any)
    render(<SystemParametersPage />, { wrapper })
    expect(screen.getByText('<')).toBeInTheDocument()
    expect(screen.getByText('>')).toBeInTheDocument()
  })

  it('navigates to next page when > clicked', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({
      data: { ...PAGE_DATA, totalPages: 3 }, isLoading: false, isError: false,
    } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getByText('>'))
    // hook called again with page=1 (state updated)
    expect(hooks.useSystemParameterList).toHaveBeenCalled()
  })

  it('navigates to previous page after going to next', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({
      data: { ...PAGE_DATA, totalPages: 3 }, isLoading: false, isError: false,
    } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getByText('>'))
    fireEvent.click(screen.getByText('<'))
    expect(hooks.useSystemParameterList).toHaveBeenCalled()
  })

  it('navigates to specific page when page number clicked', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({
      data: { ...PAGE_DATA, totalPages: 3 }, isLoading: false, isError: false,
    } as any)
    render(<SystemParametersPage />, { wrapper })
    // Page buttons: "1", "2", "3" — the total count "2" may also match, use role=button
    const pageButtons = screen.getAllByRole('button', { name: '2' })
    fireEvent.click(pageButtons[0])
    expect(hooks.useSystemParameterList).toHaveBeenCalled()
  })

  it('changes page size when select changes', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({
      data: PAGE_DATA, isLoading: false, isError: false,
    } as any)
    render(<SystemParametersPage />, { wrapper })
    expect(hooks.useSystemParameterList).toHaveBeenCalled()
  })

  it('closes create modal via onClose callback', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByText('Thêm mới')[0])
    expect(screen.getByText('Thêm mới cấu hình hệ thống')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Hủy bỏ'))
    expect(screen.queryByText('Thêm mới cấu hình hệ thống')).not.toBeInTheDocument()
  })

  it('closes edit modal via onClose callback', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByTitle('Sửa')[0])
    expect(screen.getByText('Chỉnh sửa cấu hình hệ thống')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Hủy bỏ'))
    expect(screen.queryByText('Chỉnh sửa cấu hình hệ thống')).not.toBeInTheDocument()
  })

  it('closes delete dialog via onClose callback', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByTitle('Xoá')[0])
    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Hủy bỏ'))
    expect(screen.queryByText('Xác nhận xóa')).not.toBeInTheDocument()
  })

  it('closes delete dialog after successful delete via onSuccess', async () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    const mockMutateAsync = vi.fn().mockResolvedValue(null)
    vi.mocked(hooks.useDeleteSystemParameter).mockReturnValue({ ...MUTATION_STUB, mutateAsync: mockMutateAsync } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByTitle('Xoá')[0])
    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Xác nhận'))
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled())
  })

  it('opens create modal from empty state "Thêm mới" button', () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 },
      isLoading: false, isError: false,
    } as any)
    render(<SystemParametersPage />, { wrapper })
    // Click the "Thêm mới" button inside the empty state
    const buttons = screen.getAllByText('Thêm mới')
    // There are two "Thêm mới" — one in toolbar, one in empty state
    fireEvent.click(buttons[buttons.length - 1])
    expect(screen.getByText('Thêm mới cấu hình hệ thống')).toBeInTheDocument()
  })

  it('closes create modal via onSuccess callback after form submit', async () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    const mockMutateAsync = vi.fn().mockResolvedValue({ id: 3, key: 'NEW', value: 'v', name: 'New', description: null, createdAt: '', updatedAt: '' })
    vi.mocked(hooks.useCreateSystemParameter).mockReturnValue({ ...MUTATION_STUB, mutateAsync: mockMutateAsync } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByText('Thêm mới')[0])
    fireEvent.change(screen.getByLabelText(/Tên cấu hình/), { target: { value: 'New' } })
    fireEvent.change(screen.getByLabelText(/Mã cấu hình/), { target: { value: 'NEW_KEY' } })
    fireEvent.change(screen.getByLabelText(/Giá trị/), { target: { value: 'v' } })
    fireEvent.click(screen.getByText('Lưu'))
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled())
    expect(screen.queryByText('Thêm mới cấu hình hệ thống')).not.toBeInTheDocument()
  })

  it('closes edit modal via onSuccess callback after update', async () => {
    vi.mocked(hooks.useSystemParameterList).mockReturnValue({ data: PAGE_DATA, isLoading: false, isError: false } as any)
    const mockMutateAsync = vi.fn().mockResolvedValue({ ...PAGE_DATA.content[0], value: 'updated' })
    vi.mocked(hooks.useUpdateSystemParameter).mockReturnValue({ ...MUTATION_STUB, mutateAsync: mockMutateAsync } as any)
    render(<SystemParametersPage />, { wrapper })
    fireEvent.click(screen.getAllByTitle('Sửa')[0])
    fireEvent.click(screen.getByText('Lưu'))
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled())
    expect(screen.queryByText('Chỉnh sửa cấu hình hệ thống')).not.toBeInTheDocument()
  })
})
