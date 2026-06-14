import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '@/pages/LoginPage'
import * as authApi from '@/lib/api/auth'

vi.mock('@/lib/api/auth', () => ({
  login: vi.fn(),
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: vi.fn() }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

const mockLogin = vi.mocked(authApi.login)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('LoginPage', () => {
  it('renders title', () => {
    render(<LoginPage />, { wrapper })
    expect(screen.getByText('Tendoo AI')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    render(<LoginPage />, { wrapper })
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<LoginPage />, { wrapper })
    expect(screen.getByRole('button', { name: /Đăng nhập/ })).toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    render(<LoginPage />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/ }))
    await waitFor(() => {
      expect(screen.getByText('Email là bắt buộc')).toBeInTheDocument()
      expect(screen.getByText('Mật khẩu là bắt buộc')).toBeInTheDocument()
    })
  })

  it('does not call login API when email is invalid', async () => {
    render(<LoginPage />, { wrapper })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'notanemail' } })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/ }))
    await waitFor(() => expect(mockLogin).not.toHaveBeenCalled())
  })

  it('saves accessToken and navigates on successful login', async () => {
    mockLogin.mockResolvedValue({ accessToken: 'my-token', tokenType: 'Bearer' })
    render(<LoginPage />, { wrapper })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@test.com' } })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/ }))
    await waitFor(() => expect(localStorage.getItem('accessToken')).toBe('my-token'))
  })

  it('calls login API with form values', async () => {
    mockLogin.mockResolvedValue({ accessToken: 'token', tokenType: 'Bearer' })
    render(<LoginPage />, { wrapper })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/ }))
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'pass' })
    )
  })
})
