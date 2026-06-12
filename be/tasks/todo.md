# Todo: System Parameters Feature

## Phase 1: Foundation

- [x] **Task 1** — Flyway migrations V7 (system_parameters) + V8 (command_parameter_mappings stub)
- [x] **Task 2** — SystemParameter entity + ErrorCode additions (NOT_FOUND, KEY_EXISTS, IN_USE)

### Checkpoint 1
- [x] Build pass + App starts + Flyway V7/V8 Applied

## Phase 2: Repository + DTOs

- [x] **Task 3** — SystemParameterRepository (search JPQL + in-use query) + SystemParameterRequest + SystemParameterResponse + SystemParameterInUseResponse + PageResponse DTOs

## Phase 3: Service + Controller

- [x] **Task 4** — SystemParameterService interface + SystemParameterServiceImpl (full business logic)
- [x] **Task 5** — SystemParameterController (6 endpoints + Swagger annotations) + tests (54 pass)

### Checkpoint 2
- [x] Build pass + CRUD endpoints working + validation errors correct

## Phase 4: Documentation

- [x] **Task 6** — output/API.md (API documentation)
- [x] **Task 7** — output/DB-DESIGN.md (database design documentation)

### Checkpoint 3
- [x] All success criteria in SPEC-system-parameters.md met
