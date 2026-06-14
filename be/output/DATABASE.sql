-- ============================================================
-- Tendoo AI — Full Database Init Script
-- Tổng hợp từ Flyway V1–V8
-- Database: MariaDB 10.11+ / MySQL 8+
-- Charset: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS ai_hackathon
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ai_hackathon;

-- ------------------------------------------------------------
-- V1: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    name       VARCHAR(255) NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- V2: projects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- V3: tasks (FK → projects)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(50)  NOT NULL DEFAULT 'TODO',
    priority    VARCHAR(50)  NOT NULL DEFAULT 'MEDIUM',
    due_date    DATE,
    project_id  BIGINT       NOT NULL,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_tasks_project_id ON tasks (project_id);
CREATE INDEX idx_tasks_status ON tasks (status);

-- ------------------------------------------------------------
-- V4: tags (FK → tasks)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tags
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(20),
    task_id    BIGINT       NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_tags_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_tags_task_id ON tags (task_id);

-- ------------------------------------------------------------
-- V5: spec_files (FK → tags)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spec_files
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    status     VARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    file_url   VARCHAR(500),
    file_name  VARCHAR(255),
    file_type  VARCHAR(100),
    file_size  BIGINT,
    tag_id     BIGINT       NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_spec_files_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_spec_files_tag_id ON spec_files (tag_id);
CREATE INDEX idx_spec_files_status ON spec_files (status);

-- ------------------------------------------------------------
-- V6: chat_messages (FK → spec_files)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    content      TEXT        NOT NULL,
    role         VARCHAR(50) NOT NULL,
    spec_file_id BIGINT      NOT NULL,
    created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_chat_messages_spec_file FOREIGN KEY (spec_file_id) REFERENCES spec_files (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_chat_messages_spec_file_id ON chat_messages (spec_file_id);

-- ------------------------------------------------------------
-- V7: system_parameters
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_parameters
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key`       VARCHAR(20) NOT NULL,
    value       TEXT        NOT NULL,
    description TEXT,
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_sp_key UNIQUE (`key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_sp_key ON system_parameters (`key`);

-- ------------------------------------------------------------
-- V8: command_parameter_mappings (FK → system_parameters)
-- Stub table — sẽ thêm FK command_id khi feature Command được implement
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS command_parameter_mappings
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    command_id   BIGINT NOT NULL,
    parameter_id BIGINT NOT NULL,
    CONSTRAINT fk_cpm_parameter FOREIGN KEY (parameter_id) REFERENCES system_parameters (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_cpm_parameter_id ON command_parameter_mappings (parameter_id);

-- ============================================================
-- Enum value reference (lưu dưới dạng VARCHAR trong DB)
-- ============================================================
-- projects.status      : ACTIVE | INACTIVE | ARCHIVED
-- tasks.status         : TODO | IN_PROGRESS | DONE | CANCELLED
-- tasks.priority       : LOW | MEDIUM | HIGH | CRITICAL
-- spec_files.status    : DRAFT | REVIEWING | APPROVED | REJECTED
-- chat_messages.role   : USER | ASSISTANT | SYSTEM
-- system_parameters.key: ^[A-Z0-9_]+$ max 20 ký tự
-- ============================================================
