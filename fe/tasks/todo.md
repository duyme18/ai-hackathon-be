# Todo: Tích hợp API — System Parameters

**Plan:** `fe/tasks/plan.md`
**BE API:** `be/output/API.md`

> FE implementation: Tasks 1–6 ✅ hoàn thành
> API Integration: Tasks 1–5 ✅ hoàn thành
> Figma Alignment: ✅ hoàn thành (2026-06-14)

---

## Phase 1: Critical Fixes 🔴

- [x] **Task 1** — Tạo `fe/.env.local` (`VITE_API_BASE_URL=http://localhost:8080`) + sửa `BASE` trong `system-parameters.ts`: `/api/system-parameters` → `/api/v1/system-parameters`
- [x] **Task 2** — Verify/fix `useSystemParameters.ts`: default `size=10`, lazy `useCheckInUse`, mutation invalidate `['system-parameters']`

### Checkpoint 1
- [x] `npm run build` pass
- [x] URL gọi đúng `http://localhost:8080/api/v1/system-parameters`

---

## Phase 2: UI Verification + Figma Alignment 🟡

- [x] **Task 3** — Update `SystemParametersPage`: columns per Figma (Mã cấu hình, Giá trị, Mô tả), STT 0-based, null description → "—", lùi trang sau xóa
- [x] **Task 4** — Update `SystemParameterFormModal`: title "Thêm mới/Chỉnh sửa cấu hình hệ thống", labels per Figma, value → Input, modal width 600px, button "Hủy bỏ"
- [x] **Task 5** — Verify `DeleteConfirmDialog`: title "Xác nhận xóa", button "Hủy bỏ", xử lý `data: null` khi DELETE 200

### Checkpoint 2
- [x] `npm run build` pass ✅
- [x] Không TypeScript errors ✅

---

## Phase 3: BE Sort Fix (optional) 🟢

- [ ] **Task 6** — Cập nhật BE controller thêm `sortBy` + `direction` params; cập nhật FE gửi đúng params

---

### Checkpoint: Integration Complete
- [x] `npm run build` pass ✅
- [x] Không TypeScript errors ✅
- [ ] List / Create / Update / Delete / InUse hoạt động với BE thực tế (cần BE running)
- [x] JWT header gắn đúng mọi request ✅
- [x] 400 / 404 / 409 error hiển thị đúng message từ BE ✅

---

## Gap đã xác định (cần confirm)

- **"Tên cấu hình"** (Figma có cột này): BE entity `SystemParameter` không có field `name` — hiện tại bỏ qua cột này, dùng `key` làm "Mã cấu hình". Nếu cần thêm display name, cần migration V9 + BE update.
