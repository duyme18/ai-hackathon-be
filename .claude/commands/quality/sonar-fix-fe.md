# /sonar-fix-fe — Fix SonarQube Issues cho React FE

Fetch issues từ SonarQube chỉ trong FE source, phân tích và fix theo TypeScript/React conventions.

**Severity filter (optional):** $ARGUMENTS
(để trống → tất cả, "critical" → chỉ BLOCKER+CRITICAL, "security" → chỉ VULNERABILITY)

## Cấu hình
- SonarQube: https://scan.gem-corp.tech
- Project: Tendoo-Web-ReactJS
- Scope: `fe/src/`
- Token: env var `SONAR_TOKEN`

## Bước 1 — Fetch FE issues

```bash
curl -s -H "Authorization: Bearer $SONAR_TOKEN" \
  "https://scan.gem-corp.tech/api/issues/search?componentKeys=Tendoo-Web-ReactJS&resolved=false&ps=100&languages=ts,js,tsx,jsx&s=SEVERITY&asc=false"
```

Lọc chỉ lấy issues có `component` chứa `fe/src/`.

Ưu tiên fix theo thứ tự:
1. BLOCKER
2. CRITICAL + VULNERABILITY
3. BUG
4. MAJOR (nếu còn thời gian)
5. Bỏ qua MINOR / INFO

## Bước 2 — Đọc fe/CLAUDE.md trước khi fix

Luôn đọc `fe/CLAUDE.md` để nắm conventions:
- Không dùng `any` TypeScript
- Semantic color tokens (không hardcode hex)
- Component props phải có explicit interface
- shadcn/ui primitives — reuse trước khi tạo mới

## Bước 3 — Fix theo TypeScript/React rules

**Common FE SonarQube rules:**

| Rule | Vấn đề | Fix |
|---|---|---|
| `typescript:S1854` | Dead store — assign nhưng không dùng | Xóa assignment |
| `typescript:S1481` | Unused variable | Xóa hoặc dùng (prefix `_` nếu intentional) |
| `typescript:S6544` | Promise không được await hoặc return | Thêm `await` hoặc `return` |
| `typescript:S3776` | Cognitive complexity cao | Extract component/hook nhỏ hơn |
| `typescript:S1192` | String literal lặp | Extract thành constant |
| `typescript:S4043` | Array mutation bằng `.reverse()`/`.sort()` | Dùng `[...arr].sort()` (immutable) |
| `typescript:S6479` | Array index dùng làm React key | Dùng unique id thay vì index |
| `typescript:S2201` | Return value của function bị bỏ qua | Handle hoặc assign |
| `typescript:S1128` | Unused import | Xóa import |
| `typescript:S3358` | Ternary lồng nhau | Extract thành variable hoặc if/else |
| `typescript:S2699` | Test không có assertion | Thêm expect() |
| `web:S5122` | CORS misconfiguration | Review headers |
| `react:S6749` | Dùng `this` trong functional component | Xóa `this` |
| `react:S6853` | Thiếu key prop trong list | Thêm `key={item.id}` |

**shadcn/ui + TanStack specific:**
| Vấn đề | Fix |
|---|---|
| `any` type trong props | Thêm explicit TypeScript interface |
| Unused TanStack Query result | Dùng hoặc xóa destructure |
| Missing error boundary | Wrap với error handling |
| `useEffect` dependency array sai | Fix deps theo ESLint exhaustive-deps |

## Bước 4 — Verify sau khi fix

```bash
cd fe && npm run build && npm run lint
```

Cả hai PHẢI pass:
- `npm run build` → 0 TypeScript errors
- `npm run lint` → 0 ESLint errors

Nếu fail sau khi fix → revert fix đó và ghi "MANUAL REVIEW NEEDED".

## Bước 5 — Report

```
## SonarQube FE Fix Report
Issues fetched: X (ts/tsx/js/jsx only, fe/src/)
- BLOCKER: X → Fixed: X
- CRITICAL: X → Fixed: X
- MAJOR: X → Fixed: X / Skipped: X

Build: ✅ PASS
Lint:  ✅ PASS / ❌ FAIL

Fixed files:
- fe/src/pages/...
- fe/src/components/...

Manual review needed:
- [file:line] — lý do không tự fix được
```

## Không được làm
- KHÔNG fix issues trong `fe/node_modules/`, `fe/dist/`
- KHÔNG thay đổi semantic color tokens thành hardcoded hex
- KHÔNG dùng `// @ts-ignore` để bypass TypeScript errors
- KHÔNG dùng `eslint-disable` để ẩn lint errors — fix thật sự
- KHÔNG xóa test cases để pass coverage
