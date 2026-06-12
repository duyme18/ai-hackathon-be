# Implementation Plan: Quản lý Tham số Hệ thống (System Parameters)

**Spec:** `SPEC-system-parameters.md`
**Ngày:** 2026-06-09

---

## Overview

Xây dựng full CRUD API cho `system_parameters` theo FR-001→FR-005 trong `spec/SPEC.md`. Sau khi implement xong, sinh 2 file tài liệu vào `/output/`: API documentation và database design.

---

## Architecture Decisions

- **Pattern:** Layered architecture — entity → repository → service → controller (giống Project/Task hiện tại)
- **Pagination:** Spring `Pageable` + `Page<T>`, trả về object có `content`, `totalElements`, `totalPages`, `page`, `size`
- **Search:** JPQL `LIKE %keyword%` trên `key` OR `description` (case-insensitive, OR condition — BR-001)
- **In-use check:** Query `command_parameter_mappings.parameter_id` — stub migration V8 tạo bảng rỗng
- **Error codes:** Thêm 3 entries vào `ErrorCode.java`

---

## Dependency Graph

```
V7 migration (system_parameters)
    │
    └── SystemParameter entity
            │
            ├── SystemParameterRepository (JPQL search + in-use query)
            │           │
            │           └── SystemParameterServiceImpl
            │                       │
            │                       └── SystemParameterController
            │
            └── SystemParameterResponse DTO (static factory)

V8 migration (command_parameter_mappings stub)
    │
    └── SystemParameterRepository#isInUse()

ErrorCode (3 new entries) ──→ SystemParameterServiceImpl
SystemParameterRequest DTO ──→ SystemParameterController

[After impl] output/API.md + output/DB-DESIGN.md
```

---

## Phase 1: Foundation — Database & Entity

### Task 1: Flyway migrations V7 + V8

**Description:** Tạo 2 file SQL migration: V7 tạo bảng `system_parameters`, V8 tạo stub bảng `command_parameter_mappings`.

**Acceptance criteria:**
- [ ] `V7__create_system_parameters.sql`: id, key (VARCHAR 20 UNIQUE NOT NULL), value (TEXT NOT NULL), description (TEXT), timestamps, index trên key
- [ ] `V8__create_command_parameter_mappings.sql`: id, command_id, parameter_id (FK → system_parameters.id)
- [ ] Application startup không lỗi Flyway

**Verification:**
- [ ] `./mvnw spring-boot:run -Dspring-boot.run.profiles=local` khởi động thành công

**Dependencies:** None

**Files:**
- `src/main/resources/db/migration/V7__create_system_parameters.sql`
- `src/main/resources/db/migration/V8__create_command_parameter_mappings.sql`

**Size:** XS

---

### Task 2: `SystemParameter` entity + `ErrorCode` additions

**Description:** Tạo JPA entity + thêm 3 error codes vào `ErrorCode.java`.

**Acceptance criteria:**
- [ ] `SystemParameter.java` có đủ fields, `@PrePersist`/`@PreUpdate` set timestamps
- [ ] `ErrorCode`: `SYSTEM_PARAMETER_NOT_FOUND` (404), `SYSTEM_PARAMETER_KEY_EXISTS` (409), `SYSTEM_PARAMETER_IN_USE` (409)
- [ ] Build pass

**Verification:**
- [ ] `./mvnw clean package -DskipTests` pass

**Dependencies:** Task 1

**Files:**
- `src/main/java/com/ai_hackathon/app/entity/SystemParameter.java`
- `src/main/java/com/ai_hackathon/app/exception/ErrorCode.java`

**Size:** S

---

### Checkpoint 1: Foundation

- [ ] `./mvnw clean package -DskipTests` pass
- [ ] App starts, Flyway V7 + V8 Applied

---

## Phase 2: Repository + DTOs

### Task 3: `SystemParameterRepository` + DTOs

**Description:** Repository với search query và in-use check. Request DTO với validation. Response DTOs.

**Acceptance criteria:**
- [ ] Repository: `findByKeyword(keyword, pageable)` JPQL query (key OR description, case-insensitive)
- [ ] Repository: `existsByKeyIgnoreCase(String key)` cho uniqueness check
- [ ] Repository: `isInUse(Long parameterId)` query `command_parameter_mappings`
- [ ] `SystemParameterRequest`: `key` với `@NotBlank @Pattern(regexp="^[A-Z0-9_]+$") @Size(max=20)`, `value` với `@NotBlank`
- [ ] `SystemParameterResponse`: fields + static `from(SystemParameter)` factory
- [ ] `SystemParameterInUseResponse`: `boolean inUse`
- [ ] Build pass

