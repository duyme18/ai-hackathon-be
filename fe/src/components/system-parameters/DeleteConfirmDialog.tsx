import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useDeleteSystemParameter } from '@/hooks/useSystemParameters'
import { ApiError } from '@/lib/api/client'
import type { SystemParameter } from '@/types/system-parameter'

interface DeleteConfirmDialogProps {
  open: boolean
  param: SystemParameter | null
  onClose: () => void
  onSuccess: () => void
}

export function DeleteConfirmDialog({
  open,
  param,
  onClose,
  onSuccess,
}: Readonly<DeleteConfirmDialogProps>) {
  const deleteMutation = useDeleteSystemParameter()

  const handleConfirm = async () => {
    if (!param) return
    try {
      await deleteMutation.mutateAsync(param.id)
      toast({ title: 'Thành công', description: 'Tham số đã được xoá' })
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({
          title: 'Không thể xoá',
          description: 'Tham số đã được sử dụng, không thể xoá',
          variant: 'destructive',
        })
      } else if (err instanceof ApiError) {
        toast({ title: 'Lỗi', description: err.message, variant: 'destructive' })
      } else {
        toast({ title: 'Lỗi', description: 'Đã có lỗi xảy ra', variant: 'destructive' })
      }
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa cấu hình <strong>{param?.key}</strong>? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
