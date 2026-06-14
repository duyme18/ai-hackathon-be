import { apiFetch } from './client'
import type { AuthResponse, LoginRequest } from '@/types/auth'

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function logout(): void {
  localStorage.removeItem('accessToken')
}
