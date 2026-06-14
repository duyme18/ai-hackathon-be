---
description: "Tạo báo cáo daily standup từ git log + todo files. Dùng: /workflow/standup [blocker nếu có]"
allowed-tools: Bash, Read
---

# /workflow/standup — Daily Standup Report

**Blocker (optional):** $ARGUMENTS

## Bước 1 — Thu thập dữ liệu (song song)

```bash
# Git commits hôm nay
git log --oneline --since="yesterday 18:00" --until="now" --author="$(git config user.name)"

# Tất cả commits gần nhất cho context
git log --oneline -15
```

Đọc đồng thời:
- `be/tasks/todo.md` — `[x]` đã xong / `[ ]` còn lại
- `fe/tasks/todo.md` — tương tự

## Bước 2 — Tạo report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 DAILY STANDUP — Tendoo AI
 📅 [Thứ X, ngày DD/MM/YYYY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DONE (hôm qua / hôm nay sáng)
• [task 1 — từ git log hoặc todo [x]]
• [task 2]

🎯 TODAY (sẽ làm trong ngày)
• [task ưu tiên 1 — từ todo [ ]]
• [task ưu tiên 2]
• [task ưu tiên 3]

🚧 BLOCKER
[Từ $ARGUMENTS — hoặc "Không có"]

📊 PROGRESS
• BE:  [X]/[Y] tasks  ([Z]%)  ████████░░
• FE:  [X]/[Y] tasks  ([Z]%)  ██████░░░░
• Overall: [Z]%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Lưu ý
- Dùng commit message thực tế, không tự đặt
- Nếu không có git activity → nói thẳng "chưa có commit"
- Nếu user muốn lưu → append vào `tasks/standup-log.md` với separator `---`
