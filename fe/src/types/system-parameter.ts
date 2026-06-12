export interface SystemParameter {
  id: number
  key: string
  value: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface SystemParameterRequest {
  key: string
  value: string
  description?: string
}

export interface InUseResponse {
  inUse: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

export interface ListSystemParametersParams {
  keyword?: string
  page?: number
  size?: number
  sort?: string
}
