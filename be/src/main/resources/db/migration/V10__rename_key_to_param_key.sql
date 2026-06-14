-- V9 failed (AFTER key syntax error), so we handle it here with IF NOT EXISTS
ALTER TABLE system_parameters
    ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL AFTER `key`;

ALTER TABLE system_parameters
    CHANGE COLUMN `key` param_key VARCHAR(20) NOT NULL;
