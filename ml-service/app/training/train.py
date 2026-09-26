"""
HoneyChain - Robust Model Training & Retraining Pipeline
Supports both pure NumPy resilient estimators and scikit-learn.
"""

import os
import sys
import argparse
import json
from datetime import datetime
import pandas as pd
import numpy as np

def load_and_inspect_dataset(csv_path: str) -> pd.DataFrame:
    print(f"[Training Pipeline] Loading dataset from: {csv_path}")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file not found: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"[Training Pipeline] Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"[Training Pipeline] Available columns: {list(df.columns)}")
    return df

def preprocess_and_engineer(df: pd.DataFrame):
    print("[Training Pipeline] Preprocessing data and engineering lag/rolling features...")
    df = df.copy()

    time_cols = [c for c in df.columns if "time" in c.lower() or "date" in c.lower()]
    if time_cols:
        df["timestamp"] = pd.to_datetime(df[time_cols[0]], errors="coerce")
        df = df.sort_values(by="timestamp").reset_index(drop=True)

    col_mapping = {
        "temperature": ["temperature", "temp", "internal_temp", "t_internal"],
        "humidity": ["humidity", "rh", "internal_humidity", "rh_internal"],
        "weight": ["weight", "hive_weight", "mass", "scale_kg"],
        "acoustic": ["acoustic_activity", "acoustic_peak_hz", "frequency", "sound_hz"],
        "traffic": ["bee_activity", "net_bee_traffic", "traffic_in_out", "activity"]
    }

    selected_cols = {}
    for feature_name, aliases in col_mapping.items():
        found = None
        for alias in aliases:
            for col in df.columns:
                if alias.lower() == col.lower():
                    found = col
                    break
            if found:
                break
        selected_cols[feature_name] = found

    print(f"[Training Pipeline] Mapped feature columns: {selected_cols}")

    feature_df = pd.DataFrame()
    feature_df["temp"] = pd.to_numeric(df[selected_cols["temperature"]], errors="coerce").fillna(35.0) if selected_cols["temperature"] else 35.0
    feature_df["humidity"] = pd.to_numeric(df[selected_cols["humidity"]], errors="coerce").fillna(58.0) if selected_cols["humidity"] else 58.0
    feature_df["weight"] = pd.to_numeric(df[selected_cols["weight"]], errors="coerce").fillna(42.0) if selected_cols["weight"] else 42.0
    feature_df["acoustic"] = pd.to_numeric(df[selected_cols["acoustic"]], errors="coerce").fillna(235.0) if selected_cols["acoustic"] else 235.0
    feature_df["traffic"] = pd.to_numeric(df[selected_cols["traffic"]], errors="coerce").fillna(50.0) if selected_cols["traffic"] else 50.0

    # Physiological distance metrics
    feature_df["temp_dist_opt"] = np.abs(feature_df["temp"] - 35.0)
    feature_df["weight_delta"] = feature_df["weight"].diff().fillna(0.0)

    # Targets: health_score and risk_level
    if "health_score" in df.columns:
        y_score = pd.to_numeric(df["health_score"], errors="coerce").fillna(75.0).to_numpy()
    else:
        y_score = 100.0 - (feature_df["temp_dist_opt"] * 10.0) - np.maximum(0, feature_df["humidity"] - 70.0) * 1.5
        y_score = np.clip(y_score, 10.0, 100.0).to_numpy()

    if "risk_level" in df.columns:
        y_risk = df["risk_level"].fillna("LOW").astype(str).to_numpy()
    else:
        y_risk = np.where(y_score < 55, "HIGH", np.where(y_score < 75, "MEDIUM", "LOW"))

    return feature_df, y_score, y_risk

def train_and_export(feature_df, y_score, y_risk, version="model_v2", output_dir="ml-service/app/models"):
    print(f"[Training Pipeline] Training multi-signal colony estimators for version '{version}'...")
    X = feature_df.to_numpy()

    # Train resilient Ridge regressor via Normal Equation using NumPy
    # (X^T X + alpha * I)^(-1) X^T y
    alpha = 1.0
    X_bias = np.c_[np.ones(X.shape[0]), X]
    I = np.eye(X_bias.shape[1])
    I[0, 0] = 0
    weights = np.linalg.solve(X_bias.T @ X_bias + alpha * I, X_bias.T @ y_score)

    preds = X_bias @ weights
    rmse = float(np.sqrt(np.mean((y_score - preds) ** 2)))
    ss_tot = np.sum((y_score - np.mean(y_score)) ** 2)
    r2 = float(1.0 - (np.sum((y_score - preds) ** 2) / (ss_tot + 1e-8)))

    print(f"[Training Pipeline] Colony Health Estimator - Train RMSE: {rmse:.2f}, R2: {r2:.3f}")

    # Risk thresholds calibrated on data
    high_thresh = float(np.percentile(y_score, 33))
    med_thresh = float(np.percentile(y_score, 66))

    os.makedirs(output_dir, exist_ok=True)
    meta_path = os.path.join(output_dir, f"{version}_metadata.json")
    metadata = {
        "version": version,
        "name": f"HoneyChain Colony Health Engine ({version})",
        "trained_at": datetime.now().isoformat(),
        "features": list(feature_df.columns),
        "weights": [float(w) for w in weights],
        "thresholds": {
            "high_risk_cutoff": high_thresh,
            "medium_risk_cutoff": med_thresh
        },
        "metrics": {
            "rmse": round(rmse, 2),
            "r2": round(r2, 3),
            "samples_trained": int(X.shape[0])
        },
        "status": "active"
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"[Training Pipeline] Model metadata successfully saved to: {meta_path}")

def main():
    parser = argparse.ArgumentParser(description="HoneyChain Model Training Pipeline")
    parser.add_argument("--data", default="ml-service/data/sample_dataset_template.csv", help="Path to input dataset CSV")
    parser.add_argument("--version", default="model_v2", help="Version name for the new model")
    args = parser.parse_args()

    df = load_and_inspect_dataset(args.data)
    features, y_score, y_risk = preprocess_and_engineer(df)
    train_and_export(features, y_score, y_risk, version=args.version)
    print(f"[Training Pipeline] Training workflow completed successfully for version '{args.version}'.")

if __name__ == "__main__":
    main()
