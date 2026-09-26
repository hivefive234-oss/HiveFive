# HONEYCHAIN - Multimodal Machine Learning Service

## 1. Overview
The **HoneyChain ML Service** provides continuous colony-level health intelligence, risk trajectory forecasting, explainable decision-support (XAI), action simulations, and production yield impact estimation.

Built with **Python 3.11** and **FastAPI**, it is decoupled from the frontend and backend through standard REST contracts.

---

## 2. Scientific Principles & Safety Rules
1. **Decision Support, Not Absolute Diagnosis**: Models estimate risk probabilities and trajectories based on multi-sensor and visual anomalies. They do not claim biological or veterinary certainty.
2. **Colony-Level Dynamics**: The system monitors overall hive thermo-regulation, humidity retention, acoustic spectrum, and foraging traffic rather than tracking individual bees.
3. **Transparent Uncertainty**: All outputs report confidence intervals and estimated time windows (e.g. `3–7 days`, `confidence: 0.76`).
4. **Non-Chemical Interventions**: Action simulations emphasize physical inspection, ventilation management, and supplemental feeding before any chemical treatments.

---

## 3. Future Real Dataset Integration Guide

When you obtain your real field dataset:
**DO NOT rebuild or alter the frontend or backend!** Only execute the following steps in this `/ml-service` directory:

### Step 1: Save Dataset
Place your CSV file in:
```
ml-service/data/real_beekeeping_dataset.csv
```

### Step 2: Inspect Columns
The training pipeline automatically maps common column names:
- Temperature: `temperature`, `temp`, `internal_temp`, `t_internal`
- Humidity: `humidity`, `rh`, `internal_humidity`
- Weight: `weight`, `hive_weight`, `scale_kg`
- Acoustics: `acoustic_activity`, `acoustic_peak_hz`, `sound_hz`
- Traffic: `bee_activity`, `net_bee_traffic`, `traffic_in_out`
- Targets: `health_score`, `risk_level` (synthesized if missing)

### Step 3: Run Training Pipeline
Execute:
```bash
python ml-service/app/training/train.py --data ml-service/data/real_beekeeping_dataset.csv --version model_v2
```

The script will:
1. Handle missing values and clamp sensor outliers.
2. Extract time-series delta rates, rolling variance, and thermal stability indices.
3. Train Random Forest / LightGBM Regressors and Classifiers.
4. Evaluate cross-validation RMSE, R², Precision, and Recall.
5. Save the trained artifact bundle `ml-service/app/models/model_v2_bundle.joblib` and `model_v2_metadata.json`.

### Step 4: Activate Model Version
Set the environment variable in `backend/.env` or shell:
```bash
MODEL_VERSION=model_v2
ML_MODE=trained
```
Restart the FastAPI service. The entire platform (Frontend, Backend, IoT simulator) will immediately reflect the newly trained model!

---

## 4. API Endpoints
- `GET  /health` - Service health status
- `GET  /model/metadata` - Model name, version, training date, evaluation metrics
- `POST /predict/health` - Colony health score (0–100) & risk level (LOW/MEDIUM/HIGH)
- `POST /predict/trajectory` - Time-to-risk estimate window & projected trajectory points
- `POST /predict/production-impact` - Expected vs estimated honey yield & potential loss
- `POST /explain` - 5-point Explainable AI breakdown
- `POST /simulate-action` - Decision-support simulation comparing 4 intervention choices
