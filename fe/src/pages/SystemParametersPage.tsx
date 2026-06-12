import { useState, useCallback } from 'react'
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, SearchX, DatabaseZap } from 'lucide-react'
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
import { toast } from '@/components/ui/use-toast'
import { ParamTypeBadge, inferParamType } from '@/components/system-parameters/ParamTypeBadge'
import { SystemParameterFormModal } from '@/components/system-parameters/SystemParameterFormModal'
import { DeleteConfirmDialog } from '@/components/system-parameters/DeleteConfirmDialog'
import { useSystemParameterList } from '@/hooks/useSystemParameters'
import { useDebounce } from '@/hooks/useDebounce'
import { checkInUse } from '@/lib/api/system-parameters'
import { ApiError } from '@/lib/api/client'
import type { SystemParameter } from '@/types/system-parameter'
import type { ParamType } from '@/components/system-parameters/ParamTypeBadge'

type SortState = 'default' | 'key,asc' | 'key,desc'

const PAGE_SIZES = [10, 20, 50]

export function SystemParametersPage() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState<SortState>('default')
  const [typeFilter, setTypeFilter] = useState<'all' | ParamType>('all')

  const [createOpen, setCreateOpen] = useState(false)
  const [editParam, setEditParam] = useState<SystemParameter | null>(null)
  const [deleteParam, setDeleteParam] = useState<SystemParameter | null>(null)
  const [checkingId, setCheckingId] = useState<number | null>(null)

  const { data, isLoading, isError, error } = useSystemParameterList({
    keyword: debouncedKeyword || undefined,
    page,
    size: pageSize,
    sort: sort === 'default' ? 'createdAt,desc' : sort,
  })

  if (isError && error) {
    const msg = error instanceof ApiError ? error.message : 'Đã có lỗi xảy ra'
    toast({ title: 'Lỗi', description: msg, variant: 'destructive' })
  }

  const allRows = data?.content ?? []
  const filteredRows =
    typeFilter === 'all' ? allRows : allRows.filter((p) => inferParamType(p.value) === typeFilter)
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

  const handleSortToggle = () => {
    setSort((prev) => {
      if (prev === 'key,asc') return 'key,desc'
      return 'key,asc'
    })
    setPage(0)
  }

  const handleEditClick = useCallback(async (param: SystemParameter) => {
    setCheckingId(param.id)
    try {
      const result = await checkInUse(param.id)
      if (result.inUse) {
        toast({
          title: 'Không thể sửa',
          description: 'Tham số đã được sử dụng, không thể sửa',
          variant: 'destructive',
        })
      } else {
        setEditParam(param)
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Không kiểm tra được trạng thái tham số', variant: 'destructive' })
    } finally {
      setCheckingId(null)
    }
  }, [])

  const handleDeleteClick = useCallback(async (param: SystemParameter) => {
    setCheckingId(param.id)
    try {
      const result = await checkInUse(param.id)
      if (result.inUse) {
        toast({
          title: 'Không thể xoá',
          description: 'Tham số đã được sử dụng, không thể xoá',
          variant: 'destructive',
        })
      } else {
        setDeleteParam(param)
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Không kiểm tra được trạng thái tham số', variant: 'destructive' })
    } finally {
      setCheckingId(null)
    }
  }, [])

  const handleDeleteSuccess = () => {
    setDeleteParam(null)
    if (filteredRows.length === 1 && page > 0) {
      setPage((p) => p - 1)
    }
  }

  const SortIcon = sort === 'key,asc' ? ArrowUp : sort === 'key,desc' ? ArrowDown : ArrowUpDown

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Danh mục tham số</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Tìm kiếm theo tên hoặc mô tả..."
          value={keyword}
          onChange={handleKeywordChange}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as typeof typeFilter); setPage(0) }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả kiểu dữ liệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả kiểu dữ liệu</SelectItem>
            <SelectItem value="Boolean">Boolean</SelectItem>
            <SelectItem value="Number">Number</SelectItem>
            <SelectItem value="Text">Text</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">STT</TableHead>
              <TableHead>
                <button
                  onClick={handleSortToggle}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Tên tham số
                  <SortIcon className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="w-32">Kiểu dữ liệu</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                    {keyword || typeFilter !== 'all' ? (
                      <>
                        <SearchX className="h-10 w-10" />
                        <span>Không tìm thấy kết quả phù hợp</span>
                      </>
                    ) : (
                      <>
                        <DatabaseZap className="h-10 w-10" />
                        <span>Chưa có tham số nào</span>
                        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                          <Plus className="h-4 w-4" /> Thêm mới
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((param, idx) => (
                <TableRow key={param.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {page * pageSize + idx + 1}
                  </TableCell>
                  <TableCell className="font-mono font-medium">{param.key}</TableCell>
                  <TableCell>
                    <ParamTypeBadge value={param.value} />
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground text-sm">
                    {param.description ? (
                      <span className="line-clamp-2" title={param.description}>
                        {param.description}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={checkingId === param.id}
                        onClick={() => handleEditClick(param)}
                        title="Sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={checkingId === param.id}
                        onClick={() => handleDeleteClick(param)}
                        title="Xoá"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Tổng số: <strong className="text-foreground">{totalElements}</strong> bản ghi</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>/ trang</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
            >
              &lt;
            </Button>
            <span className="px-3 py-1 text-sm">{page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              &gt;
            </Button>
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
        currentPage={page}
        itemsOnPage={filteredRows.length}
      />
    </div>
  )
}
