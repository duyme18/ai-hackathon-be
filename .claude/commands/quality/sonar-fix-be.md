# /sonar-fix-be — Fix SonarQube Issues cho Spring Boot BE

Fetch issues từ SonarQube chỉ trong BE source, phân tích và fix theo Java/Spring Boot conventions.

**Severity filter (optional):** $ARGUMENTS
(để trống → tất cả, "critical" → chỉ BLOCKER+CRITICAL, "security" → chỉ VULNERABILITY)

## Cấu hình
- SonarQube: https://scan.gem-corp.tech
- Project: Tendoo-Web-ReactJS
- Scope: `be/src/main/java/` và `be/src/test/`
- Token: env var `SONAR_TOKEN`

## Bước 1 — Fetch BE issues

```bash
curl -s -H "Authorization: Bearer $SONAR_TOKEN" \
  "https://scan.gem-corp.tech/api/issues/search?componentKeys=Tendoo-Web-ReactJS&resolved=false&ps=100&languages=java&s=SEVERITY&asc=false"
```

Lọc chỉ lấy issues có `component` chứa `be/src/`.

Ưu tiên fix theo thứ tự:
1. BLOCKER
2. CRITICAL + VULNERABILITY
3. BUG
4. MAJOR (nếu còn thời gian)
5. Bỏ qua MINOR / INFO

## Bước 2 — Đọc be/CLAUDE.md trước khi fix

Luôn đọc `be/CLAUDE.md` để nắm conventions:
- Không dùng `@Data`
- `findOrThrow(id)` thay vì return null
- `@Transactional(readOnly = true)` class-level
- Throw `AppException(ErrorCode.X)` đúng pattern

## Bước 3 — Fix theo Java/Spring Boot rules

**Common BE SonarQube rules:**

| Rule | Vấn đề | Fix |
|---|---|---|
| `java:S2093` | try không dùng try-with-resources | Đổi sang `try (Resource r = ...)` |
| `java:S1192` | String literal lặp ≥3 lần | Extract thành `static final String` |
| `java:S1481` | Local variable khai báo nhưng không dùng | Xóa variable |
| `java:S1854` | Dead store (assign nhưng không dùng) | Xóa assignment |
| `java:S3776` | Cognitive complexity quá cao | Extract method nhỏ hơn |
| `java:S2259` | Null pointer dereference | Thêm null check hoặc `Optional` |
| `java:S1068` | Private field không được dùng | Xóa field |
| `java:S112` | Throw generic Exception | Throw `AppException` cụ thể |
| `java:S2142` | InterruptedException không handle | Re-interrupt thread |
| `java:S1135` | TODO comment còn sót | Fix hoặc tạo task |
| `java:S4144` | Method trùng implementation | Extract shared method |
| `java:S6437` | Hardcoded credential | Chuyển sang config/env |
| `java:S5411` | Unboxing of Optional | Dùng `.orElse()` |

**Spring-specific:**
| Rule | Fix |
|---|---|
| `java:S3752` | `@RequestMapping` nên dùng `@GetMapping`/`@PostMapping` cụ thể |
| `java:S4684` | Persistent entity dùng làm request body | Đổi sang DTO |
| `java:S6857` | `@Autowired` không cần nếu có constructor injection | Xóa `@Autowired` |

## Bước 4 — Verify build sau khi fix

```powershell
cd be && .\mvnw.cmd clean package -DskipTests
```

Build PHẢI pass. Nếu fail → revert fix đó và ghi "MANUAL REVIEW NEEDED".

## Bước 5 — Report

```
## SonarQube BE Fix Report
Issues fetched: X (java only)
- BLOCKER: X → Fixed: X
- CRITICAL: X → Fixed: X
- MAJOR: X → Fixed: X / Skipped: X

Build: ✅ PASS / ❌ FAIL

Fixed files:
- be/src/main/java/com/ai_hackathon/app/...

Manual review needed:
- [file:line] — lý do không tự fix được
```

## Không được làm
- KHÔNG fix issues trong `be/target/`
- KHÔNG thay đổi Flyway migration đã applied
- KHÔNG sửa `ErrorCode` enum (chỉ thêm, không xóa/rename)
- KHÔNG đổi response format của Controller đang hoạt động
