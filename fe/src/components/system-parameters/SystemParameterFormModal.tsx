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
  DialogFooter,
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
  key: z
    .string()
    .min(1, 'Đây là thông tin bắt buộc')
    .max(20, 'Tối đa 20 ký tự')
    .regex(/^[A-Z0-9_]+$/, 'Chỉ chấp nhận chữ hoa, số và dấu gạch dưới'),
  value: z.string().min(1, 'Đây là thông tin bắt buộc'),
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
}: SystemParameterFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { key: '', value: '', description: '' },
  })

  const createMutation = useCreateSystemParameter()
  const updateMutation = useUpdateSystemParameter()
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        reset({
          key: initialData.key,
          value: initialData.value,
          description: initialData.description ?? '',
        })
      } else {
        reset({ key: '', value: '', description: '' })
      }
    }
  }, [open, mode, initialData, reset])

  const keyValue = watch('key')
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('key', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''), {
      shouldValidate: true,
    })
  }
  const handleKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9_]/g, '')
    setValue('key', (keyValue + pasted).slice(0, 20), { shouldValidate: true })
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data)
        toast({ title: 'Thành công', description: 'Tham số đã được tạo thành công' })
      } else {
        await updateMutation.mutateAsync({ id: initialData!.id, data })
        toast({ title: 'Thành công', description: 'Tham số đã được cập nhật' })
      }
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          if (err.message.toLowerCase().includes('in use')) {
            toast({
              title: 'Không thể sửa',
              description: 'Tham số đã được sử dụng, không thể sửa',
              variant: 'destructive',
            })
          } else {
            toast({ title: 'Lỗi', description: 'Tham số đã tồn tại', variant: 'destructive' })
          }
        } else {
          toast({ title: 'Lỗi', description: err.message, variant: 'destructive' })
        }
      } else {
        toast({ title: 'Lỗi', description: 'Đã có lỗi xảy ra', variant: 'destructive' })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Thêm tham số mới' : 'Sửa tham số'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="key">
              Tên tham số <span className="text-destructive">*</span>
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

          <div className="space-y-1.5">
            <Label htmlFor="value">
              Giá trị <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="value"
              {...register('value')}
              placeholder="Nhập giá trị..."
              rows={3}
            />
            {errors.value && (
              <p className="text-xs text-destructive">{errors.value.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Mô tả tham số (không bắt buộc)..."
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
