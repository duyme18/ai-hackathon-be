-- ============================================================
-- Tendoo AI — Test Seed Data
-- Mật khẩu mặc định tất cả users: Test@1234
-- BCrypt hash của "Test@1234" (rounds=10)
-- ============================================================

USE ai_hackathon;

-- Tắt FK check để insert an toàn
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu cũ theo thứ tự ngược FK
TRUNCATE TABLE command_parameter_mappings;
TRUNCATE TABLE system_parameters;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE spec_files;
TRUNCATE TABLE tags;
TRUNCATE TABLE tasks;
TRUNCATE TABLE projects;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS (password: Test@1234)
-- ============================================================
INSERT INTO users (id, email, password, name) VALUES
(1, 'admin@tendoo.ai',  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Admin Tendoo'),
(2, 'pm@tendoo.ai',     '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Nguyễn Văn PM'),
(3, 'dev@tendoo.ai',    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Trần Thị Dev');

-- ============================================================
-- PROJECTS
-- ============================================================
INSERT INTO projects (id, name, description, status) VALUES
(1, 'Tendoo AI Portal',     'Admin portal quản lý prompt, flow và tham số hệ thống',              'ACTIVE'),
(2, 'Data Pipeline v2',     'Nâng cấp pipeline xử lý dữ liệu realtime từ Kafka → ClickHouse',    'ACTIVE'),
(3, 'Legacy Migration',     'Migration hệ thống cũ từ MySQL 5.7 lên MariaDB 10.11',              'INACTIVE'),
(4, 'AI Chatbot Engine',    'Tích hợp LLM vào chatbot hỗ trợ khách hàng nội bộ',                 'ACTIVE');

-- ============================================================
-- TASKS
-- ============================================================
INSERT INTO tasks (id, title, description, status, priority, due_date, project_id) VALUES
-- Project 1: Tendoo AI Portal
(1,  'Setup Spring Boot base project',  'Khởi tạo project Spring Boot 4, cấu hình Flyway + JWT',      'DONE',        'HIGH',     '2026-05-10', 1),
(2,  'Implement System Parameters API', 'CRUD API cho system_parameters (FR-001 → FR-005)',            'DONE',        'HIGH',     '2026-05-20', 1),
(3,  'Implement Projects CRUD',         'API tạo, sửa, xóa project. Có phân trang + search',          'DONE',        'MEDIUM',   '2026-05-25', 1),
(4,  'Build Admin UI - Dashboard',      'Màn hình tổng quan: số project, task, thống kê nhanh',       'IN_PROGRESS', 'MEDIUM',   '2026-06-20', 1),
(5,  'Implement Command Flow API',      'API quản lý flow lệnh AI, mapping với system_parameters',    'TODO',        'HIGH',     '2026-07-05', 1),
(6,  'Write API documentation',         'Viết Swagger + API.md + DB-DESIGN.md cho toàn bộ endpoints', 'IN_PROGRESS', 'LOW',      '2026-06-15', 1),

-- Project 2: Data Pipeline v2
(7,  'Kafka consumer refactor',         'Tách consumer logic ra module riêng, thêm dead-letter queue', 'IN_PROGRESS', 'HIGH',     '2026-06-25', 2),
(8,  'ClickHouse schema design',        'Thiết kế bảng fact + dim cho analytics pipeline',             'TODO',        'HIGH',     '2026-07-01', 2),
(9,  'Performance benchmark',           'So sánh throughput trước và sau refactor (target: 50k msg/s)','TODO',        'MEDIUM',   '2026-07-10', 2),

-- Project 3: Legacy Migration
(10, 'Audit current schema',            'Liệt kê toàn bộ bảng, index, stored procedure cần migrate',  'DONE',        'HIGH',     '2026-04-15', 3),
(11, 'Write migration scripts',         'Chuyển đổi charset latin1 → utf8mb4, fix collation conflict', 'DONE',        'HIGH',     '2026-04-30', 3),
(12, 'UAT sign-off',                    'Chạy UAT với dữ liệu thật, xác nhận không mất dữ liệu',      'CANCELLED',   'CRITICAL', '2026-05-15', 3),

-- Project 4: AI Chatbot Engine
(13, 'Integrate Claude API',            'Gọi Anthropic API, xử lý streaming response',                'IN_PROGRESS', 'CRITICAL', '2026-06-18', 4),
(14, 'Build conversation history',      'Lưu lịch sử chat theo session, phân trang, tìm kiếm',        'TODO',        'HIGH',     '2026-06-28', 4),
(15, 'Rate limiting & cost control',    'Giới hạn token/request, alert khi vượt ngưỡng chi phí',      'TODO',        'MEDIUM',   '2026-07-05', 4);

-- ============================================================
-- TAGS
-- ============================================================
INSERT INTO tags (id, name, color, task_id) VALUES
-- Task 1
(1,  'backend',     '#3B82F6', 1),
(2,  'setup',       '#6B7280', 1),
-- Task 2
(3,  'backend',     '#3B82F6', 2),
(4,  'api',         '#8B5CF6', 2),
-- Task 3
(5,  'backend',     '#3B82F6', 3),
(6,  'api',         '#8B5CF6', 3),
-- Task 4
(7,  'frontend',    '#F59E0B', 4),
(8,  'ui',          '#EC4899', 4),
-- Task 5
(9,  'backend',     '#3B82F6', 5),
(10, 'ai',          '#10B981', 5),
-- Task 6
(11, 'docs',        '#6B7280', 6),
-- Task 7
(12, 'kafka',       '#EF4444', 7),
(13, 'backend',     '#3B82F6', 7),
-- Task 13
(14, 'ai',          '#10B981', 13),
(15, 'integration', '#F59E0B', 13),
-- Task 14
(16, 'backend',     '#3B82F6', 14),
(17, 'database',    '#6366F1', 14);

-- ============================================================
-- SPEC FILES
-- ============================================================
INSERT INTO spec_files (id, name, status, file_url, file_name, file_type, file_size, tag_id) VALUES
(1, 'System Parameters API Spec',   'APPROVED',  'https://storage.tendoo.ai/specs/system-params-v1.pdf',   'system-params-v1.pdf',   'application/pdf',  245760,  4),
(2, 'Project CRUD API Spec',        'APPROVED',  'https://storage.tendoo.ai/specs/projects-api-v1.pdf',    'projects-api-v1.pdf',    'application/pdf',  189440,  5),
(3, 'Command Flow Design',          'REVIEWING', 'https://storage.tendoo.ai/specs/command-flow-v2.docx',   'command-flow-v2.docx',   'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 512000, 9),
(4, 'Kafka Refactor Plan',          'DRAFT',     NULL,                                                      NULL,                     NULL,               NULL,    12),
(5, 'Claude API Integration Guide', 'APPROVED',  'https://storage.tendoo.ai/specs/claude-integration.pdf', 'claude-integration.pdf', 'application/pdf',  378880,  14),
(6, 'Chatbot History Schema',       'REVIEWING', 'https://storage.tendoo.ai/specs/chat-history-schema.md', 'chat-history-schema.md', 'text/markdown',    20480,   16);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
INSERT INTO chat_messages (id, content, role, spec_file_id) VALUES
-- Spec 1: System Parameters API
(1,  'Hãy phân tích spec này và đề xuất thiết kế database cho system_parameters.',
     'USER',      1),
(2,  'Dựa trên spec, tôi đề xuất bảng system_parameters với các cột: id, key (VARCHAR 20, UNIQUE), value (TEXT), description (TEXT), created_at, updated_at. Key phải match pattern ^[A-Z0-9_]+$ để đồng nhất với naming convention env-var.',
     'ASSISTANT', 1),
(3,  'Cần thêm bảng junction nào không để track việc key đang được dùng bởi command nào?',
     'USER',      1),
(4,  'Có, cần thêm bảng command_parameter_mappings với command_id và parameter_id. Hiện tại có thể tạo stub trước, FK sang bảng commands sẽ thêm sau khi feature Command được implement.',
     'ASSISTANT', 1),

-- Spec 3: Command Flow
(5,  'Review giúp tôi design này có thiếu edge case nào không?',
     'USER',      3),
(6,  'Design hiện tại chưa xử lý trường hợp một command tham chiếu parameter đã bị xóa. Cần thêm ON DELETE CASCADE hoặc RESTRICT tùy business rule. Ngoài ra, nên có created_at trên bảng mapping để audit.',
     'ASSISTANT', 3),
(7,  'OK, sẽ dùng CASCADE. Còn về validation thứ tự execution của các command trong flow?',
     'USER',      3),
(8,  'Cần thêm cột order_index INT NOT NULL DEFAULT 0 trên bảng flow_commands để đảm bảo thứ tự thực thi deterministic.',
     'ASSISTANT', 3),

-- Spec 5: Claude API Integration
(9,  'Streaming response từ Claude nên handle như thế nào ở BE Spring Boot?',
     'USER',      5),
(10, 'Dùng Server-Sent Events (SSE) với SseEmitter của Spring. Mỗi chunk từ Anthropic stream → emit xuống client. Cần set timeout phù hợp (>= 60s) và handle IOException khi client disconnect.',
     'ASSISTANT', 5),
(11, 'Nếu cần lưu toàn bộ response sau khi stream xong thì sao?',
     'USER',      5),
(12, 'Accumulate các chunk vào StringBuilder trong quá trình stream, sau khi nhận event [DONE] thì persist vào chat_messages với role = ASSISTANT. Dùng @Async để không block main thread.',
     'ASSISTANT', 5);

-- ============================================================
-- SYSTEM PARAMETERS
-- ============================================================
INSERT INTO system_parameters (id, `key`, value, description) VALUES
(1,  'MAX_RETRY_COUNT',     '3',                        'Số lần retry tối đa khi command thất bại'),
(2,  'TIMEOUT_SECONDS',     '30',                       'Timeout (giây) cho mỗi lần gọi API ngoài'),
(3,  'AI_MODEL',            'claude-sonnet-4-6',        'Model AI mặc định cho toàn hệ thống'),
(4,  'MAX_TOKEN_LIMIT',     '8192',                     'Giới hạn token tối đa mỗi request đến LLM'),
(5,  'SMTP_HOST',           'smtp.sendgrid.net',        'SMTP server để gửi email thông báo'),
(6,  'SMTP_PORT',           '587',                      'SMTP port (587 = STARTTLS)'),
(7,  'COST_ALERT_USD',      '50',                       'Ngưỡng chi phí (USD/ngày) để gửi cảnh báo'),
(8,  'LOG_RETENTION_DAYS',  '90',                       'Số ngày giữ log trước khi archive'),
(9,  'MAX_PROJ_PER_USER',    '20',                     'Số project tối đa một user có thể tạo'),
(10, 'FEATURE_CHAT_ENABLED', 'true',                    'Bật/tắt tính năng AI Chat toàn hệ thống');

-- ============================================================
-- COMMAND PARAMETER MAPPINGS (stub data — command_id giả)
-- Parameter 1 (MAX_RETRY_COUNT) và 2 (TIMEOUT_SECONDS) đang in-use
-- ============================================================
INSERT INTO command_parameter_mappings (id, command_id, parameter_id) VALUES
(1, 101, 1),  -- command 101 dùng MAX_RETRY_COUNT
(2, 101, 2),  -- command 101 dùng TIMEOUT_SECONDS
(3, 102, 3),  -- command 102 dùng AI_MODEL
(4, 102, 4);  -- command 102 dùng MAX_TOKEN_LIMIT

-- ============================================================
-- VERIFY (chạy để kiểm tra row counts)
-- ============================================================
-- SELECT 'users'                      AS tbl, COUNT(*) AS rows FROM users
-- UNION ALL SELECT 'projects',                COUNT(*) FROM projects
-- UNION ALL SELECT 'tasks',                   COUNT(*) FROM tasks
-- UNION ALL SELECT 'tags',                    COUNT(*) FROM tags
-- UNION ALL SELECT 'spec_files',              COUNT(*) FROM spec_files
-- UNION ALL SELECT 'chat_messages',           COUNT(*) FROM chat_messages
-- UNION ALL SELECT 'system_parameters',       COUNT(*) FROM system_parameters
-- UNION ALL SELECT 'command_parameter_mappings', COUNT(*) FROM command_parameter_mappings;