**Verification:**
- [ ] `./mvnw clean package -DskipTests` pass

**Dependencies:** Task 2

**Files:**
- `src/main/java/com/ai_hackathon/app/repository/SystemParameterRepository.java`
- `src/main/java/com/ai_hackathon/app/dto/request/SystemParameterRequest.java`
- `src/main/java/com/ai_hackathon/app/dto/response/SystemParameterResponse.java`
- `src/main/java/com/ai_hackathon/app/dto/response/SystemParameterInUseResponse.java`

**Size:** M

---

## Phase 3: Service + Controller

### Task 4: `SystemParameterService` + `SystemParameterServiceImpl`

**Description:** Service layer với đầy đủ business logic và transaction management.

**Acceptance criteria:**
- [ ] `getAll(keyword, pageable)` → `Page<SystemParameterResponse>`
- [ ] `getById(id)` → throw `NOT_FOUND` nếu không tồn tại
- [ ] `create(request)` → check key unique → throw `KEY_EXISTS` nếu trùng
- [ ] `update(id, request)` → check exists → check in-use → throw `IN_USE` nếu đang dùng
- [ ] `delete(id)` → check exists → check in-use → throw `IN_USE` nếu đang dùng
- [ ] `isInUse(id)` → check exists → query mapping table
- [ ] `@Transactional(readOnly = true)` class-level, write methods có `@Transactional`
- [ ] Build pass

**Verification:**
- [ ] `./mvnw clean package -DskipTests` pass

**Dependencies:** Task 3

**Files:**
- `src/main/java/com/ai_hackathon/app/service/SystemParameterService.java`
- `src/main/java/com/ai_hackathon/app/service/impl/SystemParameterServiceImpl.java`

**Size:** M

---

### Task 5: `SystemParameterController`

**Description:** REST controller 6 endpoints với Swagger annotations.

**Acceptance criteria:**
- [ ] `GET /api/v1/system-parameters?keyword=&page=0&size=20` → 200 paginated
- [ ] `GET /api/v1/system-parameters/{id}` → 200 / 404
- [ ] `POST /api/v1/system-parameters` → 201 / 400 / 409
- [ ] `PUT /api/v1/system-parameters/{id}` → 200 / 400 / 404 / 409
- [ ] `DELETE /api/v1/system-parameters/{id}` → 200 / 404 / 409
- [ ] `GET /api/v1/system-parameters/{id}/in-use` → 200 `{ inUse: false }`
- [ ] Swagger UI hiển thị group "System Parameters" với 6 endpoints
- [ ] Build pass

**Verification:**
- [ ] `./mvnw clean package -DskipTests` pass
- [ ] App starts
- [ ] `POST /api/v1/system-parameters` với `{"key":"TEST_KEY","value":"test"}` → 201
- [ ] `POST /api/v1/system-parameters` với `{"key":"lowercase","value":"v"}` → 400
- [ ] `GET /api/v1/system-parameters` → 200 với paginated structure

**Dependencies:** Task 4

**Files:**
- `src/main/java/com/ai_hackathon/app/controller/SystemParameterController.java`

**Size:** M

---

### Checkpoint 2: Core Feature Complete

- [ ] `./mvnw clean package -DskipTests` pass
- [ ] App starts clean
- [ ] Swagger UI hiển thị 6 endpoints
- [ ] CRUD flow hoạt động
- [ ] Validation errors → 400; key duplicate → 409; in-use → 409

---

## Phase 4: Documentation Output

### Task 6: `output/API.md` — API Documentation

**Description:** Tài liệu đầy đủ 6 endpoints: method, path, params, request body, response schema, error codes, curl examples.

**Files:** `output/API.md`

**Size:** S

---

### Task 7: `output/DB-DESIGN.md` — Database Design

**Description:** Tài liệu thiết kế DB: schema 2 bảng, ERD text, constraints, indexes, design decisions.

**Files:** `output/DB-DESIGN.md`

**Size:** S

---

### Checkpoint 3: Done

- [ ] Build pass
- [ ] All endpoints hoạt động
- [ ] `output/API.md` và `output/DB-DESIGN.md` tồn tại
- [ ] Tất cả success criteria trong `SPEC-system-parameters.md` được tick

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `key` là reserved word trong MariaDB | Low | Dùng backtick `` `key` `` trong SQL |
| Bảng mapping thực tế có tên khác | Medium | Stub V8, dễ update query sau |
| Spring Boot 4.x incompatibility | Low | Theo đúng pattern hiện tại của project |