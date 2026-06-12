# BE CLAUDE.md — Spring Boot Backend

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 4.0.6 |
| Build | Maven (wrapper `./mvnw`) |
| Database | MariaDB 10.11+ |
| ORM | Spring Data JPA / Hibernate |
| Auth | Spring Security + JWT (JJWT 0.12.x) |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Migrations | Flyway |
| Boilerplate | Lombok |
| Validation | Jakarta Validation |

---

## Commands

```bash
# Build (skip tests)
cd be && ./mvnw clean package -DskipTests

# Run dev server (profile=local)
cd be && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Run tests
cd be && ./mvnw test

# Check migration status
cd be && ./mvnw flyway:info
```

---

## Project Structure

```
src/main/java/com/ai_hackathon/app/
├── config/          # SecurityConfig, OpenApiConfig
├── controller/      # REST controllers
├── dto/
│   ├── request/     # *Request DTOs
│   └── response/    # *Response DTOs + ApiResponse<T> + PageResponse<T>
├── entity/          # JPA entities
├── exception/       # AppException, ErrorCode, GlobalExceptionHandler
├── repository/      # Spring Data JPA repositories
├── security/        # JwtTokenProvider, JwtAuthFilter, UserDetailsServiceImpl
└── service/
    ├── *Service.java         # interfaces
    └── impl/*ServiceImpl.java
```

```
src/main/resources/
├── application.yaml              # Main config
├── application-local.yaml        # Local overrides (gitignored)
└── db/migration/
    ├── V1__init_users.sql
    ├── V2__create_projects.sql
    ├── V3__create_tasks.sql
    ├── V4__create_tags.sql
    ├── V5__create_spec_files.sql
    ├── V6__create_chat_messages.sql
    ├── V7__create_system_parameters.sql
    └── V8__create_command_parameter_mappings.sql
```

---

## Code Conventions

### Lombok — chỉ dùng các annotation sau, KHÔNG dùng `@Data`

```java
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyDto { ... }
```

### ApiResponse wrapper — LUÔN wrap response

```java
// Success
return ResponseEntity.ok(ApiResponse.success(data));
// Created
return ResponseEntity.status(201).body(ApiResponse.created(data));
```

### Exception pattern

```java
// Throw trong service:
throw new AppException(ErrorCode.NOT_FOUND);

// GlobalExceptionHandler tự xử lý → trả về { status, message, data: null }
```

### Service pattern

```java
@Service
@Transactional(readOnly = true)   // class-level default
@RequiredArgsConstructor
public class MyServiceImpl implements MyService {

    @Transactional  // override cho write methods
    public MyResponse create(MyRequest request) { ... }

    private MyEntity findOrThrow(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
    }
}
```

### Controller pattern

```java
@RestController
@RequestMapping("/api/v1/my-resource")
@RequiredArgsConstructor
@Tag(name = "MyResource", description = "...")
public class MyController {

    private final MyService myService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MyResponse>>> list(...) { ... }

    @PostMapping
    public ResponseEntity<ApiResponse<MyResponse>> create(@Valid @RequestBody MyRequest req) { ... }
}
```

### Repository với JPQL search

```java
@Query("SELECT e FROM MyEntity e WHERE " +
       "(:keyword IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
Page<MyEntity> search(@Param("keyword") String keyword, Pageable pageable);
```

---

## Database Rules

- Tên bảng: `snake_case`, số nhiều (e.g., `system_parameters`)
- Tên cột: `snake_case`
- Migration: `V{n}__{snake_case_description}.sql`
- **KHÔNG bao giờ sửa migration đã applied** — tạo migration mới nếu cần thay đổi
- Migration tiếp theo: `V9__...`

---

## API Conventions

- Base path: `/api/v1/`
- CRUD chuẩn:
  - `GET /api/v1/{resource}?keyword=&page=0&size=10&sort=field,asc` — danh sách
  - `GET /api/v1/{resource}/{id}` — chi tiết
  - `POST /api/v1/{resource}` — tạo mới → 201
  - `PUT /api/v1/{resource}/{id}` — cập nhật → 200
  - `DELETE /api/v1/{resource}/{id}` → 200
- Swagger: `http://localhost:8080/swagger-ui.html`

---

## ErrorCode Enum (hiện có)

| Code | HTTP | Message |
|------|------|---------|
| UNAUTHORIZED | 401 | Unauthorized |
| USER_NOT_FOUND | 404 | User not found |
| NOT_FOUND | 404 | Resource not found |
| KEY_EXISTS | 409 | Key already exists |
| IN_USE | 409 | Resource is in use |

Thêm ErrorCode mới trong `exception/ErrorCode.java`.

---

## Security Rules

- Mọi endpoint đều yêu cầu JWT (Bearer token)
- Public endpoints: `/api/v1/auth/**`, `/api/v1/health`, `/swagger-ui/**`, `/v3/api-docs/**`
- Khi thêm endpoint mới: KHÔNG sửa SecurityConfig trừ khi cần public route

---

## Never Do

- Commit `application-local.yaml` hoặc file có credentials
- Dùng `spring.jpa.hibernate.ddl-auto=create/drop` trong non-local profiles
- Return raw Entity từ Controller
- Return null từ Service — dùng `findOrThrow()` hoặc `Optional.orElseThrow()`
- Sửa Flyway migration đã applied

---

## Before Finishing Task

```bash
cd be && ./mvnw clean package -DskipTests
```

Build pass → đánh dấu `[x]` trong `be/tasks/todo.md`.
