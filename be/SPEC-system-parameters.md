# Spec: Quản lý Tham số Hệ thống (System Parameters)

**Nguồn yêu cầu:** `spec/SPEC.md`
**Ngày tạo:** 2026-06-09

---

## Assumptions

| # | Giả định | Ảnh hưởng nếu sai |
|---|----------|--------------------|
| T1 | API base path: `/api/v1/system-parameters` (theo convention hiện tại) | Đổi path nếu khác |
| T2 | "Bảng mapping câu lệnh ↔ tham số" **chưa tồn tại** trong schema (V1–V6 không có) — sẽ tạo stub migration V8, `in-use` trả `false` cho đến khi bảng đó được implement | Nếu bảng đã tồn tại → cần tên bảng và cột cụ thể |
| T3 | `User` entity không có `role` field → **bỏ qua role check Admin**, chỉ yêu cầu JWT authenticated | Nếu cần role → phải thêm cột `role` vào bảng `users` trước |
| T4 | Bỏ `created_by`/`updated_by` audit fields (pattern hiện tại không có — xem `Project`, `Task`) | Nếu cần → phải wire SecurityContext |
| T5 | Pagination: Spring `Pageable`, default page=0, size=20, sort=`created_at,desc` | |

---

## 1. Objective

Xây dựng CRUD API cho tính năng **Quản lý Tham số Hệ thống** — cho phép Quản trị hệ thống tạo, đọc, sửa, xoá các cặp key-value cấu hình (`system_parameters`).

**Người dùng:** Quản trị hệ thống (JWT authenticated)

**Thành công khi:**
- 6 endpoints (CRUD + `/in-use`) hoạt động đúng theo FR-001 → FR-005
- Validation `key`: bắt buộc, `^[A-Z0-9_]+$`, tối đa 20 ký tự, unique
- Không cho phép sửa/xoá tham số đang in-use → 409 Conflict
- Tất cả endpoints yêu cầu JWT → 401 khi thiếu token
- Response time p95 < 500ms

---

## 2. Tech Stack

- **Spring Boot:** 4.0.6 (Java 21, Maven)
- **Database:** MariaDB + Flyway migrations
- **ORM:** Spring Data JPA + Hibernate
- **Validation:** `spring-boot-starter-validation` (`@Valid`, JSR-380)
- **Exception:** `AppException` + `ErrorCode` enum + `GlobalExceptionHandler`
- **Docs:** SpringDoc OpenAPI / Swagger UI
- **Lombok:** `@Getter`, `@Builder`, `@RequiredArgsConstructor`, etc.

---

## 3. Commands

```bash
# Build
./mvnw clean package -DskipTests

# Test
./mvnw test

# Run dev
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Swagger UI
http://localhost:8080/swagger-ui.html
```

---

## 4. Project Structure

Files cần tạo mới theo layered architecture hiện tại:

```
src/main/java/com/ai_hackathon/app/
├── entity/
│   └── SystemParameter.java                        # JPA entity → table system_parameters
├── repository/
│   └── SystemParameterRepository.java              # Spring Data JPA + search query
├── service/
│   ├── SystemParameterService.java                 # Interface
│   └── impl/
│       └── SystemParameterServiceImpl.java         # Logic + transaction
├── controller/
│   └── SystemParameterController.java              # REST /api/v1/system-parameters
├── dto/
│   ├── request/
│   │   └── SystemParameterRequest.java             # Create + Update body
│   └── response/
│       ├── SystemParameterResponse.java            # Single record DTO
│       └── SystemParameterInUseResponse.java       # { inUse: boolean }
└── exception/
    └── ErrorCode.java                              # Thêm 3 error codes mới

src/main/resources/db/migration/
├── V7__create_system_parameters.sql               # Bảng mới
└── V8__create_command_parameter_mappings.sql      # Stub bảng mapping (cho in-use)
```

---

## 5. Code Style

Theo pattern hiện tại (xem `Project.java`, `ProjectServiceImpl.java`, `ProjectController.java`).

### Entity

```java
@Entity
@Table(name = "system_parameters")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SystemParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String key;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String value;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
```

### Response DTO — factory method pattern

```java
@Getter @Builder
public class SystemParameterResponse {
    private Long id;
    private String key;
    private String value;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SystemParameterResponse from(SystemParameter p) {
        return SystemParameterResponse.builder()
                .id(p.getId()).key(p.getKey()).value(p.getValue())
                .description(p.getDescription())
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .build();
    }
}
```

### Quy tắc:
- `@Transactional(readOnly = true)` ở class level, `@Transactional` override cho write methods
- `findOrThrow(id)` pattern cho lookup
- Không dùng `@Data` — chỉ `@Getter @Setter @Builder ...`

---

## 6. API Specification

### Danh sách endpoints

| Method | Path | Status | FR |
|--------|------|--------|----|
| GET | `/api/v1/system-parameters` | 200 | FR-001 |
| GET | `/api/v1/system-parameters/{id}` | 200 / 404 | FR-002 |
| POST | `/api/v1/system-parameters` | 201 / 400 / 409 | FR-003 |
| PUT | `/api/v1/system-parameters/{id}` | 200 / 400 / 404 / 409 | FR-004 |
| DELETE | `/api/v1/system-parameters/{id}` | 200 / 404 / 409 | FR-005 |
| GET | `/api/v1/system-parameters/{id}/in-use` | 200 / 404 | FR-004, FR-005 |

