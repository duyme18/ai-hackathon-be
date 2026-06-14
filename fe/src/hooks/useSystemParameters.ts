import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listSystemParameters,
  getSystemParameter,
  createSystemParameter,
  updateSystemParameter,
  deleteSystemParameter,
  checkInUse,
} from '@/lib/api/system-parameters'
import type { ListSystemParametersParams, SystemParameterRequest } from '@/types/system-parameter'
import { ApiError } from '@/lib/api/client'

const KEYS = {
  list: (params: ListSystemParametersParams) => ['system-parameters', 'list', params] as const,
  detail: (id: number) => ['system-parameters', 'detail', id] as const,
  inUse: (id: number) => ['system-parameters', 'in-use', id] as const,
}

export function useSystemParameterList(params: ListSystemParametersParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => listSystemParameters(params),
  })
}

export function useSystemParameterDetail(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getSystemParameter(id),
    enabled: id > 0,
  })
}

export function useCheckInUse(id: number | null) {
  return useQuery({
    queryKey: KEYS.inUse(id ?? 0),
    queryFn: () => checkInUse(id!),
    enabled: false,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useCreateSystemParameter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SystemParameterRequest) => createSystemParameter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-parameters', 'list'] })
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) return
    },
  })
}

export function useUpdateSystemParameter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SystemParameterRequest }) =>
      updateSystemParameter(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['system-parameters', 'list'] })
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) return
    },
  })
}

export function useDeleteSystemParameter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteSystemParameter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-parameters', 'list'] })
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) return
    },
  })
}
