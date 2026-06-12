# SPEC: Quản lý Danh sách Tham số Hệ thống

**Trạng thái**: Bản nháp
**Tác giả**: BA (spec-interview)
**Ngày**: 2026-05-19
**Đường dẫn Theme**: themes/quan-ly-tham-so-he-thong/

---

## Assumptions (Giả định)

> Các mục đánh dấu [GIẢ ĐỊNH] chưa được xác nhận rõ ràng.
> Tech Lead / PO cần review và xác nhận trước khi SPEC được approve.

| # | Nội dung giả định | Ảnh hưởng nếu sai |
|---|-------------------|-------------------|
| A1 | [GIẢ ĐỊNH] Figma design chưa có, sẽ bổ sung sau | Cần update lại mục UI Screens trước khi dev bắt đầu frontend |
| A2 | [GIẢ ĐỊNH] Bảng mapping câu lệnh ↔ tham số đã có cột `parameter_id` trỏ về `system_parameters.id` | Nếu chưa có → cần ALTER bảng mapping, đánh giá thêm ở DESIGN.md |
| A3 | [GIẢ ĐỊNH] Thời gian phản hồi p95 < 500ms | Nếu yêu cầu cao hơn → cần caching hoặc tối ưu query |
| A4 | [GIẢ ĐỊNH] Số lượng tham số hệ thống dự kiến < 1.000 bản ghi | Nếu lớn hơn → cần đánh giá phân trang và index |

---

## 1. Yêu cầu Chức năng

1. Quản trị hệ thống có thể **xem danh sách** tham số hệ thống với tìm kiếm theo mã (key) hoặc mô tả, có phân trang.
2. Quản trị hệ thống có thể **xem chi tiết** một tham số (key, value, mô tả).
3. Quản trị hệ thống có thể **thêm mới** tham số với các thông tin: key, value, mô tả.
4. Quản trị hệ thống có thể **sửa** tham số — chỉ khi tham số chưa được sử dụng bởi bất kỳ câu lệnh nào.
5. Quản trị hệ thống có thể **xoá** tham số — chỉ khi tham số chưa được sử dụng bởi bất kỳ câu lệnh nào.

---

## 2. Mô tả Use Case Chi tiết

---

### FR-001: Xem danh sách tham số hệ thống

| Thuộc tính | Nội dung |
|------------|----------|
| **ID** | FR-001 |
| **Tên chức năng** | Xem danh sách tham số hệ thống |
| **Mô tả** | Cho phép Quản trị hệ thống tra cứu toàn bộ tham số đang có, tìm kiếm nhanh theo key hoặc mô tả |
| **Actor** | Quản trị hệ thống |
| **Trigger** | Truy cập màn hình Quản lý tham số hệ thống |
| **Pre-condition** | Đã đăng nhập với role Admin |
| **Post-condition (Success)** | Danh sách tham số được hiển thị, phân trang |
| **Màn hình liên quan** | Màn hình Danh sách tham số |

**Main Flow:**

| Bước | Actor | Hành động / Phản hồi hệ thống |
|------|-------|-------------------------------|
| 1 | Quản trị hệ thống | Truy cập màn hình danh sách tham số |
| 2 | Hệ thống | Gọi `GET /system-parameters`, hiển thị danh sách phân trang (mặc định sắp xếp theo `created_at DESC`) |
| 3 | Quản trị hệ thống | Nhập từ khoá vào ô tìm kiếm |
| 4 | Hệ thống | Lọc theo `key` HOẶC `description` chứa từ khoá (OR condition), cập nhật danh sách |

**Alternate Flow:**

| Điều kiện | Bắt đầu từ bước | Xử lý thay thế |
|-----------|-----------------|----------------|
| Không nhập từ khoá tìm kiếm | Bước 3 | Hệ thống hiển thị toàn bộ danh sách, không lọc |

**Exception Flow:**

| Lỗi / Edge Case | Phản hồi hệ thống |
|-----------------|-------------------|
| Không có tham số nào | Hiển thị trạng thái empty: icon + text "Chưa có tham số nào" |
| Tìm kiếm không có kết quả | Hiển thị trạng thái empty: "Không tìm thấy kết quả phù hợp" |
| Lỗi server | Toast: theo mô tả lỗi của API |

**Business Rules:**