### GET `/api/v1/system-parameters`

Query params: `keyword` (optional), `page` (default=0), `size` (default=20)

Tìm kiếm: `key LIKE '%keyword%' OR description LIKE '%keyword%'` (case-insensitive, OR condition — BR-001)

Response:
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      { "id": 1, "key": "MAX_RETRY_COUNT", "value": "3", "description": "Max retries", "createdAt": "...", "updatedAt": "..." }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "page": 0,
    "size": 20
  }
}
```

### POST `/api/v1/system-parameters`

Request body:
```json
{ "key": "MAX_RETRY_COUNT", "value": "3", "description": "Max retries" }
```

### GET `/api/v1/system-parameters/{id}/in-use`

Response:
```json
{ "status": 200, "message": "Success", "data": { "inUse": false } }
```

---

## 7. Error Codes — thêm vào `ErrorCode.java`

```java
SYSTEM_PARAMETER_NOT_FOUND(HttpStatus.NOT_FOUND, "System parameter not found"),
SYSTEM_PARAMETER_KEY_EXISTS(HttpStatus.CONFLICT, "System parameter key already exists"),
SYSTEM_PARAMETER_IN_USE(HttpStatus.CONFLICT, "System parameter is in use and cannot be modified"),
```

---

## 8. Database Migrations

### V7 — `system_parameters`

```sql
CREATE TABLE system_parameters (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key`       VARCHAR(20)  NOT NULL UNIQUE,
    value       TEXT         NOT NULL,
    description TEXT,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_sp_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### V8 — stub `command_parameter_mappings`

```sql
CREATE TABLE command_parameter_mappings (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    command_id   BIGINT NOT NULL,
    parameter_id BIGINT NOT NULL,
    CONSTRAINT fk_cpm_parameter FOREIGN KEY (parameter_id) REFERENCES system_parameters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> **T2:** Bảng này là stub. Nếu bảng mapping thực tế đã tồn tại với tên khác → chỉ cần cập nhật query trong `SystemParameterRepository`.

---

## 9. Validation Rules

| Field | Bắt buộc | Regex | Max | BE annotation |
|-------|----------|-------|-----|---------------|
| `key` | Có | `^[A-Z0-9_]+$` | 20 | `@NotBlank @Pattern(regexp="^[A-Z0-9_]+$") @Size(max=20)` |
| `value` | Có | — | — | `@NotBlank` |
| `description` | Không | — | — | (none) |

---

## 10. Testing Strategy

- **Framework:** JUnit 5 + Mockito + Spring Boot Test
- **Unit test:** `SystemParameterServiceImpl` — mock repository, test in-use guard, key uniqueness, not-found
- **Integration test (optional):** `SystemParameterController` với `@WebMvcTest` + MockMvc
- **Coverage:** Business logic (in-use guard, validation) phải được cover

---

## 11. Boundaries

**Always:**
- Wrap mọi response trong `ApiResponse<T>`
- `@Valid` trên `@RequestBody` trong controller
- Dùng `AppException(ErrorCode.X)` — không throw raw exceptions
- Migration file: `V{n}__{snake_case_description}.sql`
- Chạy `./mvnw clean package -DskipTests` sau khi implement để verify build pass

**Ask first:**
- Thêm `role` field vào `User` entity (ảnh hưởng auth flow)
- Thay đổi tên/cấu trúc bảng mapping nếu có bảng thực tế
- Thêm `created_by`/`updated_by` audit fields

**Never:**
- Sửa migration V1–V6 đã được apply
- Bỏ `@Transactional` trên write operations
- Trả Entity trực tiếp từ controller

---

## 12. Success Criteria

- [ ] `GET /api/v1/system-parameters?keyword=MAX` trả paginated list, lọc key OR description
- [ ] `POST /api/v1/system-parameters` với `key` trùng → 409 `SYSTEM_PARAMETER_KEY_EXISTS`
- [ ] `POST /api/v1/system-parameters` với `key` chứa chữ thường → 400 Bad Request
- [ ] `PUT /api/v1/system-parameters/{id}` khi in-use → 409 `SYSTEM_PARAMETER_IN_USE`
- [ ] `DELETE /api/v1/system-parameters/{id}` khi in-use → 409 `SYSTEM_PARAMETER_IN_USE`
- [ ] `GET /api/v1/system-parameters/999` với id không tồn tại → 404 `SYSTEM_PARAMETER_NOT_FOUND`
- [ ] Tất cả endpoints không có JWT → 401
- [ ] Flyway V7 + V8 chạy thành công khi startup

---

## 13. Open Questions

| # | Câu hỏi | Ảnh hưởng |
|---|---------|-----------|
| Q1 | Tên thực tế của bảng mapping câu lệnh ↔ tham số là gì? | Query in-use check trong repository |
| Q2 | Có cần role-based access (chỉ Admin) hay chỉ cần JWT authenticated? | Cần thêm `role` vào `User` entity nếu cần |
| Q3 | Có cần audit fields `created_by`/`updated_by` không? | Cần wire SecurityContext |