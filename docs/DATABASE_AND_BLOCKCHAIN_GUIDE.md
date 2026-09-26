# HONEYCHAIN Database Connection & Blockchain Operational Guide

## 1. How to Connect to & Inspect the SQLite Database

HONEYCHAIN uses SQLite as its default zero-configuration database engine located at:
`c:\Users\balaj\OneDrive\Desktop\Hivefive\database\honeychain.sqlite`

### Option A: DB Browser for SQLite (GUI Tool)
1. Download and install **DB Browser for SQLite** from [sqlitebrowser.org](https://sqlitebrowser.org/).
2. Open DB Browser for SQLite → Click **Open Database**.
3. Select `c:\Users\balaj\OneDrive\Desktop\Hivefive\database\honeychain.sqlite`.
4. Navigate to **Browse Data** tab to inspect all 21 tables (`Users`, `Hives`, `SensorReadings`, `HoneyBatches`, `BlockchainRecords`, `AuditLogs`, etc.).

### Option B: VS Code Extension (SQLite Viewer)
1. Install **SQLite Viewer** or **vscode-sqlite** extension in VS Code.
2. Right-click `database/honeychain.sqlite` in file explorer → Select **Open Database**.
3. View tables directly inside your IDE.

### Option C: Node.js Database Inspection Script
You can query the database directly via Node.js from terminal:
```bash
node -e "const { Hive, HoneyBatch } = require('./backend/models'); (async () => { console.log('Total Hives:', await Hive.count()); console.log('Batches:', await HoneyBatch.findAll({ raw: true })); })();"
```

---

## 2. Dual-Dialect Database Engine (SQLite / MySQL)

The backend database configuration (`backend/config/database.js`) dynamically switches between SQLite (local development) and MySQL (production deployment):

- **Local Mode (Default)**: Uses `sqlite3` dialect and stores data in `database/honeychain.sqlite`.
- **Production Mode**: If `DB_DIALECT=mysql` is set in `backend/.env`, Sequelize connects to MySQL on port 3306 without requiring any code changes.

---

## 3. Blockchain Operational Logic & Assumptions

HONEYCHAIN implements a dual-mode blockchain traceability system:

### A. Real Hardhat Smart Contract Mode
- **Contract**: `blockchain/contracts/HoneyChainRegistry.sol`
- When Hardhat node is running (`npx hardhat node` on port 8545), `blockchainService.js` connects via Ethers.js and records transactions on-chain.

### B. In-Memory SHA-256 Simulated Ledger Mode (Default Fallback)
- If Hardhat RPC node is not running, `blockchainService.js` automatically uses a deterministic in-memory cryptographic ledger.
- **Canonical Hash Formula**:
  `SHA-256( BATCH_ID | HIVE_CODE | HARVEST_DATE | QUANTITY_KG | REGION | FLORA_SOURCE | MOISTURE % )`
- **Verification Guarantee**: Even without a live blockchain node, the SHA-256 canonical hash stored in the database guarantees 100% cryptographic tamper-detection on the consumer verification page (`/verify/:batchId`).

---

## 4. ML Model Training & Default Physiological Assumptions

### Physiological Baseline Assumptions (Before Training)
Before custom historical datasets are uploaded, the system evaluates hive health using benchmark physiological parameters based on entomological research:
- **Optimal Internal Hive Temperature**: 32.0°C – 36.0°C (Core brood nest thermal regulation)
- **Optimal Humidity**: 50.0% – 70.0%
- **Acoustic Frequency Baseline**: 200 Hz – 250 Hz (Normal flight/fanning activity)
- **Swarming Frequency Shift**: Frequency spike > 300 Hz indicates swarming preparation
- **Queenlessness Shift**: Frequency drop < 150 Hz with irregular acoustic pattern indicates queen failure

### Training Custom Datasets
When you supply your own dataset CSV, run:
```bash
python ml-service/app/training/train.py --data path/to/your_dataset.csv
```
Or use the REST API endpoint: `POST /api/health/retrain` with your CSV file.
The pipeline automatically cleans missing values, engineers features, trains the Ridge Regression model, evaluates accuracy ($R^2$ score and MAE), updates `model_v2.json`, and updates model metadata.
