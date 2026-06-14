CREATE TABLE meeting_notes (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    note_date   DATE         NOT NULL,
    confluence_page_id  VARCHAR(200),
    confluence_page_url VARCHAR(1000),
    status      VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_meeting_notes_date (note_date)
);
