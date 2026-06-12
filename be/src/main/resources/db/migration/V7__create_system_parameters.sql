CREATE TABLE system_parameters (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key`       VARCHAR(20)  NOT NULL,
    value       TEXT         NOT NULL,
    description TEXT,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_sp_key UNIQUE (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sp_key ON system_parameters (`key`);
