# Todo: Tích hợp API — System Parameters

**Plan:** `fe/tasks/plan.md`
**BE API:** `be/output/API.md`

> FE implementation: Tasks 1–6 ✅ hoàn thành
> Giai đoạn hiện tại: **API Integration** — fix discrepancies FE ↔ BE

---

## Phase 1: Critical Fixes 🔴

- [ ] **Task 1** — Tạo `fe/.env.local` (`VITE_API_BASE_URL=http://localhost:8080`) + sửa `BASE` trong `system-parameters.ts`: `/api/system-parameters` → `/api/v1/system-parameters`
- [ ] **Task 2** — Verify/fix `useSystemParameters.ts`: default `size=10`, lazy `useCheckInUse`, mutation invalidate `['system-parameters']`

### Checkpoint 1
- [ ] `npm run build` pass
- [ ] URL gọi đúng `http://localhost:8080/api/v1/system-parameters`

---

## Phase 2: UI Verification 🟡

- [ ] **Task 3** — Verify `SystemParametersPage`: STT với `page` 0-based (`page * size + index + 1`), `null` description → "—", lùi trang sau xóa
- [ ] **Task 4** — Verify `SystemParameterFormModal`: request body đúng `SystemParameterRequest`, 409 message match BE (`"System parameter key already exists"`)
- [ ] **Task 5** — Verify `DeleteConfirmDialog`: đọc `data.inUse`, xử lý `data: null` khi DELETE 200

### Checkpoint 2
- [ ] `npm run build` pass
- [ ] Không TypeScript errors

---

## Phase 3: BE Sort Fix (optional) 🟢

- [ ] **Task 6** — Cập nhật BE controller thêm `sortBy` + `direction` params; cập nhật FE gửi đúng params

---

### Checkpoint: Integration Complete
- [ ] `npm run build` pass
- [ ] Không TypeScript errors
- [ ] List / Create / Update / Delete / InUse hoạt động với BE thực tế
- [ ] JWT header gắn đúng mọi request
- [ ] 400 / 404 / 409 error hiển thị đúng message từ BE
