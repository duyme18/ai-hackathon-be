# SPEC: Quản lý Danh sách Tham số Hệ thống — Frontend

**Trạng thái**: Bản nháp
**Ngày**: 2026-06-10
**Route**: `/system-parameters`
**API Base**: `/api/system-parameters` (không có `/v1/` prefix ở FE)
**Backend SPEC**: `be/SPEC-system-parameters.md`

---

## Assumptions

| # | Nội dung giả định | Ảnh hưởng nếu sai |
|---|-------------------|--------------------|
| A1 | Figma design chưa có, UI dựa theo screenshot hiện tại của Tendoo AI portal | Cần update nếu Figma khác |
| A2 | API base URL lấy từ `VITE_API_BASE_URL` env var | Cần config env |
| A3 | Bảng mapping câu lệnh ↔ tham số sẽ có sau — `/in-use` hiện trả `false` | In-use check sẽ hoạt động đúng khi BE hoàn thiện |
| A4 | Auth token JWT lưu trong localStorage/cookie và tự động gắn vào header | Cần reuse auth interceptor hiện tại |

---

## 1. Yêu cầu Chức năng

| ID | Chức năng |
|----|-----------|
| FR-001 | Xem danh sách tham số: tìm kiếm theo key/mô tả (contains, case-insensitive), lọc theo kiểu dữ liệu, sort theo cột, phân trang |
| FR-002 | Xem chi tiết tham số (inline hoặc qua modal) |
| FR-003 | Thêm tham số mới: form modal với key (auto-uppercase), value, mô tả |
| FR-004 | Sửa tham số: kiểm tra in-use trước khi mở modal |
| FR-005 | Xoá tham số: kiểm tra in-use → confirm dialog → xoá |

---

## 2. API Mapping

| FR | Method | Endpoint | Mô tả |
|----|--------|----------|-------|
| FR-001 | GET | `/api/system-parameters?keyword=&page=0&size=10&sort=createdAt,desc` | Danh sách phân trang |
| FR-002 | GET | `/api/system-parameters/{id}` | Chi tiết |
| FR-003 | POST | `/api/system-parameters` | Tạo mới |
| FR-004 | PUT | `/api/system-parameters/{id}` | Cập nhật |
| FR-005 | DELETE | `/api/system-parameters/{id}` | Xoá |
| FR-004, FR-005 | GET | `/api/system-parameters/{id}/in-use` | Pre-check in-use |

**Query params cho FR-001:** `keyword`, `page` (default=0), `size` (10/20/50, default=10), `sort` (field,direction)

---

## 3. UI Screens

### Màn hình 1: Danh sách (`/system-parameters`)

**Layout:**
```
[Header: "Danh mục tham số"]
[Ô tìm kiếm]  [Filter Kiểu dữ liệu ▾]          [+ Thêm mới]

STT | Tên tham số | Kiểu dữ liệu | Mô tả | Thao tác
 1  | IS_FIRST_STEP | [Boolean] | Xác định... | ✏️ 🗑️
 ...

Tổng số: N bản ghi | Hiển thị [10 ▾] / trang | [< 1 >]
```

**Cột bảng:**

| Cột | Field | Ghi chú |
|-----|-------|---------|
| STT | index (computed) | Số thứ tự, tính theo page |
| Tên tham số | `key` (`param_key` trong DB) | Sortable |
| Kiểu dữ liệu | Infer từ `value` | Badge màu (xem BR-TYPE) |
| Mô tả | `description` | Truncate + tooltip nếu dài; "—" nếu null |
| Thao tác | — | Icon Sửa (✏️) + Xoá (🗑️) |

**Business Rules — Kiểu dữ liệu (type inference):**

| Rule | Logic |
|------|-------|
| BR-TYPE-1 | `value` ∈ {"true","false","0","1"} (case-insensitive) → **Boolean** (badge xanh dương) |
| BR-TYPE-2 | `value` là số hợp lệ (isFinite) → **Number** (badge cam) |
| BR-TYPE-3 | Còn lại → **Text** (badge xanh lá) |

**Filter Kiểu dữ liệu:** Lọc local (client-side) dựa trên type inference. Options: "Tất cả kiểu dữ liệu" / "Boolean" / "Number" / "Text".

**Tìm kiếm:** Gửi `keyword` lên API, debounce 300ms, reset về page 1 khi đổi keyword.

**Sort:** Bấm tiêu đề cột "Tên tham số" → toggle asc/desc, gửi lên API `sort=key,asc` hoặc `sort=key,desc`.

**Trạng thái màn hình:**

| Trạng thái | Hiển thị |
|-----------|---------|
| Loading | Skeleton loader hoặc spinner trên bảng |
| Empty (chưa có data) | Icon + "Chưa có tham số nào" + nút "Thêm mới" |
| Empty (tìm không có kết quả) | Icon + "Không tìm thấy kết quả phù hợp" |
| Error | Toast: message từ API |

---

