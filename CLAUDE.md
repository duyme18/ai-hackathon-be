# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tendoo AI — Monorepo

Admin portal for Tendoo AI — quản lý prompt, flow, câu lệnh, tham số hệ thống.

## Directory Structure

```
ai-hackathon-be/
├── be/                  # Spring Boot 4 REST API (Java 21, MariaDB, Flyway, JWT)
│   ├── src/             # Source code — package com.ai_hackathon.app
│   ├── tasks/           # plan.md + todo.md cho feature đang làm
│   ├── output/          # API.md + DB-DESIGN.md (generated docs)
│   ├── SPEC.md          # Base project spec
│   ├── CLAUDE.md        # BE-specific instructions
│   └── SPEC-*.md        # Feature-specific specs (BE)
└── fe/                  # React Admin Portal (TypeScript, Tailwind, shadcn/ui)
    ├── src/
    │   ├── components/
    │   │   ├── app/     # AppLayout.tsx, Sidebar.tsx
    │   │   ├── ui/      # shadcn/ui primitives
    │   │   └── <feature>/  # feature-scoped components
    │   ├── pages/       # Page-level components (e.g. SystemParametersPage.tsx)
    │   └── router.tsx   # TanStack Router root
    ├── tasks/           # plan.md + todo.md cho feature đang làm
    ├── CLAUDE.md        # FE-specific instructions
    └── SPEC-*.md        # Feature-specific specs (FE)
```

## Sub-project Instructions

- **BE**: Read `be/CLAUDE.md` before touching backend code
- **FE**: Read `fe/CLAUDE.md` before touching frontend code

---

## Commands

### BE (Windows — PowerShell or cmd)

```powershell
# Quickest way to start BE on Windows:
cd be && .\run.bat          # sets default DB/JWT env vars, starts on :8080

# Or directly with Maven wrapper:
cd be
.\mvnw.cmd clean package -DskipTests   # build
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local  # run
.\mvnw.cmd test                         # run all tests
.\mvnw.cmd test jacoco:report           # tests + coverage → target/site/jacoco/
.\mvnw.cmd flyway:info                  # migration status
```

> On Unix/Mac use `./mvnw` instead of `.\mvnw.cmd`.

### FE

```bash
cd fe && npm run build && npm run lint
```

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

**BE:** `cd be && .\mvnw.cmd clean package -DskipTests` → `.\run.bat`

**FE:** `cd fe && npm run build && npm run lint`

---

## BE Quick Reference

| Mục | Chi tiết |
|-----|---------|
| Framework | Spring Boot 4.0.6, Java 21, Maven |
| Base package | `com.ai_hackathon.app` |
| DB | MariaDB + Flyway (migrations: `be/src/main/resources/db/migration/`) |
| Auth | JWT — mọi endpoint đều yêu cầu token |
| Pattern | Entity → Repository → Service (interface + impl) → Controller |
| Response | Wrap trong `ApiResponse<T>` |
| Error | `AppException(ErrorCode.X)` → `GlobalExceptionHandler` |
| API base | `/api/v1/` |
| Swagger | `http://localhost:8080/swagger-ui.html` |

**Migration naming:** `V{n}__{snake_case}.sql` — KHÔNG sửa migration đã applied. Next migration: **V9**.

**Code conventions:**
- `@Transactional(readOnly = true)` class-level, override cho write methods
- `findOrThrow(id)` pattern — không return null
- Không dùng `@Data` — chỉ `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`
- Không return Entity từ Controller — luôn dùng DTO

**Existing domain entities** (do NOT duplicate):

| Entity | Enums |
|--------|-------|
| `User` | — |
| `Project` | `ProjectStatus` |
| `Task` | `TaskStatus`, `TaskPriority` |
| `Tag` | — |
| `SpecFile` | `SpecFileStatus` |
| `ChatMessage` | `ChatRole` |
| `SystemParameter` | — |

**ErrorCode enum** (add new entries, never remove/rename existing):

| Code | HTTP | Message |
|------|------|---------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `UNAUTHORIZED` | 401 | Authentication required |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already exists |
| `USER_NOT_FOUND` | 404 | User not found |
| `PROJECT_NOT_FOUND` | 404 | Project not found |
| `TASK_NOT_FOUND` | 404 | Task not found |
| `TAG_NOT_FOUND` | 404 | Tag not found |
| `SPEC_FILE_NOT_FOUND` | 404 | Spec file not found |
| `CHAT_MESSAGE_NOT_FOUND` | 404 | Chat message not found |
| `SYSTEM_PARAMETER_NOT_FOUND` | 404 | System parameter not found |
| `SYSTEM_PARAMETER_KEY_EXISTS` | 409 | System parameter key already exists |
| `SYSTEM_PARAMETER_IN_USE` | 409 | System parameter is in use |
| `BAD_REQUEST` | 400 | Bad request |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |

---

## FE Quick Reference

| Mục | Chi tiết |
|-----|---------|
| Framework | React + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Routing | TanStack Router (`router.tsx`) |
| State | React hooks + TanStack Query cho server state |
| API base | `VITE_API_BASE_URL` env var |

**FE conventions:** Xem `fe/CLAUDE.md` để biết đầy đủ.

---

## Key Files to Read Before Editing

| Tình huống | Đọc trước |
|-----------|----------|
| Làm BE feature mới | `be/SPEC-<feature>.md` → `be/tasks/plan.md` → `be/CLAUDE.md` |
| Làm FE feature mới | `fe/SPEC-<feature>.md` → `fe/tasks/plan.md` → `fe/CLAUDE.md` |
| Thêm API endpoint | `be/output/API.md` (convention), existing controllers |
| Thêm DB migration | `be/src/main/resources/db/migration/` (current latest: V8, next: V9) |
| Thêm UI component | `fe/src/components/` — reuse trước khi tạo mới |
| Thêm domain entity | Check existing entities table above to avoid duplication |

---

## Before Finishing Any Task

- [ ] Build pass (BE: `.\mvnw.cmd clean package -DskipTests` / FE: `npm run build`)
- [ ] Không có TypeScript errors (FE: `npm run lint`)
- [ ] Đánh dấu task `[x]` trong `tasks/todo.md`
- [ ] Không commit `application-local.yaml`, `.env`, credentials, secrets
