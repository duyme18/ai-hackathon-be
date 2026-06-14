# Implementation Plan: Tích hợp API — System Parameters

**Spec BE:** `be/output/API.md`
**DB Design:** `be/output/DB-DESIGN.md`
**Ngày:** 2026-06-12

---

## Phát hiện từ output files

### Discrepancies FE ↔ BE

| # | Vấn đề | Hiện trạng FE | Cần sửa |
|---|--------|--------------|---------|
| D1 | API path thiếu `/v1/` | `/api/system-parameters` | `/api/v1/system-parameters` |
| D2 | Sort không được BE hỗ trợ | FE gửi `sort` param | BE hardcode `createdAt DESC` — cần fix BE hoặc sort client-side |
| D3 | Env var chưa có | `VITE_API_BASE_URL` chưa có `.env.local` | Tạo `.env.local` |
| D4 | BE default size = 20 | FE spec dùng 10 | Truyền `size=10` khi gọi API |

### Tình trạng FE hiện tại

| File | Tình trạng |
|------|-----------|
| `src/types/system-parameter.ts` | ✅ Types khớp BE response |
| `src/lib/api/client.ts` | ✅ Extract `data`, gắn JWT header đúng |
| `src/lib/api/system-parameters.ts` | ⚠️ Sai path — thiếu `/v1/` |
| `src/hooks/useSystemParameters.ts` | Cần verify |
| `src/pages/SystemParametersPage.tsx` | Cần verify |
| `src/components/system-parameters/*` | Cần verify |
| `.env.local` | ❌ Chưa có |

---

## Architecture Decisions

- **Path fix:** Sửa `BASE` trong `system-parameters.ts`: `/api/system-parameters` → `/api/v1/system-parameters`
- **Sort:** BE không nhận sort param → sort client-side trên data trả về (giải pháp nhanh); Task 6 fix BE đúng cách
- **Env:** `.env.local` với `VITE_API_BASE_URL=http://localhost:8080` (gitignored, không commit)
- **Auth:** `client.ts` đọc `localStorage.getItem('accessToken')` — cần verify login flow lưu đúng key

---

## Dependency Graph

```
Task 1: Fix env + API path  (blocker cho mọi thứ)
    │
    ├── Task 2: Verify/fix hooks
    │               │
    │               └── Task 3: Verify SystemParametersPage
    │                               │
    │                               ├── Task 4: Verify FormModal
    │                               └── Task 5: Verify DeleteDialog + in-use
    │
    └── Task 6: Fix BE sort param  (optional, độc lập)
```

---

## Phase 1: Critical Fixes

### Task 1: Fix env + API path

**Files:**
- `fe/.env.local` — tạo mới (gitignored)
- `fe/.env.example` — tạo mới (template public)
- `fe/src/lib/api/system-parameters.ts` — sửa `BASE`

**Acceptance criteria:**
- [ ] `.env.local` có `VITE_API_BASE_URL=http://localhost:8080`
- [ ] `BASE = '/api/v1/system-parameters'`
- [ ] `apiFetch` resolve URL đúng: `http://localhost:8080/api/v1/system-parameters`
- [ ] Build pass

**Size:** XS

---

### Task 2: Verify + fix hooks

**File:** `src/hooks/useSystemParameters.ts`

**Kiểm tra:**
- Default `size=10` (không để BE default 20)
- `useCheckInUse(id)` là lazy — `enabled: false`, trigger manual
- Error message extract từ `ApiError.message`
- Mutations invalidate query key `['system-parameters']` sau success

**Acceptance criteria:**
- [ ] `useSystemParameterList` truyền `size=10` mặc định
- [ ] Create/Update/Delete mutation invalidate list
- [ ] `useCheckInUse` không auto-run
- [ ] Build pass

**Size:** S

---

## Phase 2: UI Verification

### Task 3: Verify SystemParametersPage

**File:** `src/pages/SystemParametersPage.tsx`

**Kiểm tra theo API.md response shape:**
- `data.content` — array records
- `data.number` — page index (0-based từ BE) → STT = `page * size + index + 1`
- `data.totalElements`, `data.totalPages` — cho pagination
- `description = null` → hiển thị "—"
- Sau xóa record cuối trang → `totalPages` giảm → lùi trang tự động
- Sort "Tên tham số": BE chưa hỗ trợ → sort client-side trên `content` array

**Acceptance criteria:**
- [ ] Gọi đúng `?page=0&size=10&keyword=...`
- [ ] STT tính đúng 0-based page
- [ ] `null` description → "—"
- [ ] Trang rỗng sau xóa → lùi trang
- [ ] Build pass

**Size:** M

---

### Task 4: Verify SystemParameterFormModal

**File:** `src/components/system-parameters/SystemParameterFormModal.tsx`

**Kiểm tra theo API.md:**
- POST `{ key, value, description? }` → 201, response trong `data`
- PUT `{ key, value, description? }` → 200
- 409 `"System parameter key already exists"` → toast đúng
- 409 `"System parameter is in use and cannot be modified"` → toast đúng
- 400 validation error → hiển thị inline

**Acceptance criteria:**
- [ ] Body request đúng `SystemParameterRequest`
- [ ] 409 message từ BE match toast text
- [ ] Build pass

**Size:** S

---

### Task 5: Verify DeleteConfirmDialog + in-use flow

**File:** `src/components/system-parameters/DeleteConfirmDialog.tsx`

**Kiểm tra:**
- In-use check: `GET /api/v1/system-parameters/{id}/in-use` → `data.inUse: boolean`
- `inUse = true` → toast "không thể sửa/xóa", không mở dialog
- DELETE 409 → `ApiError.message = "System parameter is in use..."` → toast
- DELETE 200 → `data: null` — phải xử lý được (không crash)

**Acceptance criteria:**
- [ ] Đọc `response.data.inUse` đúng
- [ ] `null` data sau DELETE không gây lỗi
- [ ] Build pass

**Size:** S

---

## Phase 3: BE Sort Fix

### Task 6: Cập nhật BE controller — thêm sort param

**File:** `be/src/main/java/com/ai_hackathon/app/controller/SystemParameterController.java`

**Thay đổi:**
```java
// Thêm params
@RequestParam(defaultValue = "createdAt") String sortBy,
@RequestParam(defaultValue = "desc") String direction

// Build sort
Sort sort = direction.equalsIgnoreCase("asc")
    ? Sort.by(Sort.Direction.ASC, sortBy)
    : Sort.by(Sort.Direction.DESC, sortBy);
Pageable pageable = PageRequest.of(page, size, sort);
```

**FE sau khi BE fix:** Cập nhật `listSystemParameters` gửi `sortBy=key&direction=asc` thay vì `sort=key,asc`

**Acceptance criteria:**
- [ ] `GET ?sortBy=key&direction=asc` trả về sorted đúng
- [ ] Default `createdAt DESC` vẫn hoạt động
- [ ] `./mvnw clean package -DskipTests` pass

**Size:** S

---

## Checkpoint: Integration Complete

- [ ] FE gọi đúng `http://localhost:8080/api/v1/system-parameters`
- [ ] JWT Bearer token gắn vào mọi request
- [ ] List + phân trang hoạt động
- [ ] Create: 201 → reload list, toast
- [ ] Update: 200 → reload list, toast
- [ ] Delete: 200 → reload list, lùi trang nếu cần
- [ ] In-use pre-check hoạt động
- [ ] 409 / 404 error hiển thị đúng message
- [ ] `npm run build` pass, không TypeScript errors
