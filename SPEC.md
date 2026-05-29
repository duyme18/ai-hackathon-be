# Spec: AI Hackathon — Spring Boot REST API Base Project

## Objective

Build a production-ready Spring Boot base project that any hackathon team member can clone and immediately start adding business features on top of. The base provides all cross-cutting concerns (auth, error handling, DB migration, API docs) so contributors never have to set them up from scratch.

**Success looks like:** A running Spring Boot server that authenticates via JWT, connects to MariaDB, serves a `/api/v1/health` endpoint, and has Swagger UI accessible at `/swagger-ui.html`.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Language | Java | 21 |
| Framework | Spring Boot | 4.0.6 |
| Build | Maven | (wrapper) |
| Database | MariaDB | 10.11+ |
| ORM | Spring Data JPA / Hibernate | (Boot-managed) |
| Auth | Spring Security + JWT (JJWT) | 0.12.x |
| API Docs | SpringDoc OpenAPI (Swagger UI) | 2.x |
| DB Migrations | Flyway | (Boot-managed) |
| Boilerplate | Lombok | (Boot-managed) |
| Validation | spring-boot-starter-validation (Jakarta) | (Boot-managed) |

---

## Commands

```bash
# Run dev server (port 8080)
./mvnw spring-boot:run

# Build JAR
./mvnw clean package -DskipTests

# Run tests
./mvnw test

# Run tests with coverage
./mvnw test jacoco:report

# Flyway: check migration status
./mvnw flyway:info

# Flyway: run pending migrations
./mvnw flyway:migrate
```

---

## Project Structure

```
src/
├── main/
│   ├── java/com/ai_hackathon/app/
│   │   ├── AppApplication.java          # Entry point
│   │   ├── config/
│   │   │   ├── SecurityConfig.java      # Spring Security + JWT filter chain
│   │   │   └── OpenApiConfig.java       # Swagger/OpenAPI bean config
│   │   ├── controller/
│   │   │   ├── AuthController.java      # POST /api/v1/auth/login, /register
│   │   │   └── HealthController.java    # GET /api/v1/health
│   │   ├── service/
│   │   │   ├── AuthService.java         # Interface
│   │   │   └── impl/
│   │   │       └── AuthServiceImpl.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   ├── entity/
│   │   │   └── User.java                # JPA entity
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   └── RegisterRequest.java
│   │   │   └── response/
│   │   │       ├── ApiResponse.java     # Generic wrapper: { status, message, data }
│   │   │       └── AuthResponse.java    # { accessToken, tokenType }
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java  # @ControllerAdvice
│   │   │   ├── AppException.java            # Custom base exception
│   │   │   └── ErrorCode.java               # Enum: UNAUTHORIZED, NOT_FOUND, etc.
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java    # Generate / validate JWT
│   │   │   ├── JwtAuthFilter.java       # OncePerRequestFilter
│   │   │   └── UserDetailsServiceImpl.java
│   │   └── util/
│   │       └── Constants.java           # App-wide constants
│   └── resources/
│       ├── application.yaml             # Main config
│       ├── application-local.yaml       # Local overrides (gitignored)
│       └── db/migration/
│           └── V1__init_users.sql       # Flyway: create users table
└── test/
    └── java/com/ai_hackathon/app/
        ├── AppApplicationTests.java
        ├── controller/
        │   └── AuthControllerTest.java
        └── service/
            └── AuthServiceTest.java
```

---

## Code Style

### Response Wrapper — every API response uses `ApiResponse<T>`

```java
// dto/response/ApiResponse.java
@Builder
@Getter
public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .status(200).message("Success").data(data).build();
    }

    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
            .status(201).message("Created").data(data).build();
    }
}
```

### Controller convention

```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }
}
```

### Exception convention

```java
// Throw this anywhere in service layer:
throw new AppException(ErrorCode.USER_NOT_FOUND);

// GlobalExceptionHandler catches it and returns:
// { "status": 404, "message": "User not found", "data": null }
```

### Naming conventions

- Entities: `PascalCase`, singular (`User`, not `Users`)
- Tables: `snake_case`, plural (`users`, `refresh_tokens`)
- DTOs: suffix with `Request` / `Response`
- Services: interface + `impl/` package with `Impl` suffix
- REST paths: `/api/v1/<resource>` (lowercase, hyphenated)

---

## Testing Strategy

- **Framework:** JUnit 5 + Mockito + Spring Boot Test
- **Unit tests:** Service layer — mock repositories, test business logic
- **Integration tests:** Controller layer — `@WebMvcTest` + MockMvc
- **Coverage target:** 70% line coverage on `service/` and `controller/` packages
- **Location:** Mirror `src/main` structure under `src/test`

```bash
# Generate HTML coverage report → target/site/jacoco/index.html
./mvnw test jacoco:report
```

---

## Boundaries

**Always do:**
- Wrap all responses in `ApiResponse<T>`
- Validate all incoming DTOs with `@Valid` + Jakarta constraints
- Run `./mvnw test` before committing
- Use Flyway SQL migrations for any DB schema change (never let Hibernate auto-ddl in prod)
- Store secrets in `application-local.yaml` (gitignored), never in `application.yaml`

**Ask first:**
- Adding new Maven dependencies
- Changing the DB schema (new table / column / index)
- Changing the JWT expiry or secret key strategy
- Modifying `SecurityConfig` public/private route rules
- Renaming the base package

**Never do:**
- Commit `application-local.yaml` or any file with real credentials
- Use `spring.jpa.hibernate.ddl-auto=create` or `drop` in non-local profiles
- Return raw exceptions or stack traces to the client
- Hardcode secrets in source code

---

## Success Criteria

- [ ] `./mvnw spring-boot:run` starts without errors, server on port 8080
- [ ] `GET /api/v1/health` returns `200 { status: 200, message: "OK", data: "healthy" }`
- [ ] `POST /api/v1/auth/register` creates a user in MariaDB with hashed password
- [ ] `POST /api/v1/auth/login` returns a valid JWT
- [ ] Protected endpoint returns `401` without token, `200` with valid token
- [ ] Swagger UI accessible at `http://localhost:8080/swagger-ui.html`
- [ ] Flyway migration runs on startup and creates the `users` table
- [ ] Invalid request body returns structured `400` error (not Spring default whitepage)
- [ ] `./mvnw test` passes with ≥ 70% coverage on service/controller

---

## Open Questions

- [ ] Do we need refresh token support (separate `/auth/refresh` endpoint + `refresh_tokens` table)?
- [ ] Role-based access control (RBAC) needed at base level, or add later?
- [ ] Should `application-local.yaml` be committed with placeholder values, or only documented in README?