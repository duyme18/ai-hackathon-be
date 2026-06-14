# /fe-figma — Implement FE từ Figma URL + SPEC

Đọc Figma design, map vào SPEC, implement React component đầy đủ.

**Figma URL hoặc "feature-name figma-url":** $ARGUMENTS

## Quy trình

### Bước 1 — Parse arguments
Từ `$ARGUMENTS` extract:
- Feature name (để tìm `fe/SPEC-<feature>.md`)
- Figma URL (extract fileKey + nodeId)

### Bước 2 — Đọc song song
Đồng thời:
- `get_design_context(fileKey, nodeId)` + `get_screenshot(fileKey, nodeId, 1600)`
- Đọc `fe/SPEC-<feature>.md` nếu tồn tại
- Đọc `fe/CLAUDE.md`
- Đọc `fe/tasks/plan.md`, `fe/tasks/todo.md`

### Bước 3 — Gap analysis
So sánh Figma vs SPEC vs BE entity:

| Điểm khác biệt | Figma | SPEC | BE Entity | Xử lý |
|---|---|---|---|---|

Nếu có gap nghiêm trọng (field không tồn tại trong BE) → flag rõ ràng trước khi code.

### Bước 4 — Component plan
Liệt kê files cần tạo/sửa:
```
src/types/<feature>.ts
src/lib/api/<feature>.ts
src/hooks/use<Feature>.ts
src/components/<feature>/
  ├── <Feature>Page.tsx (hoặc trong pages/)
  ├── <Feature>FormModal.tsx
  ├── Delete<Feature>Dialog.tsx
  └── <Feature>Badge.tsx (nếu cần)
```

### Bước 5 — Implement
Theo Figma layout + SPEC business rules + fe/CLAUDE.md conventions:
- Semantic color tokens (không hardcode)
- shadcn/ui components (Button, Dialog, Table, Input, Select, Badge, Skeleton, Toast)
- TanStack Query (useQuery, useMutation, invalidateQueries)
- TypeScript strict — không dùng `any`
- Debounce search 300ms
- Loading/Empty/Error states đầy đủ
- Toast success/error từ API message

### Bước 6 — Build verify
```bash
cd fe && npm run build && npm run lint
```

### Bước 7 — Update todo
Đánh dấu `[x]` trong `fe/tasks/todo.md`.

## Kết quả output
- Files đã tạo/sửa
- Route: `http://localhost:5173/<path>`
- Build: PASS
- Gaps đã xử lý / cần confirm thêm
