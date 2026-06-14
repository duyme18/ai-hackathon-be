# fe/CLAUDE.md — Tendoo AI Frontend

React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui admin portal.

---

## Stack

| Mục | Chi tiết |
|-----|---------|
| Framework | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui (`src/components/ui/`) |
| Routing | TanStack Router (`router.tsx`) |
| Server state | TanStack Query (`useQuery`, `useMutation`) |
| Forms | react-hook-form + zod |
| Icons | lucide-react |
| Tests | Vitest + @testing-library/react + jsdom |
| Coverage | @vitest/coverage-v8 → LCOV → SonarQube |

---

## Cấu trúc thư mục

```
src/
├── components/
│   ├── app/          # AppLayout, AppHeader, Sidebar
│   ├── ui/           # shadcn/ui primitives — KHÔNG tự ý sửa
│   └── <feature>/    # feature-scoped components
├── hooks/            # useDebounce, useSystemParameters, ...
├── lib/
│   ├── api/          # apiFetch wrapper + per-resource functions
│   └── utils.ts      # cn()
├── pages/            # Page-level components
├── types/            # TypeScript interfaces
└── test/             # Mirror của src/ — *.test.ts(x)
    ├── components/
    ├── hooks/
    ├── lib/
    └── pages/
```

---

## TypeScript Rules

### Không dùng `any`
```ts
// ❌
function handle(data: any) { ... }

// ✅
function handle(data: SystemParameter) { ... }
```

### Props phải có explicit interface + Readonly
```tsx
// ❌
function Modal({ open, onClose }) { ... }

// ✅
interface ModalProps {
  open: boolean
  onClose: () => void
}
export function Modal({ open, onClose }: Readonly<ModalProps>) { ... }
```
> Lý do: SonarQube S6759 — function params phải immutable

### Không dùng non-null assertion `!`
```tsx
// ❌ — S4325
return <Link to={item.path!}>

// ✅ — null guard trước
if (!item.path) return null
return <Link to={item.path}>
```

### Regex phải có unicode flag `u`
```ts
// ❌ — S7781
.replaceAll(/[^A-Z0-9_]/g, '')

// ✅
.replaceAll(/[^A-Z0-9_]/gu, '')
```

---

## React Rules

### Key trong list — không dùng index
```tsx
// ❌ — S6479
items.map((item, i) => <Row key={i} />)

// ✅ — dùng id từ data
items.map((item) => <Row key={item.id} />)

// ✅ — nếu không có id, tạo const key array trước
const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3'] as const
SKELETON_KEYS.map((key) => <Skeleton key={key} />)
```

### Không lồng ternary — extract render function
```tsx
// ❌ — S3358 (4 levels nesting)
{isLoading ? <Skeleton /> : isError ? <Error /> : rows.length === 0 ? <Empty /> : <Table />}

// ✅ — extract ra function
const renderBody = () => {
  if (isLoading) return <Skeleton />
  if (isError) return <Error />
  if (rows.length === 0) return <Empty />
  return <Table />
}
// JSX:
{renderBody()}
```

### Không lồng template literal
```ts
// ❌ — S4624
return apiFetch(`${BASE}?${query.toString()}`)

// ✅ — extract trước
const qs = query.toString()
const url = qs ? `${BASE}?${qs}` : BASE
return apiFetch(url)
```

### `for...of` thay vì `.forEach()`
```ts
// ❌ — S7728
listeners.forEach((l) => l(state))

// ✅
for (const l of listeners) { l(state) }
```

### `Number.isFinite` thay vì global `isFinite`
```ts
// ❌ — S7773
if (isFinite(Number(val))) ...

// ✅
if (Number.isFinite(Number(val))) ...
```

---

## Styling Rules

**Không hardcode màu** — chỉ dùng semantic tokens:

| Dùng khi nào | Token |
|-------------|-------|
| Background trang | `bg-background` |
| Card / panel | `bg-card`, `text-card-foreground` |
| Text chính | `text-foreground` |
| Text phụ | `text-muted-foreground` |
| Border | `border-border` |
| Primary button | `bg-primary`, `text-primary-foreground` |
| Destructive | `text-destructive`, `bg-destructive` |
| Sidebar | `bg-sidebar`, `text-sidebar-foreground` |

```tsx
// ❌
<div className="bg-white text-gray-700 border-gray-200">

// ✅
<div className="bg-card text-card-foreground border-border">
```

---

## Table Rules (shadcn/ui)

`TableHead` mặc định đã có `scope="col"` — KHÔNG thêm thủ công, không override:

```tsx
// ✅ — src/components/ui/table.tsx đã handle
<TableHead>Tên cấu hình</TableHead>
```

---

## API Layer

