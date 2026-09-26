---
name: honeychain
description: >-
  Comprehensive guide, operational workflow, REST API endpoints, ML retraining pipeline,
  and troubleshooting runbook for the HONEYCHAIN Smart Beekeeping & Blockchain Honey Traceability Platform.
---

# HONEYCHAIN - Smart Beekeeping & Traceability Skill Guide

## System Overview
HONEYCHAIN is a production-grade predictive hive health, IoT telemetry monitoring, and blockchain honey batch traceability platform built on a 13-stage operational cycle:

`MONITOR → ANALYZE → PREDICT → EXPLAIN → SIMULATE → RECOMMEND → ACT → MONITOR RECOVERY → HARVEST → TRACE → VERIFY`

---

## Architecture & Ports Quick Reference

Component | Technology Stack | Port | Base URL / Command
:--- | :--- | :--- | :---
**Web Application (Frontend)** | React 18 + Vite + TailwindCSS | 5173 | `http://localhost:5173`
**Express Backend API** | Node.js + Express + Sequelize | 5000 | `http://localhost:5000`
**ML Inference & Training** | Python 3.11 + FastAPI + NumPy | 8000 | `http://127.0.0.1:8000`
**Blockchain Ledger** | Hardhat + Solidity (`HoneyChainRegistry.sol`) | 8545 | In-Memory SHA-256 Fallback
**Database** | Dual SQLite (`honeychain.sqlite`) / MySQL | N/A | `database/honeychain.sqlite`

---

## Operational Runbook & Commands

### 1. Start Services
- **Backend API**:
  ```bash
  cd backend && node server.js
  ```
- **ML FastAPI Service**:
  ```bash
  cd ml-service && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
  ```
- **Vite Web Frontend**:
  ```bash
  cd frontend && npx vite --host
  ```

### 2. Retrain ML Model on Custom Dataset CSV
```bash
python ml-service/app/training/train.py --data path/to/dataset.csv --version model_v2
```
*Or via API:* Send `POST /train` with multipart form data CSV to `http://127.0.0.1:8000/train`.

### 3. Check ML Model Accuracy & Metadata
```bash
curl http://localhost:5000/api/health/model-info
```

### 4. Database Inspection (SQLite)
- Database File: `database/honeychain.sqlite`
- Inspection Tool: DB Browser for SQLite or VS Code SQLite extension.

---

## 13-Stage Lifecycle Flow

1. **MONITOR**: SensorReadings (Temp 32–36°C, RH 50–70%, Weight, Acoustics 200–250Hz, Bee Traffic).
2. **ANALYZE**: Multi-signal health score calculation (0–100 scale).
3. **PREDICT**: Time-to-risk trajectory forecasting (3–7 day risk window).
4. **EXPLAIN**: 5-point transparent XAI factor breakdown.
5. **SIMULATE**: Action Simulator comparing health gain vs cost across 4 intervention options.
6. **RECOMMEND**: Domain-guided non-chemical action advice.
7. **ACT**: Beekeeper field intervention logging (`BeekeeperAction`).
8. **RECOVERY**: Longitudinal outcome tracking (`RecoveryRecord`).
9. **PASSPORT**: Digital Hive Passport storing full lineage and inspection history.
10. **HARVEST**: Honey batch extraction registration (`HoneyBatch`).
11. **TRACE**: SHA-256 canonical hash generation.
12. **BLOCKCHAIN**: EIP smart contract recordation (`HoneyChainRegistry.sol`).
13. **VERIFY**: Public consumer QR verification at `/verify/:batchId`.

---

## Pre-Seeded Accounts

Role | Email | Password | URL Path
:--- | :--- | :--- | :---
**Beekeeper** | `beekeeper@honeychain.io` | `password123` | `/dashboard`
**KVIC Admin** | `admin@kvic.gov.in` | `admin123` | `/admin`
**Public Consumer** | Public Access | None | `/verify/BATCH-2026-001`
