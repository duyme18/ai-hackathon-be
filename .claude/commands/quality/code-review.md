---
description: "Review code trên branch hiện tại — correctness, security, performance. Dùng: /quality/code-review [file hoặc để trống = toàn branch]"
allowed-tools: Bash, Read, Grep
---

# /quality/code-review — Code Review

**Target (optional):** $ARGUMENTS
(để trống → review toàn bộ diff so với main/master, hoặc truyền path file cụ thể)

## Bước 1 — Lấy diff

```bash
git diff origin/master...HEAD -- $ARGUMENTS
```

Nếu `$ARGUMENTS` trống:
```bash
git diff origin/master...HEAD
git log origin/master...HEAD --oneline
```

## Bước 2 — Đọc context dự án

- Đọc `CLAUDE.md` để nắm conventions, entity list, ErrorCode
- Nếu diff chứa FE code → đọc `fe/CLAUDE.md`
- Nếu diff chứa BE code → đọc `be/CLAUDE.md`

## Bước 3 — Review theo thứ tự ưu tiên

Dùng labels rõ ràng:
- `[MUST]` — bug / security / data loss — phải fix trước khi merge
- `[SHOULD]` — best practice bị vi phạm — nên fix
- `[CONSIDER]` — gợi ý cải thiện — không bắt buộc
- `[PRAISE]` — code tốt, ghi nhận

### Checklist FE (React/TypeScript)
- [ ] Không dùng `any` — có explicit type?
- [ ] Component props có interface rõ ràng?
- [ ] TanStack Query: invalidate sau mutation chưa?
- [ ] Loading / Error / Empty state đủ chưa?
- [ ] `key` prop trong list dùng id, không dùng index?
- [ ] Không hardcode màu — dùng semantic tokens?
- [ ] Toast hiển thị đúng success/error?
- [ ] Console.log thừa không?

### Checklist BE (Spring Boot/Java)
- [ ] DTO tách biệt với Entity không?
- [ ] `findOrThrow(id)` thay vì return null?
- [ ] `@Transactional` đúng chỗ (readOnly class-level)?
- [ ] ErrorCode dùng đúng HTTP status?
- [ ] Không dùng `@Data` — chỉ `@Getter @Setter @Builder`?
- [ ] Input validation ở đúng layer (Controller/DTO)?
- [ ] Migration file tên đúng `Vn__snake_case.sql`?

### Checklist chung
- [ ] Logic có đúng requirement không?
- [ ] Edge cases được handle?
- [ ] Không expose sensitive data (token, password, PII)?
- [ ] Không có dead code / unused import?

## Bước 4 — Output

```
## Code Review Report
Branch: [branch-name]
Files changed: X | Lines: +X -X

---

### [MUST] — X issues
1. `file:line` — mô tả vấn đề
   Fix: ...

### [SHOULD] — X issues
...

### [PRAISE]
...

---
Verdict: APPROVE / APPROVE WITH MINOR CHANGES / REQUEST CHANGES
Merge khi: [điều kiện cụ thể]
```