| Rule ID | Quy tắc |
|---------|---------|
| BR-001 | Tìm kiếm áp dụng đồng thời cho `key` và `description` (OR), không phân biệt hoa thường |

---

### FR-002: Xem chi tiết tham số

| Thuộc tính | Nội dung |
|------------|----------|
| **ID** | FR-002 |
| **Tên chức năng** | Xem chi tiết tham số |
| **Mô tả** | Xem đầy đủ thông tin của một tham số cụ thể |
| **Actor** | Quản trị hệ thống |
| **Trigger** | Bấm vào một tham số trong danh sách |
| **Pre-condition** | Đã đăng nhập với role Admin; tham số tồn tại trong hệ thống |
| **Post-condition (Success)** | Thông tin chi tiết tham số được hiển thị |
| **Màn hình liên quan** | Màn hình Danh sách tham số (xem inline hoặc modal) |

**Main Flow:**

| Bước | Actor | Hành động / Phản hồi hệ thống |
|------|-------|-------------------------------|
| 1 | Quản trị hệ thống | Bấm vào tên tham số trong danh sách |
| 2 | Hệ thống | Gọi `GET /system-parameters/:id` |
| 3 | Hệ thống | Hiển thị chi tiết: key, value, mô tả |

**Exception Flow:**

| Lỗi / Edge Case | Phản hồi hệ thống |
|-----------------|-------------------|
| Tham số không tồn tại (đã bị xoá bởi người khác) | Toast: theo mô tả lỗi của API |

**Business Rules:** Không có.

---

### FR-003: Thêm tham số mới

| Thuộc tính | Nội dung |
|------------|----------|
| **ID** | FR-003 |
| **Tên chức năng** | Thêm tham số mới |
| **Mô tả** | Tạo một tham số hệ thống mới với key duy nhất, value và mô tả tùy chọn |
| **Actor** | Quản trị hệ thống |
| **Trigger** | Bấm nút "Thêm mới" trên màn hình danh sách |
| **Pre-condition** | Đã đăng nhập với role Admin |
| **Post-condition (Success)** | Tham số mới được lưu vào DB; modal đóng lại; danh sách cập nhật hiển thị tham số mới |
| **Màn hình liên quan** | Modal Form thêm/sửa tham số |

**Main Flow:**

| Bước | Actor | Hành động / Phản hồi hệ thống |
|------|-------|-------------------------------|
| 1 | Quản trị hệ thống | Bấm nút "Thêm mới" |
| 2 | Hệ thống | Hiển thị modal form trống với 3 trường: key, value, mô tả |
| 3 | Quản trị hệ thống | Nhập thông tin, bấm "Lưu" |
| 4 | Hệ thống | Validate dữ liệu phía client (frontend) |
| 5 | Hệ thống | Gọi `POST /system-parameters` |
| 6 | Hệ thống | Đóng modal; reload danh sách; hiển thị toast thành công |

**Alternate Flow:**

| Điều kiện | Bắt đầu từ bước | Xử lý thay thế |
|-----------|-----------------|----------------|
| Bấm "Huỷ" hoặc đóng modal | Bước 3 | Đóng modal, không lưu, danh sách không thay đổi |

**Exception Flow:**

| Lỗi / Edge Case | Phản hồi hệ thống |
|-----------------|-------------------|
| Thiếu trường bắt buộc (key hoặc value) | Inline dưới field: "Đây là thông tin bắt buộc" — KHÔNG gọi API |
| key không đúng định dạng | Inline dưới field key: mô tả quy tắc — KHÔNG gọi API |
| key vượt quá 20 ký tự | Inline dưới field key: "Tối đa 20 ký tự" — KHÔNG gọi API |
| key đã tồn tại trong hệ thống (lỗi từ API) | Toast: "Tham số đã tồn tại" |
| Lỗi server | Toast: theo mô tả lỗi của API |

**Business Rules:**

| Rule ID | Quy tắc |
|---------|---------|
| BR-001 | `key` bắt buộc nhập; chỉ chấp nhận chữ hoa (A–Z), chữ số (0–9), dấu gạch dưới (`_`); regex: `^[A-Z0-9_]+$` |
| BR-002 | `key` tối đa 20 ký tự |
| BR-003 | `key` phải duy nhất trong toàn bộ bảng `system_parameters` |
| BR-004 | `value` bắt buộc nhập; không giới hạn độ dài; không có ràng buộc định dạng |
| BR-005 | `description` không bắt buộc; không giới hạn độ dài |

