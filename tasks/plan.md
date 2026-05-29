# Implementation Plan: AI Hackathon — Spring Boot REST API Base

## Overview

Bootstrap a production-ready Spring Boot 4.0.6 base project on top of the existing Maven skeleton. The project delivers JWT auth, MariaDB via JPA + Flyway, structured error handling, and Swagger UI — so any team member can add business features without touching cross-cutting infrastructure.

Work is sliced **vertically**: each phase ends with a running, testable system state, not a half-assembled layer.

---

## Architecture Decisions

- **3-layer architecture** (Controller → Service interface → Repository) keeps business logic testable in isolation without a running server.
- **JJWT 0.12.x** over Spring Security OAuth2 resource server — lighter, no extra config for a hackathon context.
- **Flyway over Hibernate ddl-auto** — prevents accidental schema drops in any non-local environment.
- **`ApiResponse<T>` wrapper on every endpoint** — consistent shape for frontend clients and easier to mock in tests.
- **`application-local.yaml` (gitignored)** holds real credentials; `application.yaml` holds only safe defaults and placeholders.

---

## Dependency Graph

```
pom.xml (deps)
    │
    ├── application.yaml (datasource / JWT / Flyway config)
    │       │
    │       └── V1__init_users.sql (Flyway migration)
    │               │
    │               └── User entity + UserRepository (JPA)
    │
    ├── ApiResponse<T> (DTO wrapper)
    │       │
    │       ├── ErrorCode + AppException + GlobalExceptionHandler
    │       │
    │       └── HealthController  ← first live endpoint
    │
    └── User entity + UserRepository
            │
            ├── UserDetailsServiceImpl
            │       │
            │       └── JwtTokenProvider + JwtAuthFilter
            │               │
            │               └── SecurityConfig + OpenApiConfig
            │                       │
            │                       └── AuthService + AuthController
            │
            └── Tests (AuthServiceTest, AuthControllerTest)
```

---

## Task List

### Phase 1: Infrastructure Foundation

#### Task 1 — Wire Maven dependencies and build tooling
**Description:** Replace the bare-bones pom.xml with all required dependencies. This is the gate that unlocks every subsequent task — nothing compiles without it.

**Acceptance criteria:**
- [ ] `./mvnw clean package -DskipTests` succeeds (no compile errors)
- [ ] All dependency scopes correct (mariadb `runtime`, lombok `provided`, test deps `test`)
- [ ] JaCoCo plugin configured to enforce ≥70% line coverage on `service/` and `controller/`

**Verification:**
- [ ] `./mvnw dependency:tree` shows all required artifacts resolved
- [ ] `./mvnw clean compile` exits 0

**Dependencies:** None

**Files:**
- `pom.xml`

**Scope:** S

---

#### Task 2 — Configure datasource, JWT, and Flyway in application.yaml
**Description:** Set `application.yaml` with MariaDB datasource placeholders, JPA settings (`ddl-auto: validate`), Flyway enabled, JWT config keys, and server port. Create `application-local.yaml` with real local credentials (gitignored). Update `.gitignore`.

**Acceptance criteria:**
- [ ] `application.yaml` has `spring.datasource`, `spring.jpa`, `spring.flyway`, `app.jwt.*` sections
- [ ] `spring.jpa.hibernate.ddl-auto: validate` (never create/drop outside local)
- [ ] `application-local.yaml` listed in `.gitignore`
- [ ] No real passwords or secrets in `application.yaml`

**Verification:**
- [ ] `./mvnw spring-boot:run` fails with a clear "Flyway migration error" (not NullPointer) — meaning config is wired but DB isn't up yet

**Dependencies:** Task 1

**Files:**
- `src/main/resources/application.yaml`
- `src/main/resources/application-local.yaml` (local only)
- `.gitignore`

**Scope:** S

---

#### Task 3 — Create Flyway migration and User entity
**Description:** Write `V1__init_users.sql` creating the `users` table. Create `entity/User.java` (JPA entity + Lombok + implements `UserDetails`) and `repository/UserRepository.java`.

**Acceptance criteria:**
- [ ] `users` table has: `id` (BIGINT AUTO_INCREMENT PK), `email` (VARCHAR 255, UNIQUE NOT NULL), `password` (VARCHAR 255 NOT NULL), `created_at`, `updated_at`
- [ ] `User` entity maps to `users` table with all columns
- [ ] `UserRepository` has `findByEmail(String email): Optional<User>`
- [ ] `./mvnw spring-boot:run` starts cleanly when MariaDB is running (Flyway migrates on startup)

**Verification:**
- [ ] Connect to MariaDB and confirm `users` table exists with correct columns
- [ ] `./mvnw spring-boot:run` exits with "Started AppApplication" log line

