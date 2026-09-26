# HONEYCHAIN Demo & Testing Guide

## 1. Quick Start

### Start Backend Service
```bash
cd backend
npm start
```
*Runs on `http://localhost:5000` with SQLite database automatically populated with 5 demo hives (H001-H005) and 1 verified honey batch (`BATCH-2026-001`).*

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
*Access the Web Application UI at `http://localhost:5173`.*

---

## 2. Pre-Seeded Accounts

| Role | Email | Password | Purpose |
|---|---|---|---|
| **Beekeeper** | `beekeeper@honeychain.io` | `password123` | Hive health monitoring, action recording, batch creation |
| **KVIC Admin** | `admin@kvic.gov.in` | `admin123` | Regional analytics, high-risk alerts, audit logs |
| **Consumer** | Public Access | None Required | Public QR code verification at `/verify/BATCH-2026-001` |

---

## 3. Demo Walkthrough Scenarios

### Scenario A: Predictive Risk & Explainability (Hive H001 / H004)
1. Log in as `beekeeper@honeychain.io` (or click "Switch Role: Beekeeper" in top navbar).
2. Navigate to **Hives** → Select **H004** (High Risk).
3. Observe the **11-Tab Hive Detail Console**:
   - View multi-signal health score.
   - Click **XAI Explainability** tab to inspect top risk drivers (e.g. Varroa mite infestation, temperature drops).
   - Click **Action Simulator** tab to compare predicted health gains for different management options.

### Scenario B: IoT Telemetry Simulation
1. Click **IoT Simulator** in the top navigation bar.
2. Select target hive `H004` and trigger abnormal telemetry (e.g. sudden weight drop or high frequency sound).
3. Observe live dashboard graph updating in real time.

### Scenario C: Honey Batch Traceability & Public QR Verification
1. Navigate to **Honey Batches** page.
2. Click **📱 QR Code** on batch `BATCH-2026-001`.
3. Click **✅ Verify** or navigate directly to `http://localhost:5173/verify/BATCH-2026-001`.
4. Verify the **MATCH** badge, cryptographic SHA-256 hash breakdown, and chain-of-custody timeline.

---

## 4. Optional Services

- **Hardhat Blockchain Node**: `cd blockchain && npx hardhat node`
- **FastAPI ML Service**: `cd ml-service && uvicorn app.main:app --port 8000`
*(Note: HONEYCHAIN automatically runs with built-in fallbacks if optional services are offline.)*
