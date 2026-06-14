---
description: "Tự động tạo PR description từ branch hiện tại. Dùng: /workflow/write-pr [tên ticket optional]"
allowed-tools: Bash, Read
---

# /workflow/write-pr — Tạo Pull Request Description

**Ticket/Context (optional):** $ARGUMENTS

## Bước 1 — Thu thập thông tin branch

```bash
git branch --show-current
git log origin/master...HEAD --oneline
git diff origin/master...HEAD --stat
git diff origin/master...HEAD
```

## Bước 2 — Phân tích changes

Xác định:
- **Type**: feat / fix / refactor / test / chore / docs
- **Scope**: fe / be / full-stack
- **Impact**: Breaking change? DB migration? Config thay đổi?
- **Ticket**: Tìm trong branch name (ví dụ `feat/TEN-123-...` → ticket TEN-123) hoặc từ `$ARGUMENTS`

## Bước 3 — Tạo PR description

Format chuẩn sẵn để paste vào GitHub:

```markdown
## 📋 Summary
<!-- Mô tả ngắn gọn thay đổi là gì và tại sao -->

[1-3 bullet points ngắn gọn]

## 🔄 Changes
<!-- Liệt kê các thay đổi chính -->

### Backend
- [ ] ...

### Frontend  
- [ ] ...

## 🧪 Test Plan
<!-- Checklist để reviewer test -->

- [ ] Build pass: `cd fe && npm run build`
- [ ] ...specific flows to test...

## 📸 Screenshots
<!-- Paste screenshot UI nếu có thay đổi giao diện -->

| Before | After |
|--------|-------|
| | |

## ⚠️ Notes
<!-- Breaking changes, migration cần chạy, env vars mới, v.v. -->

- DB Migration: ...
- Env vars mới: ...
- Deploy order: BE trước FE sau

---
🤖 Generated with Claude Code
```

## Bước 4 — Output title riêng

```
PR Title: [type]([scope]): [mô tả ngắn dưới 70 ký tự]
```

Ví dụ: `feat(fe): add system parameters management page`