**Dependencies:** Task 2

**Files:**
- `src/main/resources/db/migration/V1__init_users.sql`
- `src/main/java/com/ai_hackathon/app/entity/User.java`
- `src/main/java/com/ai_hackathon/app/repository/UserRepository.java`

**Scope:** M

---

### Checkpoint: Phase 1 Complete
- [ ] `./mvnw clean compile` exits 0
- [ ] App starts and connects to MariaDB
- [ ] `users` table exists in DB

---

### Phase 2: First Live Endpoint

#### Task 4 — ApiResponse wrapper, exception infrastructure, HealthController
**Description:** Create the `ApiResponse<T>` generic response wrapper, `ErrorCode` enum, `AppException`, `GlobalExceptionHandler`, `HealthController`, and `util/Constants.java`. After this task the first real endpoint is reachable.

**Acceptance criteria:**
- [ ] `GET /api/v1/health` returns `200 {"status":200,"message":"OK","data":"healthy"}`
- [ ] Submitting malformed JSON to any endpoint returns `{"status":400,"message":"...","data":null}` (not Spring whitepage)
- [ ] `AppException(ErrorCode.X)` caught globally and serialized to correct HTTP status + message
- [ ] `ErrorCode` includes at minimum: `USER_NOT_FOUND (404)`, `EMAIL_ALREADY_EXISTS (409)`, `INVALID_CREDENTIALS (401)`, `UNAUTHORIZED (401)`, `INTERNAL_SERVER_ERROR (500)`

**Verification:**
- [ ] `curl http://localhost:8080/api/v1/health` → `{"status":200,"message":"OK","data":"healthy"}`
- [ ] `curl -X POST http://localhost:8080/api/v1/health -d 'bad'` → structured 4xx (not HTML)

**Dependencies:** Task 1

**Files:**
- `src/main/java/com/ai_hackathon/app/dto/response/ApiResponse.java`
- `src/main/java/com/ai_hackathon/app/exception/ErrorCode.java`
- `src/main/java/com/ai_hackathon/app/exception/AppException.java`
- `src/main/java/com/ai_hackathon/app/exception/GlobalExceptionHandler.java`
- `src/main/java/com/ai_hackathon/app/controller/HealthController.java`
- `src/main/java/com/ai_hackathon/app/util/Constants.java`

**Scope:** M

---

### Checkpoint: Phase 2 Complete
- [ ] `GET /api/v1/health` returns correct JSON
- [ ] Invalid request body returns structured error (not whitepage)

---

### Phase 3: JWT Auth

#### Task 5 — JWT security layer (provider, filter, UserDetails)
**Description:** Implement `JwtTokenProvider` (generate + validate tokens using JJWT 0.12.x), `JwtAuthFilter` (reads `Authorization: Bearer` header, validates token, sets `SecurityContext`), and `UserDetailsServiceImpl` (loads `User` by email from `UserRepository`).

**Acceptance criteria:**
- [ ] `JwtTokenProvider.generateToken(UserDetails)` returns a signed JWT with subject = email and `exp` claim
- [ ] `JwtTokenProvider.validateToken(token)` returns false for expired, tampered, or missing tokens
- [ ] `JwtAuthFilter` populates `SecurityContextHolder` when a valid token is present
- [ ] `UserDetailsServiceImpl` throws `UsernameNotFoundException` when email not found

**Verification:**
- [ ] Unit test: `JwtTokenProvider` generates and validates a round-trip token
- [ ] Unit test: tampered token returns `false` from `validateToken`

**Dependencies:** Task 3

**Files:**
- `src/main/java/com/ai_hackathon/app/security/JwtTokenProvider.java`
- `src/main/java/com/ai_hackathon/app/security/JwtAuthFilter.java`
- `src/main/java/com/ai_hackathon/app/security/UserDetailsServiceImpl.java`

**Scope:** M

---

#### Task 6 — SecurityConfig, OpenApiConfig, Auth DTOs
**Description:** Configure `SecurityFilterChain` (public routes: `/api/v1/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`; everything else requires auth), register `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`, expose `BCryptPasswordEncoder` and `AuthenticationManager` beans. Set up `OpenApiConfig` with JWT bearer security scheme. Create all auth DTOs.

**Acceptance criteria:**
- [ ] `GET /api/v1/health` — public, no token needed → 200
- [ ] Any other endpoint without token → 401 (structured `ApiResponse`, not Spring default)
- [ ] Swagger UI reachable at `http://localhost:8080/swagger-ui.html` with "Authorize" button
- [ ] `LoginRequest` validates: `email` not blank + valid format, `password` not blank
- [ ] `RegisterRequest` validates: `email` + `password` (min 8 chars) + `name` not blank