### Pattern chuẩn
```ts
// src/lib/api/system-parameters.ts
const BASE = '/api/v1/system-parameters'

export async function listSystemParameters(params: ListParams) {
  const query = new URLSearchParams()
  if (params.keyword) query.set('keyword', params.keyword)
  query.set('page', String(params.page ?? 0))
  const qs = query.toString()
  const url = qs ? `${BASE}?${qs}` : BASE   // không lồng template literal
  return apiFetch<PageResponse<SystemParameter>>(url)
}
```

### Error handling trong mutation
```ts
try {
  await mutation.mutateAsync(data)
  toast({ title: 'Thành công', description: '...' })
  onSuccess()
} catch (err) {
  if (err instanceof ApiError && err.status === 409) {
    toast({ title: 'Lỗi', description: err.message, variant: 'destructive' })
  } else if (err instanceof ApiError) {
    toast({ title: 'Lỗi', description: err.message, variant: 'destructive' })
  } else {
    toast({ title: 'Lỗi', description: 'Đã có lỗi xảy ra', variant: 'destructive' })
  }
}
```

---

## Testing Rules

### Vị trí file test
```
src/test/[mirror-path]/[filename].test.ts(x)

# Ví dụ:
src/components/system-parameters/DeleteConfirmDialog.tsx
→ src/test/components/DeleteConfirmDialog.test.tsx
```

### Setup chuẩn cho component test
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock API modules (không mock hooks trực tiếp)
vi.mock('@/lib/api/system-parameters', () => ({
  deleteSystemParameter: vi.fn(),
}))

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock router nếu component dùng navigate
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: vi.fn() }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    createElement('a', { href: to }, children),
}))

// QueryClient wrapper — retry: false để test nhanh
function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => { vi.clearAllMocks() })
```

### Phải test đủ các path này
```
✅ Happy path: render đúng, call API đúng
✅ Error path: ApiError 409, ApiError non-409, generic Error
✅ Callback props: onClose, onSuccess được gọi đúng lúc
✅ Null/empty data: param=null, list=[]
✅ Loading state: skeleton hiện đúng
✅ Validation: form không submit khi invalid
```

### Coverage config (vite.config.ts)
```ts
coverage: {
  provider: 'v8',
  reporter: ['lcov', 'text'],
  reportsDirectory: './coverage',
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/test/**',
    'src/components/ui/**',   // shadcn/ui primitives — không test
    'src/main.tsx',
    'src/router.tsx',
    'src/types/**',
  ],
}
```

---

## SonarQube

### Scan command (với coverage)
```bash
# Bước 1 — generate LCOV
npm run test:coverage

# Bước 2 — scan
npx sonar-scanner \
  "-Dsonar.host.url=https://scan.gem-corp.tech" \
  "-Dsonar.token=<TOKEN>" \
  "-Dsonar.projectKey=Tendoo-Web-ReactJS" \
  "-Dsonar.sources=src" \
  "-Dsonar.exclusions=node_modules/**,dist/**,src/test/**" \
  "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info" \
  "-Dsonar.coverage.exclusions=src/components/ui/**,src/main.tsx,src/router.tsx,src/types/**"
```

### Quality Gate thresholds
- `new_coverage` ≥ 80% ← quan trọng nhất
- `new_violations` = 0
- `new_duplicated_lines_density` ≤ 3%

### Rules hay vi phạm

| Rule | Vấn đề | Fix |
|------|---------|-----|
| S6759 | Props không Readonly | `Readonly<Props>` |
| S6479 | key = array index | key = item.id hoặc const key array |
| S3358 | Ternary lồng nhau | Extract render function |
| S4624 | Template literal lồng | Extract variable trước |
| S7781 | Regex thiếu `/u` flag | Thêm `u` → `/pattern/gu` |
| S7728 | `.forEach()` | `for...of` |
| S7773 | `isFinite()` global | `Number.isFinite()` |
| S4325 | Non-null `!` | Null guard: `if (!x) return null` |
| S5256 | `<th>` thiếu scope | Default `scope="col"` trong TableHead |
| S1854 | Dead store | Xóa assignment thừa |
| S1481 | Unused variable | Xóa hoặc prefix `_` |

---

## Verify trước khi done

```bash
cd fe && npm run build        # 0 TypeScript errors
npm run test:coverage         # coverage ≥ 80%
```

Checklist:
- [ ] Build pass, 0 TS errors
- [ ] `Readonly<Props>` trên tất cả component params
- [ ] Không có array index làm key
- [ ] Không có nested ternary > 2 levels
- [ ] Regex có `/gu` flag
- [ ] `Number.isFinite` thay vì `isFinite`
- [ ] `for...of` thay vì `.forEach()`
- [ ] Coverage ≥ 80% trên files mới
- [ ] Test cover đủ: happy + error + callback paths
