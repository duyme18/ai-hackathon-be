# /figma — Đọc Figma Design và Phân tích

Đọc Figma URL và phân tích design để chuẩn bị implement.

**Figma URL:** $ARGUMENTS

## Quy trình

### Bước 1 — Parse URL
Từ URL `https://www.figma.com/design/:fileKey/:name?node-id=X-Y`:
- `fileKey` = phần sau `/design/` trước `/`
- `nodeId` = `node-id` query param, đổi `-` thành `:` (e.g., `4866-261279` → `4866:261279`)

### Bước 2 — Lấy design data (song song)
- `get_design_context(fileKey, nodeId)` → layout XML + reference code
- `get_screenshot(fileKey, nodeId, maxDimension=1600)` → visual PNG

### Bước 3 — Phân tích và output

**Layout Structure:**
- Liệt kê các frame/screen chính
- Xác định component hierarchy

**Columns/Fields:**
- Nếu là table: liệt kê columns, width, data source
- Nếu là form: liệt kê fields, type, required/optional

**Màu và Spacing:**
- Map màu → semantic token tương ứng
- Spacing values

**Components cần tạo:**
- Liệt kê component breakdown theo shadcn/ui primitives

**Discrepancies với SPEC hiện tại:**
- Những điểm Figma khác với SPEC-*.md (nếu đọc được SPEC)
- Những field/column Figma có nhưng BE entity chưa có

**Câu hỏi cần xác nhận:**
- Data model questions
- Business logic unclear points

## Output format
```
## Screens
1. [tên màn hình] — mô tả
2. ...

## Table columns / Form fields
| Figma label | BE field | Ghi chú |
|---|---|---|

## Component breakdown
- PageComponent → src/pages/
- FeatureComponent → src/components/<feature>/
- shadcn/ui used: Table, Dialog, Button, Input, ...

## Gaps cần xác nhận
1. ...
```
