---
description: "Phỏng vấn nhanh để tạo SPEC cho feature mới. Dùng: /workflow/write-spec [mô tả feature]"
allowed-tools: Bash, Read, Write
---

# /workflow/write-spec — Tạo Feature SPEC

**Feature:** $ARGUMENTS

## Bước 1 — Đọc context hiện tại

Đọc song song:
- `CLAUDE.md` — entities, ErrorCode, API conventions
- `be/output/API.md` — endpoints đã có
- `be/output/DB-DESIGN.md` — schema hiện tại
- Các `be/SPEC-*.md` và `fe/SPEC-*.md` đã có → tránh trùng FR-xxx

Xác định FR number tiếp theo (ví dụ đã có FR-001..FR-010 → bắt đầu từ FR-011).

## Bước 2 — Phân tích yêu cầu từ "$ARGUMENTS"

Xác định:
| Câu hỏi | Trả lời |
|---------|---------|
| Actor là ai? | Admin / User / System |
| Core action là gì? | Create / Read / Update / Delete / Search |
| Data model: entity mới hay extend? | |
| Business rules đặc biệt? | Validation, permission, state machine |
| UI cần những màn hình nào? | List / Form / Detail / Dialog |

## Bước 3 — Tạo BE SPEC

Tạo file `be/SPEC-[feature-slug].md`:

```markdown
# SPEC: [Feature Name] — Backend
**Version**: 1.0 | **Status**: Draft | **Date**: [today]

## 1. Functional Requirements
| ID | Mô tả | Priority |
|----|-------|----------|
| FR-0xx | ... | Must |

## 2. Data Model
### New/Modified Entities
| Field | Type | Nullable | Default | Ghi chú |

### Migration
File: `Vn__[feature_snake].sql`
```sql
-- schema changes
```

## 3. API Endpoints
| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | /api/v1/... | JWT | |

### Request/Response DTOs
...

## 4. Business Rules
| ID | Rule |
|----|------|
| BR-xxx | |

## 5. Error Codes (thêm vào ErrorCode enum)
| Code | HTTP | Message |
|------|------|---------|
```

## Bước 4 — Tạo FE SPEC

Tạo file `fe/SPEC-[feature-slug].md`:

```markdown
# SPEC: [Feature Name] — Frontend
**Version**: 1.0 | **Route**: /[path]

## 1. Functional Requirements
| ID | Mô tả |
|----|-------|
| FR-0xx | |

## 2. API Mapping
| FR | Method | Endpoint | Hook |
|----|--------|----------|------|

## 3. UI Screens
### Screen 1: [Name]
- Layout: ...
- Components: Table / Form / Dialog / ...
- States: Loading (Skeleton) / Empty / Error / Data

### Screen 2: [Modal/Dialog]

## 4. Form Validation
| Field | Required | Rules | Error message |
|-------|----------|-------|---------------|

## 5. Success/Error Messages
| Action | Success toast | Error toast |
|--------|--------------|------------|

## 6. Success Criteria
- [ ] FR-0xx: [mô tả điều kiện pass]
```

## Bước 5 — Tạo task breakdown

Tạo `be/tasks/todo.md` và `fe/tasks/todo.md` với checklist:

```markdown
## BE Tasks
- [ ] Entity + Migration Vn
- [ ] Repository
- [ ] Service interface + impl
- [ ] Controller + DTOs
- [ ] Unit tests

## FE Tasks  
- [ ] Types (src/types/)
- [ ] API functions (src/lib/api/)
- [ ] TanStack Query hooks
- [ ] Components
- [ ] Page + Route
- [ ] Tests
```

## Output
Tạo files:
- `be/SPEC-[slug].md`
- `fe/SPEC-[slug].md`
- Cập nhật `be/tasks/todo.md` và `fe/tasks/todo.md`
