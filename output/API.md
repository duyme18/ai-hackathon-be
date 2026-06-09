# API Documentation: System Parameters

**Base URL:** `http://localhost:8080/api/v1/system-parameters`
**Authentication:** Bearer JWT token required on all endpoints (`Authorization: Bearer <token>`)
**Swagger UI:** `http://localhost:8080/swagger-ui.html` → group **System Parameters**

---

## Response Format

All responses follow a consistent wrapper:

```json
{
  "status": 200,
  "message": "Success",
  "data": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `int` | HTTP status code |
| `message` | `string` | Human-readable result message |
| `data` | `any \| null` | Response payload; `null` on error |

---

## Endpoints

---

### 1. List System Parameters

**`GET /api/v1/system-parameters`**

Returns a paginated list of system parameters. Optionally filters by keyword (matched against both `key` and `description`, case-insensitive, OR condition).

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `keyword` | `string` | No | — | Filter: key OR description contains keyword |
| `page` | `int` | No | `0` | Page index (0-based) |
| `size` | `int` | No | `20` | Page size |

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 1,
        "key": "MAX_RETRY_COUNT",
        "value": "3",
        "description": "Maximum number of retries for failed commands",
        "createdAt": "2026-06-09T10:00:00",
        "updatedAt": "2026-06-09T10:00:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "number": 0,
    "size": 20,
    "first": true,
    "last": true
  }
}
```

#### Example

```bash
# All parameters
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/v1/system-parameters"

# Search by keyword, page 0, size 10
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/v1/system-parameters?keyword=RETRY&page=0&size=10"
```

---

### 2. Get System Parameter by ID

**`GET /api/v1/system-parameters/{id}`**

Returns the detail of a single system parameter.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `long` | System parameter ID |

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "key": "MAX_RETRY_COUNT",
    "value": "3",
    "description": "Maximum number of retries for failed commands",
    "createdAt": "2026-06-09T10:00:00",
    "updatedAt": "2026-06-09T10:00:00"
  }
}
```

#### Error Responses

| Status | Code | Message |
|--------|------|---------|
| `404 Not Found` | — | `"System parameter not found"` |
| `401 Unauthorized` | — | `"Authentication required"` |

#### Example

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/v1/system-parameters/1"
```

---

### 3. Create System Parameter

**`POST /api/v1/system-parameters`**

Creates a new system parameter. `key` must be unique, uppercase letters / digits / underscores only, max 20 characters.

#### Request Body

```json
{
  "key": "MAX_RETRY_COUNT",
  "value": "3",
  "description": "Maximum number of retries for failed commands"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `key` | `string` | Yes | `^[A-Z0-9_]+$`, max 20 chars, unique |
| `value` | `string` | Yes | Non-empty, no format restriction |
| `description` | `string` | No | No restriction |

#### Response `201 Created`

```json
{
  "status": 201,
  "message": "Created",
  "data": {
    "id": 1,
    "key": "MAX_RETRY_COUNT",
    "value": "3",
    "description": "Maximum number of retries for failed commands",
    "createdAt": "2026-06-09T10:00:00",
    "updatedAt": "2026-06-09T10:00:00"
  }
}
```

#### Error Responses

| Status | Condition | Message |
|--------|-----------|---------|
| `400 Bad Request` | Validation failure (blank key/value, invalid format, key > 20 chars) | Constraint message |
| `409 Conflict` | `key` already exists | `"System parameter key already exists"` |
| `401 Unauthorized` | Missing/invalid JWT | `"Authentication required"` |

#### Example

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key":"MAX_RETRY_COUNT","value":"3","description":"Max retries"}' \
  "http://localhost:8080/api/v1/system-parameters"
```

---

### 4. Update System Parameter

**`PUT /api/v1/system-parameters/{id}`**

Updates an existing system parameter. **Not allowed if the parameter is currently referenced by any command.**

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `long` | System parameter ID |

#### Request Body

Same as Create: `key`, `value` (required), `description` (optional).

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "key": "MAX_RETRY_COUNT",
    "value": "5",
    "description": "Updated max retries",
    "createdAt": "2026-06-09T10:00:00",
    "updatedAt": "2026-06-09T11:00:00"
  }
}
```

#### Error Responses

| Status | Condition | Message |
|--------|-----------|---------|
| `400 Bad Request` | Validation failure | Constraint message |
| `404 Not Found` | Parameter does not exist | `"System parameter not found"` |
| `409 Conflict` | Parameter is currently in use | `"System parameter is in use and cannot be modified"` |
| `401 Unauthorized` | Missing/invalid JWT | `"Authentication required"` |

#### Example

```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key":"MAX_RETRY_COUNT","value":"5"}' \
  "http://localhost:8080/api/v1/system-parameters/1"
```

---

### 5. Delete System Parameter

**`DELETE /api/v1/system-parameters/{id}`**

Permanently deletes a system parameter. **Not allowed if the parameter is currently referenced by any command.**

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `long` | System parameter ID |

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "Success",
  "data": null
}
```

#### Error Responses

| Status | Condition | Message |
|--------|-----------|---------|
| `404 Not Found` | Parameter does not exist | `"System parameter not found"` |
| `409 Conflict` | Parameter is currently in use | `"System parameter is in use and cannot be modified"` |
| `401 Unauthorized` | Missing/invalid JWT | `"Authentication required"` |

#### Example

```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/v1/system-parameters/1"
```

---

### 6. Check If System Parameter Is In Use

**`GET /api/v1/system-parameters/{id}/in-use`**

Checks whether a system parameter is currently referenced by at least one command. This endpoint is called before showing the Edit or Delete UI to prevent invalid operations.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `long` | System parameter ID |

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "inUse": false
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `inUse` | `boolean` | `true` if referenced by ≥ 1 command; `false` otherwise |

#### Error Responses

| Status | Condition | Message |
|--------|-----------|---------|
| `404 Not Found` | Parameter does not exist | `"System parameter not found"` |
| `401 Unauthorized` | Missing/invalid JWT | `"Authentication required"` |

#### Example

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/v1/system-parameters/1/in-use"
```

---

## Error Code Reference

| HTTP Status | Message | When |
|-------------|---------|------|
| `400 Bad Request` | Validation message | Invalid `key` format, missing required fields |
| `401 Unauthorized` | `"Authentication required"` | Missing or expired JWT |
| `404 Not Found` | `"System parameter not found"` | ID does not exist |
| `409 Conflict` | `"System parameter key already exists"` | Duplicate `key` on create |
| `409 Conflict` | `"System parameter is in use and cannot be modified"` | Edit/delete while in use |

---

## Business Rules

| Rule | Description |
|------|-------------|
| BR-001 | Search is case-insensitive, matches `key` OR `description` (OR condition) |
| BR-002 | `key` must match `^[A-Z0-9_]+$` (uppercase, digits, underscore only) |
| BR-003 | `key` max 20 characters |
| BR-004 | `key` must be unique across all system parameters |
| BR-005 | `value` is required; no format restriction |
| BR-006 | Cannot edit a parameter referenced by ≥ 1 command |
| BR-007 | Cannot delete a parameter referenced by ≥ 1 command |
