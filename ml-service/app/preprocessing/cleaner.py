from typing import Dict, Any
import numpy as np

class DataPreprocessor:
    """
    Cleans, normalizes, and handles missing sensor/inspection values
    prior to feature engineering and inference.
    """

    DEFAULT_FALLBACKS = {
        "temperature": 35.0,
        "humidity": 58.0,
        "weight": 42.0,
        "weight_delta_24h": 0.0,
        "acoustic_peak_hz": 235.0,
        "net_bee_traffic": 50,
        "ambient_temp": 26.0,
        "ambient_humidity": 60.0
    }

    def clean_telemetry(self, raw_data: Dict[str, Any]) -> Dict[str, float]:
        cleaned = {}
        for field, default_val in self.DEFAULT_FALLBACKS.items():
            val = raw_data.get(field)
            if val is None or (isinstance(val, (int, float)) and np.isnan(val)):
                cleaned[field] = float(default_val)
            else:
                try:
                    cleaned[field] = float(val)
                except (ValueError, TypeError):
                    cleaned[field] = float(default_val)

        # Realistic physiological clamping to avoid wild sensor glitch spikes
        cleaned["temperature"] = max(10.0, min(50.0, cleaned["temperature"]))
        cleaned["humidity"] = max(10.0, min(100.0, cleaned["humidity"]))
        cleaned["weight"] = max(5.0, min(120.0, cleaned["weight"]))
        cleaned["acoustic_peak_hz"] = max(50.0, min(1000.0, cleaned["acoustic_peak_hz"]))
        cleaned["net_bee_traffic"] = max(0.0, cleaned["net_bee_traffic"])

        return cleaned
