# /be-dev — Implement BE Feature

Implement một BE feature cho Tendoo AI project theo chuẩn enterprise.

**Feature/SPEC:** $ARGUMENTS

## Quy trình bắt buộc

### Bước 1 — Đọc context
1. Đọc `be/CLAUDE.md` để nắm conventions (pattern, ErrorCode, Lombok rules)
2. Nếu tồn tại `be/SPEC-$ARGUMENTS.md` → đọc toàn bộ spec
3. Đọc `be/tasks/plan.md` và `be/tasks/todo.md` — cập nhật nếu cần
4. Đọc `be/output/API.md` và `be/output/DB-DESIGN.md` để tránh trùng lặp

### Bước 2 — Kiểm tra entity hiện có
Tham chiếu bảng entity trong `CLAUDE.md` (root). KHÔNG tạo lại entity đã có:
User, Project, Task, Tag, SpecFile, ChatMessage, SystemParameter

### Bước 3 — Implement theo đúng thứ tự
```
Migration SQL (nếu cần schema mới)
  → Entity (@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor)
  → Repository (+ JPQL search query nếu cần)
  → DTO Request / Response (không dùng entity trực tiếp)
  → Service interface
  → ServiceImpl (@Transactional(readOnly=true) class, override write methods)
  → Controller (@RequestMapping("/api/v1/..."), wrap ApiResponse<T>)
  → ErrorCode mới (nếu cần, append vào enum, KHÔNG sửa existing)
```

### Bước 4 — Rules không được vi phạm
- KHÔNG dùng `@Data`
- KHÔNG return Entity từ Controller — luôn dùng DTO
- KHÔNG return null từ Service — dùng `findOrThrow(id)`
- KHÔNG sửa Flyway migration đã applied — tạo migration mới
- Migration tiếp theo: **V9** (kiểm tra trong `be/src/main/resources/db/migration/`)
- Wrap mọi response trong `ApiResponse<T>`
- Throw `AppException(ErrorCode.X)` thay vì trả null hoặc throw generic Exception

### Bước 5 — Verify build
```powershell
cd be && .\mvnw.cmd clean package -DskipTests
```
Build PHẢI pass trước khi kết thúc.

### Bước 6 — Update todo
Đánh dấu `[x]` cho từng task đã xong trong `be/tasks/todo.md`.

## Output mong đợi
- Danh sách files đã tạo/sửa
- Migration SQL (nếu có)
- Swagger endpoint mới: `http://localhost:8080/swagger-ui.html`
- Build status: PASS
