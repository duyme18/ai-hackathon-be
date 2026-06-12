# Tendoo AI — Monorepo CLAUDE.md

## Project Overview

Admin portal for Tendoo AI — quản lý prompt, flow, câu lệnh, tham số hệ thống.

## Directory Structure

```
ai-hackathon-be/
├── be/                  # Spring Boot 4 REST API (Java 21, MariaDB, Flyway, JWT)
│   ├── src/             # Source code
│   ├── tasks/           # plan.md + todo.md cho feature đang làm
│   ├── output/          # API.md + DB-DESIGN.md (generated docs)
│   ├── SPEC.md          # Base project spec
│   ├── CLAUDE.md        # BE-specific instructions
│   └── SPEC-*.md        # Feature-specific specs (BE)
└── fe/                  # React Admin Portal (Lovable, TypeScript, Tailwind, shadcn/ui)
    ├── src/             # Source code (Lovable export)
    ├── tasks/           # plan.md + todo.md cho feature đang làm
    ├── CLAUDE.md        # FE-specific instructions
    └── SPEC-*.md        # Feature-specific specs (FE)
```

## Sub-project Instructions

- **BE**: Đọc `be/CLAUDE.md` trước khi làm backend
- **FE**: Đọc `fe/CLAUDE.md` trước khi làm frontend

---

## Workflow: Implement Feature từ Spec

### Bước 1 — Đọc Spec

```
Đọc SPEC-<feature>.md trong be/ hoặc fe/ tương ứng.
Xác định: FR-xxx, API endpoints, DB schema, UI screens, business rules.
```

### Bước 2 — Tạo Plan + Todo

Tạo hoặc cập nhật `tasks/plan.md` và `tasks/todo.md` trong thư mục tương ứng (be/ hoặc fe/).

**plan.md** — Implementation plan chi tiết:
- Architecture decisions
- Dependency graph (task nào phụ thuộc task nào)
- Từng task: description, acceptance criteria, files cần tạo/sửa, size (XS/S/M/L)

**todo.md** — Checklist theo task:
```markdown
## Phase 1: ...
- [ ] Task 1 — mô tả ngắn
- [ ] Task 2 — mô tả ngắn
### Checkpoint 1
- [ ] Build pass
- [ ] ...
```

### Bước 3 — Implement từng Task

- Làm xong task → đánh dấu `[x]` trong `tasks/todo.md` ngay lập tức
- Verify build pass ở mỗi checkpoint trước khi tiếp tục
- Không implement ngoài phạm vi task hiện tại

### Bước 4 — Verify

**BE:**
```bash
cd be && ./mvnw clean package -DskipTests
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**FE:**
```bash
cd fe && npm run build && npm run lint
```

---

## BE Quick Reference

| Mục | Chi tiết |
|-----|---------|
| Framework | Spring Boot 4.0.6, Java 21, Maven |
| DB | MariaDB + Flyway (migrations: `be/src/main/resources/db/migration/`) |
| Auth | JWT — mọi endpoint đều yêu cầu token |
| Pattern | Entity → Repository → Service (interface + impl) → Controller |
| Response | Wrap trong `ApiResponse<T>` |
| Error | `AppException(ErrorCode.X)` → `GlobalExceptionHandler` |
| API base | `/api/v1/` |
| Swagger | `http://localhost:8080/swagger-ui.html` |

**Migration naming:** `V{n}__{snake_case}.sql` — KHÔNG sửa migration đã applied.

**Code conventions:**
- `@Transactional(readOnly = true)` class-level, override cho write methods
- `findOrThrow(id)` pattern — không return null
- Không dùng `@Data` — chỉ `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`
- Không return Entity từ Controller — luôn dùng DTO

---

## FE Quick Reference

| Mục | Chi tiết |
|-----|---------|
| Framework | React + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Routing | TanStack Router |
| State | React hooks, TanStack Query cho server state |
| API base | `VITE_API_BASE_URL` env var |

**FE conventions:** Xem `fe/CLAUDE.md` để biết đầy đủ.

---

## Key Files to Read Before Editing

| Tình huống | Đọc trước |
|-----------|----------|
| Làm BE feature mới | `be/SPEC-<feature>.md` → `be/tasks/plan.md` → `be/CLAUDE.md` |
| Làm FE feature mới | `fe/SPEC-<feature>.md` → `fe/tasks/plan.md` → `fe/CLAUDE.md` |
| Thêm API endpoint | `be/output/API.md` (xem convention), existing controllers |
| Thêm DB migration | `be/src/main/resources/db/migration/` (xem V cuối cùng) |
| Thêm UI component | `fe/src/components/` (reuse trước khi tạo mới) |

---

## Before Finishing Any Task

- [ ] Build pass (BE: `./mvnw clean package -DskipTests` / FE: `npm run build`)
- [ ] Không có TypeScript errors (FE)
- [ ] Đánh dấu task `[x]` trong `tasks/todo.md`
- [ ] Không commit `.env`, credentials, secrets
