# HONEYCHAIN REST API Reference

Base URL: `http://localhost:5000/api`

## Authentication (`/api/auth`)

### POST `/api/auth/login`
Authenticate user and receive JWT.
- **Request Body**:
  ```json
  { "email": "beekeeper@honeychain.io", "password": "password123" }
  ```
- **Response** (200 OK):
  ```json
  { "token": "<JWT_TOKEN>", "user": { "id": 1, "email": "beekeeper@honeychain.io", "role": "beekeeper" } }
  ```

---

## Hives & Passport (`/api/hives`)

### GET `/api/hives`
List all hives for authenticated user.

### GET `/api/hives/:id`
Get hive details including latest health score, Queen status, and risk level.

### GET `/api/hives/:id/passport`
Get comprehensive Digital Hive Passport including full lineage, inspection history, and acoustic stress data.

### GET `/api/hives/apiaries`
List apiaries with hive counts and regional locations.

---

## Health & Predictive Analytics (`/api/health`)

### GET `/api/health/hive/:id/analyze`
Calculate multi-signal health score from sensor telemetry, Queen health, brood frames, and acoustics.

### GET `/api/health/hive/:id/explain`
Retrieve top XAI risk drivers and SHAP contribution factors.

### GET `/api/health/hive/:id/simulate-action`
Simulate interventions (e.g. Queen replacement, Varroa treatment, supplementary feeding) and compare predicted health gains.

### GET `/api/health/hive/:id/production-impact`
Predict honey production impact and estimated yield loss risk.

---

## IoT Sensor Telemetry (`/api/sensors`)

### POST `/api/sensors/ingest`
Ingest sensor reading payload from ESP32 IoT device or simulator.
- **Request Body**:
  ```json
  {
    "hive_code": "H001",
    "temperature": 35.2,
    "humidity": 62.5,
    "weight_kg": 24.5,
    "sound_frequency_hz": 225.0,
    "bee_count_in": 120,
    "bee_count_out": 115
  }
  ```

---

## Honey Batches & Traceability (`/api/batches`)

### GET `/api/batches`
List registered honey batches.

### POST `/api/batches`
Harvest and register a new batch on the blockchain with canonical SHA-256 hash.

---

## Public Consumer Verification (`/api/verify`)

### GET `/api/verify/:batchId`
Publicly verify honey batch authenticity without authentication.
- **Response** (200 OK):
  ```json
  {
    "verification": "MATCH",
    "batch": { "batch_id": "BATCH-2026-001", "quantity_kg": 24.5, "flora_source": "Wild Forest Bloom" },
    "canonical_string": "BATCH-2026-001|H001|2026-09-10|24.50|Madikeri, Kodagu, Karnataka|Wild Forest Bloom",
    "computed_hash": "0x49683cc4650e8d99...",
    "blockchain_hash": "0x49683cc4650e8d99..."
  }
  ```

---

## Admin & KVIC Oversight (`/api/admin`)

### GET `/api/admin/metrics`
Retrieve total hive count, beekeepers, high-risk hives, and yield metrics.

### GET `/api/admin/beekeepers`
List registered beekeepers and verification status.

### GET `/api/admin/audit-logs`
Retrieve platform security and audit event logs.
