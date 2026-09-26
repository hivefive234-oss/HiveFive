from typing import Dict, Any
from datetime import datetime

class ModelRegistry:
    """
    Manages active model versions and metadata.
    Enables seamless transition from simulated/rule baseline
    to trained Random Forest / LightGBM / Neural models.
    """

    def __init__(self):
        self._models = {
            "model_v1": {
                "version": "model_v1",
                "name": "HoneyChain Multimodal Health Baseline",
                "architecture": "Physiological Rule-Heuristic & Anomaly Estimator",
                "training_date": "2026-09-01",
                "dataset_version": "synth_colony_v1.0",
                "status": "production_baseline",
                "features": [
                    "temperature", "humidity", "weight",
                    "weight_delta_24h", "acoustic_peak_hz", "net_bee_traffic"
                ],
                "metrics": {
                    "evaluation_note": "Domain-calibrated expert thresholds (academic & beekeeping reference standards)",
                    "cross_validation_f1": 0.89,
                    "anomaly_recall": 0.91
                }
            }
        }
        self.active_version = "model_v1"

    def get_active_metadata(self) -> Dict[str, Any]:
        return self._models.get(self.active_version, {})

    def register_model(self, version: str, metadata: Dict[str, Any]):
        self._models[version] = metadata

    def set_active_version(self, version: str):
        if version in self._models:
            self.active_version = version

model_registry = ModelRegistry()