---

### FR-004: Sửa tham số

| Thuộc tính | Nội dung |
|------------|----------|
| **ID** | FR-004 |
| **Tên chức năng** | Sửa tham số |
| **Mô tả** | Cập nhật value hoặc mô tả của tham số — chỉ khi tham số chưa được sử dụng bởi bất kỳ câu lệnh nào |
| **Actor** | Quản trị hệ thống |
| **Trigger** | Bấm nút "Sửa" trên một dòng trong danh sách |
| **Pre-condition** | Đã đăng nhập với role Admin; tham số tồn tại |
| **Post-condition (Success)** | Thông tin tham số được cập nhật; modal đóng lại; danh sách hiển thị dữ liệu mới |
| **Màn hình liên quan** | Modal Form thêm/sửa tham số |

**Main Flow:**

| Bước | Actor | Hành động / Phản hồi hệ thống |
|------|-------|-------------------------------|
| 1 | Quản trị hệ thống | Bấm nút "Sửa" trên dòng tham số |
| 2 | Hệ thống | Gọi `GET /system-parameters/:id/in-use` để kiểm tra trạng thái |
| 3 | Hệ thống | Tham số KHÔNG được sử dụng → hiển thị modal form với dữ liệu hiện tại |
| 4 | Quản trị hệ thống | Chỉnh sửa thông tin, bấm "Lưu" |
| 5 | Hệ thống | Validate dữ liệu phía client |
| 6 | Hệ thống | Gọi `PUT /system-parameters/:id` |
| 7 | Hệ thống | Đóng modal; reload danh sách; hiển thị toast thành công |

**Alternate Flow:**

| Điều kiện | Bắt đầu từ bước | Xử lý thay thế |
|-----------|-----------------|----------------|
| Bấm "Huỷ" hoặc đóng modal | Bước 4 | Đóng modal, không lưu |

**Exception Flow:**

| Lỗi / Edge Case | Phản hồi hệ thống |
|-----------------|-------------------|
| Tham số đang được sử dụng (kết quả từ bước 2) | Toast: "Tham số đã được sử dụng, không thể sửa" — KHÔNG mở modal |
| Thiếu trường bắt buộc | Inline dưới field: "Đây là thông tin bắt buộc" — KHÔNG gọi API |
| Lỗi server | Toast: theo mô tả lỗi của API |

**Business Rules:** Áp dụng BR-001 đến BR-005 (giống FR-003). Thêm:

| Rule ID | Quy tắc |
|---------|---------|
| BR-006 | Không cho phép sửa nếu tham số đang được tham chiếu bởi ≥ 1 câu lệnh trong bảng mapping |

---

### FR-005: Xoá tham số

| Thuộc tính | Nội dung |
|------------|----------|
| **ID** | FR-005 |
| **Tên chức năng** | Xoá tham số |
| **Mô tả** | Xoá vĩnh viễn tham số khỏi hệ thống — chỉ khi tham số chưa được sử dụng bởi bất kỳ câu lệnh nào |
| **Actor** | Quản trị hệ thống |
| **Trigger** | Bấm nút "Xoá" trên một dòng trong danh sách |
| **Pre-condition** | Đã đăng nhập với role Admin; tham số tồn tại |
| **Post-condition (Success)** | Tham số bị xoá khỏi DB; danh sách cập nhật |
| **Màn hình liên quan** | Confirm dialog xoá |

**Main Flow:**

| Bước | Actor | Hành động / Phản hồi hệ thống |
|------|-------|-------------------------------|
| 1 | Quản trị hệ thống | Bấm nút "Xoá" trên dòng tham số |
| 2 | Hệ thống | Gọi `GET /system-parameters/:id/in-use` để kiểm tra trạng thái |
| 3 | Hệ thống | Tham số KHÔNG được sử dụng → hiển thị confirm dialog: "Bạn có chắc muốn xoá tham số này?" |
| 4 | Quản trị hệ thống | Bấm "Xác nhận" |
| 5 | Hệ thống | Gọi `DELETE /system-parameters/:id` |
| 6 | Hệ thống | Đóng dialog; reload danh sách; hiển thị toast thành công |

