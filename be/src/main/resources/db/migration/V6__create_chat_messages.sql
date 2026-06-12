CREATE TABLE IF NOT EXISTS chat_messages
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    content      TEXT        NOT NULL,
    role         VARCHAR(50) NOT NULL,
    spec_file_id BIGINT      NOT NULL,
    created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (spec_file_id) REFERENCES spec_files (id) ON DELETE CASCADE
);
