---
description: "Tạo Pull Request lên GitHub, assign reviewer, tự động generate description từ diff. Dùng: /workflow/create-pr [reviewer_github_username]"
allowed-tools: Bash, Read
---

# /workflow/create-pr — Tạo Pull Request + Assign Reviewer

**Reviewer GitHub username (optional):** $ARGUMENTS

## Bước 1 — Kiểm tra trạng thái

```bash
git branch --show-current
git status
git log origin/master...HEAD --oneline
git diff origin/master...HEAD --stat
```

Nếu branch là `master` hoặc `main` → **dừng lại**, báo user cần tạo branch riêng.

Nếu có uncommitted changes → nhắc user commit trước (gợi ý `/workflow/git-commit`).

## Bước 2 — Đọc full diff để phân tích

```bash
git diff origin/master...HEAD
```

Xác định:
- **Type**: feat / fix / refactor / test / chore / docs
- **Scope**: be / fe / full-stack
- **Breaking changes**: DB migration mới? API thay đổi? Env vars mới?
- **Ticket**: tìm trong branch name (e.g. `feat/TEN-123-...` → `TEN-123`) hoặc commit messages
- **Reviewer**: từ `$ARGUMENTS` — nếu không có, hỏi user

## Bước 3 — Push branch lên remote (nếu chưa có)

```bash
git push -u origin $(git branch --show-current)
```

Nếu push bị deny (protected branch) → báo lỗi cụ thể cho user.

## Bước 4 — Tạo PR với `gh`

```bash
gh pr create \
  --base master \
  --title "type(scope): mô tả ngắn" \
  --body "$(cat <<'EOF'
## 📋 Summary
<!-- 2-3 bullets mô tả thay đổi chính -->
- ...

## 🔄 Changes

### Backend
- ...

### Frontend
- ...

## 🧪 Test Plan
- [ ] Build pass BE: `cd be && .\mvnw.cmd clean package -DskipTests`
- [ ] Build pass FE: `cd fe && npm run build`
- [ ] [Flow cụ thể cần test]

## ⚠️ Notes
<!-- Breaking changes, migration, env vars mới -->
- DB Migration: ...
- Env vars mới: ...

---
🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"
```

**Nếu có reviewer từ `$ARGUMENTS`**, thêm flag:
```bash
--reviewer "$ARGUMENTS"
```

**Nếu không có reviewer**, tạo PR trước rồi assign sau:
```bash
gh pr edit <PR_NUMBER> --add-reviewer <username>
```

## Bước 5 — Assign thêm (nếu cần)

```bash
# Xem danh sách collaborators để chọn reviewer
gh api repos/{owner}/{repo}/collaborators --jq '.[].login'

# Assign reviewer
gh pr edit <PR_NUMBER> --add-reviewer <username1>,<username2>

# Add label nếu có
gh pr edit <PR_NUMBER> --add-label "review-needed"
```

## Bước 6 — Output kết quả

```
✅ PR đã tạo thành công!

🔗 URL:      https://github.com/...
📌 Title:    type(scope): mô tả
👀 Reviewer: @username
🌿 Branch:   feature/... → master

Checklist sau khi tạo PR:
• [ ] Ping reviewer trên Slack/Teams
• [ ] Kiểm tra CI/CD pass
• [ ] Update Jira ticket sang "In Review"
```

## Lưu ý

- Nếu `gh` chưa được auth: chạy `gh auth login` và làm theo hướng dẫn
- Nếu repo private và không có quyền: kiểm tra `gh auth status`
- KHÔNG push trực tiếp lên `master` hoặc `main`
- Nếu chưa có commits mới so với master → báo "không có gì để tạo PR"