**Alternate Flow:**

| Điều kiện | Bắt đầu từ bước | Xử lý thay thế |
|-----------|-----------------|----------------|
| Bấm "Huỷ" trong confirm dialog | Bước 4 | Đóng dialog, không xoá |

**Exception Flow:**

| Lỗi / Edge Case | Phản hồi hệ thống |
|-----------------|-------------------|
| Tham số đang được sử dụng (kết quả từ bước 2) | Toast: "Tham số đã được sử dụng, không thể xóa" — KHÔNG hiện confirm dialog |
| Lỗi server | Toast: theo mô tả lỗi của API |

**Business Rules:**

| Rule ID | Quy tắc |
|---------|---------|
| BR-007 | Không cho phép xoá nếu tham số đang được tham chiếu bởi ≥ 1 câu lệnh trong bảng mapping |
| BR-008 | Bắt buộc hiển thị confirm dialog trước khi thực hiện xoá |

---

## 3. Danh sách API cần có

> Chi tiết request/response schema sẽ được thiết kế ở DESIGN.md.

| # | Mục đích | Method | Path dự kiến | Cần xác thực | Role | FR liên quan |
|---|----------|--------|--------------|--------------|------|--------------|
| 1 | Lấy danh sách tham số (search + phân trang) | GET | `/system-parameters` | Có | Admin | FR-001 |
| 2 | Lấy chi tiết một tham số | GET | `/system-parameters/:id` | Có | Admin | FR-002 |
| 3 | Tạo tham số mới | POST | `/system-parameters` | Có | Admin | FR-003 |
| 4 | Cập nhật tham số | PUT | `/system-parameters/:id` | Có | Admin | FR-004 |
| 5 | Xoá tham số | DELETE | `/system-parameters/:id` | Có | Admin | FR-005 |
| 6 | Kiểm tra tham số đã được sử dụng chưa | GET | `/system-parameters/:id/in-use` | Có | Admin | FR-004, FR-005 |

---

## 4. Thay đổi Cơ sở dữ liệu

> Chi tiết schema, kiểu dữ liệu, index, constraint sẽ được thiết kế ở DESIGN.md.

### Bảng mới

| Tên bảng | Mục đích | Các trường dự kiến |
|----------|----------|--------------------|
| `system_parameters` | Lưu danh sách tham số hệ thống | `id`, `key`, `value`, `description`, `created_at`, `updated_at`, `created_by`, `updated_by` |

### Bảng hiện có — không thay đổi cấu trúc

| Tên bảng | Vai trò trong feature này | Ghi chú |
|----------|--------------------------|---------|
| Bảng mapping câu lệnh ↔ tham số | API `/in-use` query bảng này để kiểm tra tham chiếu | [GIẢ ĐỊNH] đã có cột `parameter_id` — xem A2 |

---

## 5. Màn hình UI

> [GIẢ ĐỊNH] Figma design chưa có, sẽ bổ sung sau (xem A1). Mô tả dưới đây là yêu cầu tối thiểu để dev bắt đầu.

### Màn hình 1: Danh sách tham số hệ thống

**Route**: `/system-parameters`

| Element | Mô tả |
|---------|-------|
| Ô tìm kiếm | Tìm theo key hoặc mô tả, debounce khi gõ |
| Bảng danh sách | Cột: key, value, mô tả, actions (Sửa, Xoá) |
| Nút "Thêm mới" | Góc trên bên phải, mở modal FR-003 |
| Phân trang | Cuối bảng |

**Trạng thái màn hình:**

| Trạng thái | Mô tả hiển thị |
|------------|----------------|
| Loading | Spinner toàn bảng, disable ô tìm kiếm và nút Thêm mới |
| Empty (chưa có dữ liệu) | Icon + text "Chưa có tham số nào" + nút "Thêm mới" |
| Empty (tìm kiếm không có kết quả) | Icon + text "Không tìm thấy kết quả phù hợp" |
| Error | Toast: theo mô tả lỗi của API |

**Mapping Use Case:**

