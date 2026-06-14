import { apiFetch } from './client'
import type {
  SystemParameter,
  SystemParameterRequest,
  InUseResponse,
  PageResponse,
  ListSystemParametersParams,
} from '@/types/system-parameter'

const BASE = '/api/v1/system-parameters'

export function listSystemParameters(params: ListSystemParametersParams = {}) {
  const query = new URLSearchParams()
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  const qs = query.toString()
  const url = qs ? `${BASE}?${qs}` : BASE
  return apiFetch<PageResponse<SystemParameter>>(url)
}

export function getSystemParameter(id: number) {
  return apiFetch<SystemParameter>(`${BASE}/${id}`)
}

export function createSystemParameter(data: SystemParameterRequest) {
  return apiFetch<SystemParameter>(BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateSystemParameter(id: number, data: SystemParameterRequest) {
  return apiFetch<SystemParameter>(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteSystemParameter(id: number) {
  return apiFetch<null>(`${BASE}/${id}`, { method: 'DELETE' })
}

export function checkInUse(id: number) {
  return apiFetch<InUseResponse>(`${BASE}/${id}/in-use`)
}
