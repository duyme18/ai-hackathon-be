import { useState } from 'react'
import { Plus, Pencil, Trash2, SearchX, DatabaseZap, Search, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { SystemParameterFormModal } from '@/components/system-parameters/SystemParameterFormModal'
import { DeleteConfirmDialog } from '@/components/system-parameters/DeleteConfirmDialog'
import { useSystemParameterList } from '@/hooks/useSystemParameters'
import { useDebounce } from '@/hooks/useDebounce'
import type { SystemParameter } from '@/types/system-parameter'

const PAGE_SIZES = [10, 20, 50]
const SKELETON_ROW_KEYS = ['sk-r1', 'sk-r2', 'sk-r3', 'sk-r4', 'sk-r5'] as const
const SKELETON_COL_KEYS = ['sk-c1', 'sk-c2', 'sk-c3', 'sk-c4', 'sk-c5', 'sk-c6'] as const

export function SystemParametersPage() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [createOpen, setCreateOpen] = useState(false)
  const [editParam, setEditParam] = useState<SystemParameter | null>(null)
  const [deleteParam, setDeleteParam] = useState<SystemParameter | null>(null)

  const { data, isLoading, isError } = useSystemParameterList({
    keyword: debouncedKeyword || undefined,
    page,
    size: pageSize,
  })

  const rows = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
    setPage(0)
  }

  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val))
    setPage(0)
  }

  const handleDeleteSuccess = () => {
    setDeleteParam(null)
    if (rows.length === 1 && page > 0) {
      setPage((p) => p - 1)
    }
  }

  const renderTableBody = () => {
    if (isLoading) {
      return SKELETON_ROW_KEYS.map((rowKey) => (
        <TableRow key={rowKey}>
          {SKELETON_COL_KEYS.map((colKey) => (
            <TableCell key={colKey}><Skeleton className="h-5 w-full" /></TableCell>
          ))}
        </TableRow>
      ))
    }
    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-destructive">
              <span className="text-sm">Không thể tải dữ liệu. Vui lòng thử lại.</span>
            </div>
          </TableCell>
        </TableRow>
      )
    }
    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground">
              {keyword ? (
                <>
                  <SearchX className="h-10 w-10 opacity-40" />
                  <span className="text-sm">Không có kết quả phù hợp</span>
                </>
              ) : (
                <>
                  <DatabaseZap className="h-10 w-10 opacity-40" />
                  <span className="text-sm">Chưa có dữ liệu, bạn hãy tạo mới</span>
                  <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" /> Thêm mới
                  </Button>
                </>
              )}
            </div>
          </TableCell>
        </TableRow>
      )
    }
    return rows.map((param, idx) => (
      <TableRow key={param.id}>
        <TableCell className="text-muted-foreground text-sm text-center">
          {page * pageSize + idx + 1}
        </TableCell>
        <TableCell className="text-sm font-medium">
          {param.name ?? <span className="text-muted-foreground/50">—</span>}
        </TableCell>
        <TableCell className="font-mono text-sm">{param.key}</TableCell>
        <TableCell className="text-sm">{param.value}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {param.description ? (
            <span className="line-clamp-2" title={param.description}>
              {param.description}
            </span>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditParam(param)}
              title="Sửa"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteParam(param)}
              title="Xoá"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="p-6 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Quản lý danh mục</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-foreground">Cấu hình hệ thống</span>
      </div>

      {/* Card */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-[500px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Tìm kiếm tên, mã cấu hình..."
              value={keyword}
              onChange={handleKeywordChange}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Thêm mới
          </Button>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[56px]">STT</TableHead>
              <TableHead>Tên cấu hình</TableHead>
              <TableHead className="w-[180px]">Mã cấu hình</TableHead>
              <TableHead className="w-[160px]">Giá trị</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[110px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableBody()}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            Tổng số: <strong className="text-foreground">{totalElements}</strong> bản ghi
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
              >
                &lt;
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(pageNum)}
                  disabled={isLoading}
                >
                  {pageNum + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || isLoading}
              >
                &gt;
              </Button>
            </div>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}/trang</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <SystemParameterFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setCreateOpen(false)}
      />

      <SystemParameterFormModal
        open={editParam !== null}
        mode="edit"
        initialData={editParam ?? undefined}
        onClose={() => setEditParam(null)}
        onSuccess={() => setEditParam(null)}
      />

      <DeleteConfirmDialog
        open={deleteParam !== null}
        param={deleteParam}
        onClose={() => setDeleteParam(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