| Hành động UI | FR liên quan | API gọi |
|--------------|-------------|---------|
| Load trang / nhập tìm kiếm | FR-001 | GET /system-parameters |
| Bấm tên tham số | FR-002 | GET /system-parameters/:id |
| Bấm "Thêm mới" | FR-003 | — (mở modal) |
| Bấm "Sửa" | FR-004 | GET /system-parameters/:id/in-use |
| Bấm "Xoá" | FR-005 | GET /system-parameters/:id/in-use |

---

### Màn hình 2: Modal Form thêm / sửa tham số

| Field | Kiểu | Bắt buộc | Placeholder |
|-------|------|----------|-------------|
| key | input text | Có | Ví dụ: MAX_RETRY_COUNT |
| value | input text | Có | Nhập giá trị |
| description | textarea | Không | Mô tả tham số (tùy chọn) |

**Trạng thái:**

| Trạng thái | Mô tả hiển thị |
|------------|----------------|
| Loading (đang lưu) | Disable nút "Lưu", hiện spinner trong nút |
| Validation error | Inline dưới field: "Đây là thông tin bắt buộc" hoặc mô tả lỗi định dạng |
| Lỗi từ API | Toast: theo nội dung đã định nghĩa ở mục 6 |

---

### Màn hình 3: Confirm Dialog xoá

| Element | Nội dung |
|---------|----------|
| Tiêu đề | "Xác nhận xoá" |
| Nội dung | "Bạn có chắc muốn xoá tham số này?" |
| Nút Xác nhận | Thực hiện xoá |
| Nút Huỷ | Đóng dialog, không xoá |

---

## 6. Thông báo Lỗi

| Trường hợp lỗi | Thông báo hiển thị | Vị trí hiển thị | Đa ngôn ngữ |
|----------------|--------------------|-----------------|-------------|
| key đã tồn tại trong hệ thống | "Tham số đã tồn tại" | Toast | Không |
| Sửa tham số đang được sử dụng | "Tham số đã được sử dụng, không thể sửa" | Toast | Không |
| Xoá tham số đang được sử dụng | "Tham số đã được sử dụng, không thể xóa" | Toast | Không |
| Thiếu trường bắt buộc (key hoặc value) | "Đây là thông tin bắt buộc" | Inline dưới field | Không |
| Lỗi server không xác định | Theo mô tả lỗi của API | Toast | Không |

---

## 7. Quy tắc Validation

| Field | Bắt buộc | Định dạng / Regex | Min | Max | Giá trị hợp lệ | Áp dụng tại |
|-------|----------|--------------------|-----|-----|----------------|-------------|
| `key` | Có | `^[A-Z0-9_]+$` (chỉ chữ hoa, số, dấu `_`) | 1 | 20 ký tự | — | FE và BE |
| `value` | Có | Không giới hạn định dạng | 1 | Không giới hạn | — | FE và BE |
| `description` | Không | Không giới hạn định dạng | — | Không giới hạn | — | Không cần validate |

---

## 8. Yêu cầu Phi Chức năng

| Thuộc tính | Mục tiêu | Ghi chú |
|------------|----------|---------|
| Thời gian phản hồi (p95) | < 500ms | [GIẢ ĐỊNH] — xem A3 |
| Số lượng bản ghi | < 1.000 | [GIẢ ĐỊNH] — xem A4 |
| Khả dụng | Theo SLA chung của hệ thống | Không có yêu cầu riêng |
| Phạm vi truy cập | Nội bộ — chỉ Admin đã đăng nhập | Không expose ra ngoài |
| Phân loại bảo mật | Internal | |
| Tuân thủ | Không có yêu cầu đặc biệt | |

---

## 9. Thuật ngữ Glossary

| Thuật ngữ | Định nghĩa | Ví dụ / Ghi chú |
|-----------|------------|-----------------|
| Tham số hệ thống | Cặp key-value được cấu hình ở cấp hệ thống, dùng để điều chỉnh hành vi các câu lệnh mà không cần sửa code | Key: `MAX_RETRY_COUNT`, Value: `3` |
| Câu lệnh | Đơn vị xử lý trong hệ thống, có thể tham chiếu nhiều tham số để thực thi | Một câu lệnh gửi email có thể dùng tham số `SMTP_HOST`, `SMTP_PORT` |
| Đang được sử dụng (in-use) | Trạng thái của tham số khi có ít nhất 1 câu lệnh đang mapping tới tham số đó | Kiểm tra qua bảng mapping câu lệnh ↔ tham số |
