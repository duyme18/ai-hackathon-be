CREATE TABLE command_parameter_mappings (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    command_id   BIGINT NOT NULL,
    parameter_id BIGINT NOT NULL,
    CONSTRAINT fk_cpm_parameter FOREIGN KEY (parameter_id) REFERENCES system_parameters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cpm_parameter_id ON command_parameter_mappings (parameter_id);
