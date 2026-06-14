---
description: "Smart git commit: phân tích changes, sinh commit message chuẩn Conventional Commits, stage và commit. Dùng: /workflow/git-commit [scope optional]"
allowed-tools: Bash, Read
---

# /workflow/git-commit — Smart Git Commit

**Scope gợi ý (optional):** $ARGUMENTS

## Bước 1 — Kiểm tra trạng thái repo

Chạy song song:

```bash
git status
git diff --stat
git diff --cached --stat
git log --oneline -5
```

## Bước 2 — Đọc full diff để hiểu thay đổi

```bash
git diff
git diff --cached
```

## Bước 3 — Phân tích và sinh commit message

Xác định:
- **Type**: `feat` | `fix` | `refactor` | `test` | `chore` | `docs` | `style` | `perf`
- **Scope**: từ `$ARGUMENTS` hoặc tự suy ra từ files thay đổi (e.g. `be`, `fe`, `auth`, `standup`)
- **Subject**: mô tả ngắn ≤ 72 ký tự, tiếng Anh, động từ thường (add / update / fix / remove)
- **Body (nếu cần)**: giải thích WHY, liệt kê breaking changes, DB migrations

Format chuẩn:
```
type(scope): subject

- bullet 1 nếu cần giải thích thêm
- bullet 2

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Ví dụ tốt:
```
feat(be): add standup auto-generation via Gemini AI

- POST /api/v1/standup/generate pulls Jira issues + GitHub commits
- Confluence push formats weekly table in storage format
- Requires GEMINI_API_KEY env var

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Bước 4 — Stage files phù hợp

**KHÔNG stage:**
- `application-local.yaml`, `.env`, `.env.*`
- `node_modules/`, `dist/`, `target/`, `*.class`
- Files chứa credentials hoặc secrets

Stage các file liên quan:
```bash
git add <files cụ thể>
```

> Tránh `git add .` hoặc `git add -A` — chỉ add files đã xác định an toàn.

## Bước 5 — Commit

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject

- body nếu cần

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

## Bước 6 — Xác nhận kết quả

```bash
git log --oneline -3
git status
```

Output cho user:
```
✅ Committed: <hash> — type(scope): subject
📁 Files: X files changed, Y insertions(+), Z deletions(-)
🌿 Branch: <current-branch>

Bước tiếp theo:
• Push:       git push origin <branch>
• Tạo PR:    /workflow/create-pr [reviewer]
```

## Lưu ý quan trọng

- Nếu có pre-commit hook fail → FIX vấn đề, KHÔNG dùng `--no-verify`
- Nếu không có gì để commit → báo rõ, không tạo empty commit
- Nếu đang ở branch `master` hoặc `main` → cảnh báo, hỏi xác nhận trước khi commit
