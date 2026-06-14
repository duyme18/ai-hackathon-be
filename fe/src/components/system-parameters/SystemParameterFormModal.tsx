import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useCreateSystemParameter, useUpdateSystemParameter } from '@/hooks/useSystemParameters'
import { ApiError } from '@/lib/api/client'
import type { SystemParameter } from '@/types/system-parameter'

const schema = z.object({
  name: z.string().min(1, 'Tên cấu hình là bắt buộc'),
  key: z
    .string()
    .min(1, 'Mã cấu hình là bắt buộc')
    .max(20, 'Tối đa 20 ký tự')
    .regex(/^[A-Z0-9_]+$/, 'Chỉ chấp nhận chữ hoa, số và dấu gạch dưới'),
  value: z.string().min(1, 'Giá trị là bắt buộc'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface SystemParameterFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: SystemParameter
  onClose: () => void
  onSuccess: () => void
}

export function SystemParameterFormModal({
  open,
  mode,
  initialData,
  onClose,
  onSuccess,
}: Readonly<SystemParameterFormModalProps>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', key: '', value: '', description: '' },
  })

  const createMutation = useCreateSystemParameter()
  const updateMutation = useUpdateSystemParameter()
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        reset({
          name: initialData.name ?? '',
          key: initialData.key,
          value: initialData.value,
          description: initialData.description ?? '',
        })
      } else {
        reset({ name: '', key: '', value: '', description: '' })
      }
    }
  }, [open, mode, initialData, reset])

  const keyValue = watch('key')

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('key', e.target.value.toUpperCase().replaceAll(/[^A-Z0-9_]/gu, ''), {
      shouldValidate: true,
    })
  }

  const handleKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().replaceAll(/[^A-Z0-9_]/gu, '')
    setValue('key', (keyValue + pasted).slice(0, 20), { shouldValidate: true })
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data)
        toast({ title: 'Thành công', description: 'Cấu hình đã được tạo thành công' })
      } else {
        await updateMutation.mutateAsync({ id: initialData!.id, data })
        toast({ title: 'Thành công', description: 'Cấu hình đã được cập nhật' })
      }
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          if (err.message.toLowerCase().includes('in use')) {
            toast({
              title: 'Không thể sửa',
              description: 'Tham số đang được sử dụng, không thể chỉnh sửa',
              variant: 'destructive',
            })
          } else {
            toast({ title: 'Lỗi', description: 'Mã cấu hình đã tồn tại', variant: 'destructive' })
          }
        } else {
          toast({ title: 'Lỗi', description: err.message, variant: 'destructive' })
        }
      } else {
        toast({ title: 'Lỗi', description: 'Đã có lỗi xảy ra', variant: 'destructive' })
      }
    }
  }

  const title = mode === 'create' ? 'Thêm mới cấu hình hệ thống' : 'Chỉnh sửa cấu hình hệ thống'

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Tên cấu hình */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Tên cấu hình <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nhập tên cấu hình..."
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Mã cấu hình */}
          <div className="space-y-1.5">
            <Label htmlFor="key">
              Mã cấu hình <span className="text-destructive">*</span>
            </Label>
            <Input
              id="key"
              {...register('key')}
              value={keyValue}
              onChange={handleKeyChange}
              onPaste={handleKeyPaste}
              disabled={mode === 'edit'}
              placeholder="VD: MAX_RETRY_COUNT"
              maxLength={20}
            />
            {errors.key && (
              <p className="text-xs text-destructive">{errors.key.message}</p>
            )}
          </div>

          {/* Giá trị */}
          <div className="space-y-1.5">
            <Label htmlFor="value">
              Giá trị <span className="text-destructive">*</span>
            </Label>
            <Input
              id="value"
              {...register('value')}
              placeholder="Nhập giá trị..."
            />
            {errors.value && (
              <p className="text-xs text-destructive">{errors.value.message}</p>
            )}
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Mô tả cấu hình (không bắt buộc)..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
