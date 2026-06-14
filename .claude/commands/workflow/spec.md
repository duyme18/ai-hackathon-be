# /spec — Generate Feature SPEC

Tạo file SPEC đầy đủ cho một feature mới của Tendoo AI project.

**Feature description:** $ARGUMENTS

## Quy trình

### Bước 1 — Đọc context
1. `CLAUDE.md` (root) — existing entities, ErrorCode, API conventions
2. `be/output/API.md` — existing endpoints
3. `be/output/DB-DESIGN.md` — existing schema
4. Các SPEC file đã có để tránh trùng FR-xxx numbering

### Bước 2 — Extract requirements từ mô tả
Phân tích `$ARGUMENTS` để xác định:
- Actors (ai dùng tính năng này?)
- Core use cases
- Business rules
- Data model cần thiết (entity mới hay extend?)
- API endpoints
- UI screens

### Bước 3 — Tạo BE SPEC

File: `be/SPEC-$ARGUMENTS.md`

```markdown
# SPEC: [Feature Name] — Backend
**Trạng thái**: Bản nháp
**Ngày**: [today]

## 1. Yêu cầu chức năng
| FR-xxx | Mô tả |

## 2. Data Model
### Entity mới / thay đổi
### Migration: Vxx__...sql

## 3. API Endpoints
| Method | Path | Mô tả | Request | Response |

## 4. Business Rules
| BR-xxx | Rule |

## 5. Error Codes
| Code | HTTP | Message |
```

### Bước 4 — Tạo FE SPEC

File: `fe/SPEC-$ARGUMENTS.md`

```markdown
# SPEC: [Feature Name] — Frontend
**Trạng thái**: Bản nháp
**Route**: /path

## 1. Yêu cầu chức năng
| FR-xxx | Mô tả |

## 2. API Mapping
| FR | Method | Endpoint |

## 3. UI Screens
### Màn hình 1: ...
### Màn hình 2: Modal/Dialog

## 4. Validation
| Field | Rule | Error message |

## 5. Error Messages
| Trường hợp | Thông báo | Vị trí |

## 6. Flow chi tiết (nếu có)

## 7. Success Criteria
- [ ] ...
```

### Bước 5 — Cập nhật tasks
Tạo hoặc cập nhật `be/tasks/plan.md`, `be/tasks/todo.md`, `fe/tasks/plan.md`, `fe/tasks/todo.md` với task breakdown cho feature này.

## Output
Tạo 2 files:
- `be/SPEC-$ARGUMENTS.md`
- `fe/SPEC-$ARGUMENTS.md`
