import { cn } from '@/lib/utils'

export type ParamType = 'Boolean' | 'Number' | 'Text'

export function inferParamType(value: string): ParamType {
  const lower = value.toLowerCase().trim()
  if (['true', 'false', '0', '1'].includes(lower)) return 'Boolean'
  if (lower !== '' && Number.isFinite(Number(lower))) return 'Number'
  return 'Text'
}

const typeStyles: Record<ParamType, string> = {
  Boolean: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Number: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Text: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

interface ParamTypeBadgeProps {
  value: string
  className?: string
}

export function ParamTypeBadge({ value, className }: Readonly<ParamTypeBadgeProps>) {
  const type = inferParamType(value)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        typeStyles[type],
        className
      )}
    >
      {type}
    </span>
  )
}