**Verification:**
- [ ] `curl http://localhost:8080/api/v1/health` → 200
- [ ] `curl http://localhost:8080/api/v1/protected-test` → `{"status":401,...}`
- [ ] Browser: `http://localhost:8080/swagger-ui.html` loads

**Dependencies:** Task 4, Task 5

**Files:**
- `src/main/java/com/ai_hackathon/app/config/SecurityConfig.java`
- `src/main/java/com/ai_hackathon/app/config/OpenApiConfig.java`
- `src/main/java/com/ai_hackathon/app/dto/request/LoginRequest.java`
- `src/main/java/com/ai_hackathon/app/dto/request/RegisterRequest.java`
- `src/main/java/com/ai_hackathon/app/dto/response/AuthResponse.java`

**Scope:** M

---

#### Task 7 — AuthService and AuthController
**Description:** Implement `AuthService` interface and `AuthServiceImpl`: `register` (validate unique email, hash password, save user, return JWT), `login` (load user, verify password, return JWT). Implement `AuthController` with `POST /api/v1/auth/register` and `POST /api/v1/auth/login`.

**Acceptance criteria:**
- [ ] `POST /api/v1/auth/register` with valid body → `201 {"data":{"accessToken":"...","tokenType":"Bearer"}}`
- [ ] `POST /api/v1/auth/register` with duplicate email → `409 {"status":409,"message":"Email already exists",...}`
- [ ] `POST /api/v1/auth/login` with valid credentials → `200` with JWT
- [ ] `POST /api/v1/auth/login` with wrong password → `401`
- [ ] `POST /api/v1/auth/register` with invalid body (missing email) → `400` with field errors
- [ ] Password stored as BCrypt hash (not plaintext) in `users` table

**Verification:**
- [ ] `curl -X POST /api/v1/auth/register -d '{"email":"a@b.com","password":"secret123","name":"Test"}' -H 'Content-Type: application/json'` → 201 with token
- [ ] `curl -X POST /api/v1/auth/login` with same credentials → 200 with token
- [ ] DB query `SELECT password FROM users` → starts with `$2a$` (BCrypt)

**Dependencies:** Task 6

**Files:**
- `src/main/java/com/ai_hackathon/app/service/AuthService.java`
- `src/main/java/com/ai_hackathon/app/service/impl/AuthServiceImpl.java`
- `src/main/java/com/ai_hackathon/app/controller/AuthController.java`

**Scope:** M

---

### Checkpoint: Phase 3 Complete
- [ ] Full auth flow works end-to-end (register → login → use token)
- [ ] 401 returned for missing/invalid tokens
- [ ] Swagger UI shows auth endpoints with "Try it out"

---

### Phase 4: Tests

#### Task 8 — Unit tests (AuthService) and integration tests (AuthController)
**Description:** Write `AuthServiceTest` using Mockito to cover: register success, register duplicate email (expects AppException), login success, login wrong password (expects AppException). Write `AuthControllerTest` using `@WebMvcTest` + MockMvc to cover: valid register returns 201, invalid body returns 400 with field errors, valid login returns 200.

**Acceptance criteria:**
- [ ] `./mvnw test` passes (all green)
- [ ] JaCoCo line coverage ≥ 70% on `service/` + `controller/` packages
- [ ] No test hits a real database (service tests use Mockito; controller tests mock the service layer)

**Verification:**
- [ ] `./mvnw test jacoco:report` exits 0
- [ ] Open `target/site/jacoco/index.html` — `service` and `controller` rows show ≥ 70%

**Dependencies:** Task 7

**Files:**
- `src/test/java/com/ai_hackathon/app/service/AuthServiceTest.java`
- `src/test/java/com/ai_hackathon/app/controller/AuthControllerTest.java`

**Scope:** M

---

### Checkpoint: Phase 4 Complete — Project Ready
- [ ] `./mvnw test` passes
- [ ] Coverage ≥ 70%
- [ ] All 9 success criteria from SPEC.md satisfied

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Spring Boot 4.0.6 + SpringDoc OpenAPI 2.x incompatibility | Med | Pin springdoc to latest 2.x compatible with Boot 4; check release notes |
| JJWT 0.12.x API changed from older versions | Med | Use `Jwts.parser().verifyWith(key)` not deprecated `setSigningKey()` |
| MariaDB not running locally during development | Low | Use `application-local.yaml` to point at dev DB; document setup steps |
| JaCoCo version not compatible with Java 21 | Low | Ensure JaCoCo ≥ 0.8.11 in pom.xml |

## Open Questions (deferred)

- Refresh token support (`/auth/refresh` + `refresh_tokens` table)
- Role-based access control (RBAC)
