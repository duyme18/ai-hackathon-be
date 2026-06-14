CREATE TABLE standup_entries (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    meeting_note_id  BIGINT       NOT NULL,
    user_id          BIGINT       NOT NULL,
    member_name      VARCHAR(255) NOT NULL,
    yesterday        TEXT,
    today            TEXT,
    blocker          TEXT,
    is_auto_generated BOOLEAN     NOT NULL DEFAULT FALSE,
    source_summary   TEXT,
    jira_username    VARCHAR(100),
    github_username  VARCHAR(100),
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_standup_meeting_user (meeting_note_id, user_id),
    CONSTRAINT fk_standup_meeting FOREIGN KEY (meeting_note_id) REFERENCES meeting_notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_standup_user    FOREIGN KEY (user_id)         REFERENCES users(id)
);
