# /sonar-fix — Fetch SonarQube Issues và Auto-Fix

Kết nối SonarQube, lấy danh sách issues, phân tích và fix từng issue trong codebase.

**Filter (optional):** $ARGUMENTS
(ví dụ: "fe" → chỉ fix FE files, "be" → BE, "security" → chỉ security issues, để trống → tất cả)

## Cấu hình
- URL: https://scan.gem-corp.tech
- Project: Tendoo-Web-ReactJS
- Token: từ env var `SONAR_TOKEN`

## Bước 1 — Fetch issues từ SonarQube API

Chạy lệnh sau để lấy danh sách issues chưa resolved:

```bash
curl -s -H "Authorization: Bearer $SONAR_TOKEN" \
  "https://scan.gem-corp.tech/api/issues/search?componentKeys=Tendoo-Web-ReactJS&resolved=false&ps=50&s=SEVERITY&asc=false"
```

Parse JSON output để lấy:
- `issues[].key` — issue ID
- `issues[].rule` — loại rule vi phạm (e.g., typescript:S1234)
- `issues[].severity` — BLOCKER / CRITICAL / MAJOR / MINOR / INFO
- `issues[].component` — file path
- `issues[].line` — dòng số
- `issues[].message` — mô tả lỗi
- `issues[].type` — BUG / VULNERABILITY / CODE_SMELL

## Bước 2 — Lấy thêm chi tiết nếu cần

```bash
curl -s -H "Authorization: Bearer $SONAR_TOKEN" \
  "https://scan.gem-corp.tech/api/issues/show?issue=ISSUE_KEY"
```

## Bước 3 — Phân tích và nhóm issues

Nhóm theo:
1. **BLOCKER / CRITICAL** → fix ngay, ưu tiên cao nhất
2. **Security (VULNERABILITY)** → fix ngay
3. **BUG** → fix
4. **MAJOR CODE_SMELL** → fix nếu còn thời gian
5. **MINOR / INFO** → bỏ qua trong hackathon

Filter theo `$ARGUMENTS` nếu có:
- "fe" → chỉ lấy issues trong `fe/src/`
- "be" → chỉ lấy issues trong `be/src/`
- "security" → chỉ type=VULNERABILITY

## Bước 4 — Fix từng issue

Với mỗi issue (ưu tiên BLOCKER → CRITICAL → BUG):

1. Đọc file tại `component:line` từ issue
2. Hiểu rule vi phạm (từ `rule` field + `message`)
3. Fix code theo đúng rule — KHÔNG thay đổi logic business
4. Ghi lại: `[FIXED] rule | file:line | mô tả fix`

**Common SonarQube rules:**
- `typescript:S1854` — Unused assignment → xóa assignment thừa
- `typescript:S1481` — Unused variable → xóa hoặc dùng
- `typescript:S3776` — Cognitive complexity too high → extract function
- `typescript:S6544` — Promise handling → thêm await/catch
- `web:S5122` — CORS header → kiểm tra security config
- `java:S2093` — try-with-resources → refactor
- `java:S1192` — Duplicated string → extract constant

## Bước 5 — Verify sau khi fix

**FE (nếu có fix FE):**
```bash
cd fe && npm run build && npm run lint
```

**BE (nếu có fix BE):**
```powershell
cd be && .\mvnw.cmd clean package -DskipTests
```

## Bước 6 — Report tổng kết

```
## SonarQube Fix Report
Total issues found: X
- BLOCKER: X
- CRITICAL: X
- MAJOR: X

Fixed: X issues
Skipped: X issues (MINOR/INFO)

Files changed:
- fe/src/... (X fixes)
- be/src/... (X fixes)

Build: ✅ PASS / ❌ FAIL
```

## Lưu ý
- KHÔNG fix issues trong `node_modules/`, `dist/`, `target/`
- KHÔNG thay đổi logic business khi fix code smell
- Nếu issue phức tạp (refactor lớn) → ghi chú "MANUAL REVIEW NEEDED" thay vì tự fix sai
