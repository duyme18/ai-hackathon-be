# Todo: AI Hackathon Base Project

## Phase 1: Infrastructure Foundation

- [ ] **Task 1** — Add Maven dependencies (`pom.xml`: web, jpa, security, validation, mariadb, jjwt, springdoc, flyway, lombok, jacoco)
- [ ] **Task 2** — Configure `application.yaml` (datasource, JPA, Flyway, JWT) + create `application-local.yaml` + update `.gitignore`
- [ ] **Task 3** — Flyway `V1__init_users.sql` + `User` entity + `UserRepository`

**Checkpoint 1:** App starts and connects to MariaDB; `users` table exists

## Phase 2: First Live Endpoint

- [ ] **Task 4** — `ApiResponse<T>` + `ErrorCode` + `AppException` + `GlobalExceptionHandler` + `HealthController` + `Constants`

**Checkpoint 2:** `GET /api/v1/health` → 200 JSON; invalid body → structured 400

## Phase 3: JWT Auth

- [ ] **Task 5** — `JwtTokenProvider` + `JwtAuthFilter` + `UserDetailsServiceImpl`
- [ ] **Task 6** — `SecurityConfig` + `OpenApiConfig` + auth DTOs (`LoginRequest`, `RegisterRequest`, `AuthResponse`)
- [ ] **Task 7** — `AuthService` interface + `AuthServiceImpl` + `AuthController`

**Checkpoint 3:** Full register → login → token flow works; Swagger UI up

## Phase 4: Tests

- [ ] **Task 8** — `AuthServiceTest` (Mockito) + `AuthControllerTest` (@WebMvcTest)

**Checkpoint 4 (Done):** `./mvnw test` green; coverage ≥ 70%
