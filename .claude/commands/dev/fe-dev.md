# /fe-dev — Implement FE Feature từ Figma + SPEC

Implement FE feature cho Tendoo AI admin portal dựa trên Figma design và SPEC.

**Feature:** $ARGUMENTS

## Quy trình bắt buộc

### Bước 1 — Đọc context
1. Đọc `fe/CLAUDE.md` — conventions (semantic tokens, no hardcode colors, component reuse)
2. Nếu tồn tại `fe/SPEC-$ARGUMENTS.md` → đọc toàn bộ, xác định FR-xxx, API mapping, UI screens
3. Đọc `fe/tasks/plan.md` và `fe/tasks/todo.md`
4. Kiểm tra components đã có: `fe/src/components/` — reuse trước khi tạo mới

### Bước 2 — Đọc Figma (nếu có URL trong SPEC hoặc argument)
Dùng Figma MCP tools:
- `get_design_context` → layout, components, spacing
- `get_screenshot` → visual reference

Map màu Figma → semantic tokens (KHÔNG hardcode hex):
- Background → `bg-background`, `bg-card`
- Text → `text-foreground`, `text-muted-foreground`
- Border → `border-border`
- Primary action → `bg-primary`, `text-primary-foreground`
- Danger → `text-destructive`, `bg-destructive`

### Bước 3 — Component breakdown
Trước khi code, liệt kê:
- Page component (`src/pages/`)
- Feature components (`src/components/<feature>/`)
- shadcn/ui primitives cần dùng (`src/components/ui/`)
- Custom hooks (`src/hooks/`)
- API functions (`src/lib/api/`)
- Types (`src/types/`)

### Bước 4 — Implement theo thứ tự
```
Types & interfaces
  → API functions (apiFetch wrapper)
  → TanStack Query hooks (useQuery, useMutation)
  → Feature components (bottom-up: nhỏ trước)
  → Page component
  → Route trong router.tsx (nếu route mới)
  → Sidebar link (nếu cần menu item mới)
```

### Bước 5 — Rules không được vi phạm
- KHÔNG dùng `any` trong TypeScript
- KHÔNG hardcode màu `#fff`, `text-gray-*`, `bg-white`
- Dùng `semantic tokens` từ `styles.css`
- Component props phải có explicit TypeScript interface
- Toast success/error: dùng `toast()` từ `@/components/ui/use-toast`
- Loading state: Skeleton hoặc spinner
- Empty state: icon + text + action button (nếu phù hợp)
- Error state: toast từ API message

### Bước 6 — Verify
```bash
cd fe && npm run build && npm run lint
```
Build và lint PHẢI pass. KHÔNG có TypeScript errors.

### Bước 7 — Update todo
Đánh dấu `[x]` cho từng task đã xong trong `fe/tasks/todo.md`.

## Output mong đợi
- Danh sách files đã tạo/sửa
- Route: `http://localhost:5173/<path>`
- Build status: PASS, 0 lint errors