### Màn hình 2: Modal Form Thêm/Sửa

**Fields:**

| Field | Type | Bắt buộc | Behavior |
|-------|------|----------|---------|
| key | input text | Có | Auto-uppercase real-time (cả gõ và paste); trim khoảng trắng; chỉ nhận `[A-Z0-9_]`; max 20 ký tự |
| value | textarea | Có | Giữ nguyên nội dung người dùng nhập |
| description | textarea | Không | Optional, không validation |

**Validation (client-side):**

| Field | Rule | Thông báo inline |
|-------|------|-----------------|
| key | Bắt buộc | "Đây là thông tin bắt buộc" |
| key | Regex `^[A-Z0-9_]+$` | "Chỉ chấp nhận chữ hoa, số và dấu gạch dưới" |
| key | max 20 ký tự | "Tối đa 20 ký tự" |
| value | Bắt buộc | "Đây là thông tin bắt buộc" |

**Nút:**

| Nút | Behavior |
|-----|---------|
| Lưu | Disable + spinner khi đang gọi API |
| Huỷ / X | Đóng ngay, không cảnh báo, không lưu |

**Mode:**
- **Thêm mới**: form trống, POST `/api/system-parameters`
- **Sửa**: prefill dữ liệu hiện tại, field `key` disabled (không cho sửa key), PUT `/api/system-parameters/{id}`

---

### Màn hình 3: Confirm Dialog Xoá

| Element | Nội dung |
|---------|---------|
| Tiêu đề | "Xác nhận xoá" |
| Nội dung | "Bạn có chắc muốn xoá tham số này?" |
| Nút Xác nhận | Gọi DELETE, disable + spinner khi đang xoá |
| Nút Huỷ | Đóng dialog, không xoá |

---

## 4. Error Messages

| Trường hợp | Thông báo | Vị trí |
|-----------|-----------|--------|
| key đã tồn tại (409 từ API) | "Tham số đã tồn tại" | Toast |
| Tham số đang được sử dụng (in-use pre-check) | "Tham số đã được sử dụng, không thể sửa/xoá" | Toast |
| Tham số in-use (409 từ API khi PUT/DELETE) | "Tham số đã được sử dụng, không thể sửa/xoá" | Toast |
| Thiếu field bắt buộc | "Đây là thông tin bắt buộc" | Inline dưới field |
| key sai định dạng | "Chỉ chấp nhận chữ hoa, số và dấu gạch dưới" | Inline dưới field |
| key quá 20 ký tự | "Tối đa 20 ký tự" | Inline dưới field |
| Server error | Theo message từ API | Toast |

---

## 5. Flow Sửa tham số (FR-004)

```
Bấm ✏️
  → GET /api/system-parameters/{id}/in-use
    → inUse = true  → Toast "không thể sửa" → DỪNG
    → inUse = false → Mở modal Form với data hiện tại
                      → User chỉnh sửa → Bấm Lưu
                        → Client validate → nếu lỗi: inline error
                        → PUT /api/system-parameters/{id}
                          → 409 → Toast "không thể sửa"
                          → 200 → Đóng modal → Reload list → Toast thành công
```

---

## 6. Flow Xoá tham số (FR-005)

```
Bấm 🗑️
  → GET /api/system-parameters/{id}/in-use
    → inUse = true  → Toast "không thể xoá" → DỪNG
    → inUse = false → Hiện Confirm Dialog
                      → Bấm Huỷ → Đóng dialog
                      → Bấm Xác nhận → DELETE /api/system-parameters/{id}
                        → 409 → Toast "không thể xoá" → Đóng dialog
                        → 200 → Đóng dialog → Reload list → Toast thành công
                              → Nếu trang hiện tại rỗng → lùi về trang trước
```

---

## 7. Pagination Logic

- Default: 10 bản ghi/trang
- Page size options: 10 / 20 / 50
- Khi đổi keyword / sort / page size → reset về page 1
- Xoá bản ghi cuối của trang → nếu trang rỗng → lùi về trang trước
- STT = (page * pageSize) + index + 1

---

## 8. Success Criteria

- [ ] Danh sách load đúng, phân trang hoạt động
- [ ] Tìm kiếm theo keyword debounce 300ms, reset page về 1
- [ ] Filter Kiểu dữ liệu hoạt động (client-side)
- [ ] Sort theo "Tên tham số" (asc/desc) gửi lên API
- [ ] Thêm mới: key auto-uppercase, validation inline, POST thành công
- [ ] key trùng → toast "Tham số đã tồn tại"
- [ ] Sửa: pre-check in-use, key disabled trong modal sửa
- [ ] Xoá: pre-check in-use, confirm dialog, xoá thành công
- [ ] In-use → toast đúng message, không mở modal/dialog
- [ ] Trang rỗng sau xoá → lùi trang tự động
- [ ] Toast success/error hiển thị đúng
- [ ] Không có TypeScript errors
- [ ] Build pass (`npm run build`)
