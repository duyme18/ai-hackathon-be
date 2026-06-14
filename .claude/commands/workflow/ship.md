# /ship — Pre-Demo Ship Check

Chạy toàn bộ checks trước khi demo hoặc submit hackathon.

## Checklist tự động

### 1. BE Build
```powershell
cd be && .\mvnw.cmd clean package -DskipTests
```
→ PHẢI pass. Nếu fail: fix lỗi trước khi tiếp tục.

### 2. FE Build + Lint
```bash
cd fe && npm run build && npm run lint
```
→ PHẢI pass. 0 TypeScript errors. 0 lint errors.

### 3. Security check tự động
Review các điểm sau trong code vừa thay đổi:
- Không có hardcoded credentials, tokens, passwords
- Không có `console.log` với data nhạy cảm
- SQL injection: dùng JPQL params, không concat string
- XSS: không dùng `dangerouslySetInnerHTML`
- Auth: mọi API endpoint đều có JWT check (trừ `/auth/**`)

### 4. Functional checklist

**API (swagger: http://localhost:8080/swagger-ui.html):**
- [ ] Tất cả endpoints trả đúng HTTP status
- [ ] Error responses đúng format `{ status, message, data: null }`
- [ ] Pagination hoạt động (page, size, totalElements, totalPages)

**UI (http://localhost:5173):**
- [ ] Sidebar navigation đúng
- [ ] Page load không có console errors
- [ ] CRUD golden path: Thêm → Sửa → Xoá hoạt động
- [ ] Toast success/error hiển thị
- [ ] Empty state hiển thị khi không có data
- [ ] Loading state hiển thị khi đang fetch
- [ ] Validation inline errors hiển thị

### 5. Todo check
Kiểm tra các file todo còn task `[ ]` chưa done:
- `be/tasks/todo.md`
- `fe/tasks/todo.md`

Liệt kê tasks chưa hoàn thành.

### 6. Report tổng kết

Output format:
```
## Ship Check Report — [datetime]

### BE Build: ✅ PASS / ❌ FAIL
### FE Build: ✅ PASS / ❌ FAIL
### Lint:     ✅ PASS / ❌ FAIL

### Security: ✅ Clean / ⚠️ Issues found
[list issues nếu có]

### Pending tasks:
- be/tasks/todo.md: X tasks remaining
- fe/tasks/todo.md: X tasks remaining

### Demo-ready: ✅ YES / ❌ NO — [lý do nếu NO]
```
