/# Database Design: System Parameters

**Migration files:** `V7__create_system_parameters.sql`, `V8__create_command_parameter_mappings.sql`
**Database:** MariaDB 10.11+ / MySQL 8+
**Migration tool:** Flyway

---

## Entity Relationship Diagram

```
┌─────────────────────────────────┐
│         system_parameters       │
├─────────────────────────────────┤
│ PK  id          BIGINT          │
│     key         VARCHAR(20)     │◄──┐
│     value       TEXT            │   │
│     description TEXT            │   │
│     created_at  DATETIME(6)     │   │  FK
│     updated_at  DATETIME(6)     │   │
└─────────────────────────────────┘   │
                                      │
┌──────────────────────────────────┐  │
│   command_parameter_mappings     │  │
├──────────────────────────────────┤  │
│ PK  id          BIGINT           │  │
│     command_id  BIGINT           │  │
│ FK  parameter_id BIGINT          │──┘
└──────────────────────────────────┘
```

**Relationship:** One `system_parameters` record → many `command_parameter_mappings` records (one-to-many).

---

## Table: `system_parameters`

**Purpose:** Stores key-value configuration parameters used by commands at runtime. Allows administrators to change system behavior without modifying code.

### Schema

| Column | Data Type | Nullable | Default | Constraints | Description |
|--------|-----------|----------|---------|-------------|-------------|
| `id` | `BIGINT` | No | AUTO_INCREMENT | PRIMARY KEY | Surrogate primary key |
| `key` | `VARCHAR(20)` | No | — | UNIQUE, NOT NULL | Parameter identifier. Pattern: `^[A-Z0-9_]+$` |
| `value` | `TEXT` | No | — | NOT NULL | Parameter value; no format restriction |
| `description` | `TEXT` | Yes | NULL | — | Human-readable description; optional |
| `created_at` | `DATETIME(6)` | No | `CURRENT_TIMESTAMP(6)` | NOT NULL | Record creation timestamp (microsecond precision) |
| `updated_at` | `DATETIME(6)` | No | `CURRENT_TIMESTAMP(6)` | NOT NULL, `ON UPDATE CURRENT_TIMESTAMP(6)` | Last modification timestamp |

### DDL

```sql
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
```

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `PRIMARY` | `id` | UNIQUE | Primary key lookup |
| `uq_sp_key` | `key` | UNIQUE | Enforce key uniqueness; fast lookup by key name |
| `idx_sp_key` | `key` | INDEX | Covered by unique constraint; explicit for clarity |

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| `key` as `VARCHAR(20)` | Business rule: max 20 chars; fixed-width VARCHAR is more efficient than TEXT for indexed columns |
| `value` as `TEXT` | No length restriction per spec (BR-004); TEXT avoids silent truncation |
| `key` must be UPPERCASE only | Convention aligns with standard env-var naming (e.g., `SMTP_HOST`, `MAX_RETRY`) and prevents case-sensitivity confusion |
| No `created_by` / `updated_by` | Current project pattern does not include audit user columns; can be added later without breaking existing data |
| `utf8mb4` charset | Full Unicode support including emoji and special characters in `value` and `description` |
| `DATETIME(6)` for timestamps | Microsecond precision aligns with other tables in the schema (V1–V6) |

---

## Table: `command_parameter_mappings`

**Purpose:** Tracks which system parameters are referenced (used) by which commands. This is a junction table enabling the "in-use" business rule: a parameter cannot be edited or deleted if it appears in this table.

> **Note:** This table is currently a stub (V8 migration). It will be populated when the "Command" feature is implemented. Until then, all `in-use` checks return `false`.

### Schema

| Column | Data Type | Nullable | Default | Constraints | Description |
|--------|-----------|----------|---------|-------------|-------------|
| `id` | `BIGINT` | No | AUTO_INCREMENT | PRIMARY KEY | Surrogate primary key |
| `command_id` | `BIGINT` | No | — | NOT NULL | FK to commands table (not yet created) |
| `parameter_id` | `BIGINT` | No | — | NOT NULL, FK | FK to `system_parameters.id` |

### DDL

```sql
CREATE TABLE command_parameter_mappings (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    command_id   BIGINT NOT NULL,
    parameter_id BIGINT NOT NULL,
    CONSTRAINT fk_cpm_parameter FOREIGN KEY (parameter_id) REFERENCES system_parameters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cpm_parameter_id ON command_parameter_mappings (parameter_id);
```

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `PRIMARY` | `id` | UNIQUE | Primary key lookup |
| `idx_cpm_parameter_id` | `parameter_id` | INDEX | Fast `in-use` check query: `WHERE parameter_id = ?` |

### Foreign Keys

| Constraint | Column | References | On Delete |
|------------|--------|------------|-----------|
| `fk_cpm_parameter` | `parameter_id` | `system_parameters(id)` | CASCADE |

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| `ON DELETE CASCADE` on parameter FK | If a parameter is deleted, its mapping records are automatically removed; prevents orphaned rows |
| Index on `parameter_id` | The primary query pattern is `WHERE parameter_id = ?` (in-use check); index makes this O(log n) |
| No `command_id` FK yet | `commands` table doesn't exist yet; FK will be added in a future migration once the Command feature is implemented |

---

## Migration History

| Version | File | Description |
|---------|------|-------------|
| V1 | `V1__init_users.sql` | Create `users` table |
| V2 | `V2__create_projects.sql` | Create `projects` table |
| V3 | `V3__create_tasks.sql` | Create `tasks` table |
| V4 | `V4__create_tags.sql` | Create `tags` table |
| V5 | `V5__create_spec_files.sql` | Create `spec_files` table |
| V6 | `V6__create_chat_messages.sql` | Create `chat_messages` table |
| **V7** | `V7__create_system_parameters.sql` | **Create `system_parameters` table** |
| **V8** | `V8__create_command_parameter_mappings.sql` | **Create stub `command_parameter_mappings` table** |

---

## Query Patterns

### List with keyword search and pagination

```sql
SELECT *
FROM system_parameters
WHERE (:keyword IS NULL OR :keyword = ''
       OR LOWER(`key`) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(description) LIKE LOWER(CONCAT('%', :keyword, '%')))
ORDER BY created_at DESC
LIMIT :size OFFSET :offset;
```

### Check if parameter is in use

```sql
SELECT COUNT(*) > 0
FROM command_parameter_mappings
WHERE parameter_id = :parameterId;
```

### Check key uniqueness (before insert/update)

```sql
SELECT COUNT(*) > 0
FROM system_parameters
WHERE LOWER(`key`) = LOWER(:key);
```
