# HONEYCHAIN System Architecture & Engineering Specifications

## 1. Executive Summary & Core Paradigm
HONEYCHAIN is a predictive hive health, smart beekeeping, and honey traceability platform.
Unlike traditional disease detection software, HONEYCHAIN models colony dynamics using a 13-stage operational cycle:
```
MONITOR → ANALYZE → PREDICT → EXPLAIN → SIMULATE → RECOMMEND → ACT → MONITOR RECOVERY → HARVEST → TRACE → VERIFY
```

## 2. System Architecture Overview

```
                          [ IoT ESP32 Sensors / Simulator ]
                                       │ (HTTP POST JSON)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Node.js / Express REST API                         │
│  ├─ Auth & RBAC (JWT)                                                       │
│  ├─ Dual DB Engine (Sequelize ORM -> SQLite fallback / MySQL production)   │
│  ├─ Multi-signal Health Calculator & XAI Inference Engine                   │
│  ├─ Canonical Hash Generator (SHA-256)                                      │
│  └─ QR Code Generator                                                       │
└────────────────────────────────────────┬────────────────────────────────────┘
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
 ┌──────────────────────────────────────┐  ┌─────────────────────────────────┐
 │ Python FastAPI ML Service (Port 8000)│  │ Hardhat / Solidity Smart        │
 │  ├─ NumPy Ridge Predictive Model     │  │ Contract Ledger (Port 8545)     │
 │  ├─ SHAP Explainability Engine (XAI) │  │  ├─ HoneyChainRegistry.sol      │
 │  └─ Action Simulator                 │  │  └─ Simulated Fallback Ledger   │
 └──────────────────────────────────────┘  └─────────────────────────────────┘
                     ▲
                     │ (Axios REST Proxy)
┌────────────────────┴────────────────────────────────────────────────────────┐
│                        React + Vite + Tailwind Frontend                     │
│  ├─ Public Verification & QR Scanner                                        │
│  ├─ Beekeeper Console (11-tab Hive Detail, Multi-Signal Charts, Simulator)  │
│  └─ KVIC Admin Dashboard (Oversight, High Risk Hives, Audit Trail)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Technology Stack & Key Choices

| Tier | Primary Component | Choice & Rationale | Fallback / Resilience |
|---|---|---|---|
| **Frontend** | React 18 + Vite + TailwindCSS | High-performance SPA with responsive UI components | Built-in fallback states for offline API |
| **Backend** | Node.js + Express + Sequelize | Lightweight, asynchronous REST API layer | Dual SQLite/MySQL dialect auto-detect |
| **ML Engine** | Python 3.11 + FastAPI + Pure NumPy | High-speed inference and SHAP explainability | Embedded JavaScript fallback engine in Node.js |
| **Blockchain** | Solidity + Hardhat + Ethers.js | Immutable batch registration and canonical hashing | In-memory cryptographic SHA-256 ledger |
| **IoT** | ESP32 Firmware + Simulator | Real-time multi-signal sensor telemetry | Built-in Node.js sensor simulator script |

## 4. Cryptographic Traceability Protocol

1. **Harvest Batch Registration**:
   Canonical string constructed: `BATCH_ID|HIVE_CODE|HARVEST_DATE|QUANTITY_KG|FLORA_SOURCE|REGION`
2. **Canonical Hash Calculation**:
   SHA-256 hash computed deterministically across canonical parameters.
3. **On-Chain Immutability**:
   Hash & batch metadata registered to `HoneyChainRegistry.sol`.
4. **QR Verification**:
   Consumers scan QR or enter batch ID on `/verify/:batchId` to verify hash match between database and blockchain ledger.
