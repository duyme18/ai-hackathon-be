# /full-stack — Full Stack Feature Implementation

Implement đầy đủ một feature: BE (Spring Boot) + FE (React), từ DB migration đến UI.

**Feature:** $ARGUMENTS

## Quy trình

### Bước 0 — Đọc toàn bộ context
1. `CLAUDE.md` (root) — entity list, ErrorCode, conventions
2. `be/CLAUDE.md` + `fe/CLAUDE.md` — tech-specific rules
3. `be/SPEC-$ARGUMENTS.md` hoặc `fe/SPEC-$ARGUMENTS.md` nếu tồn tại
4. `be/tasks/plan.md`, `be/tasks/todo.md`
5. `fe/tasks/plan.md`, `fe/tasks/todo.md`

### Phase 1 — BE Implementation

**Thứ tự:**
```
DB Migration (V9+)
  → Entity (Lombok: @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor)
  → Repository
  → Request DTO + Response DTO
  → Service interface + ServiceImpl
  → Controller (/api/v1/<resource>)
  → ErrorCode additions
```

**Verify BE:**
```powershell
cd be && .\mvnw.cmd clean package -DskipTests
```

### Phase 2 — FE Implementation

**Thứ tự:**
```
Types (src/types/<feature>.ts)
  → API client (src/lib/api/<feature>.ts)
  → TanStack Query hooks (src/hooks/use<Feature>.ts)
  → Components (src/components/<feature>/)
  → Page (src/pages/<Feature>Page.tsx)
  → Route (src/router.tsx)
  → Sidebar link (src/components/app/Sidebar.tsx)
```

**Verify FE:**
```bash
cd fe && npm run build && npm run lint
```

### Phase 3 — Integration check
- BE swagger: `http://localhost:8080/swagger-ui.html` → endpoint có
- FE: `http://localhost:5173/<route>` → page render
- Test golden path: CRUD operations hoạt động end-to-end

### Bước cuối — Update todo
Đánh dấu `[x]` trong `be/tasks/todo.md` và `fe/tasks/todo.md`.

## Checklist
- [ ] BE build pass
- [ ] FE build pass, 0 TypeScript errors
- [ ] API endpoints documented (swagger)
- [ ] Route accessible
- [ ] CRUD golden path hoạt động
- [ ] Toast success/error hiển thị đúng
- [ ] Empty state hiển thị khi không có data
