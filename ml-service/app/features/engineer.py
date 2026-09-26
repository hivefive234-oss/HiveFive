from typing import Dict, Any

class FeatureEngineer:
    """
    Extracts high-level time-series and physiological features
    from cleaned multi-sensor telemetry.
    """

    def extract_features(self, cleaned_data: Dict[str, float]) -> Dict[str, float]:
        temp = cleaned_data["temperature"]
        hum = cleaned_data["humidity"]
        weight = cleaned_data["weight"]
        weight_delta = cleaned_data["weight_delta_24h"]
        acoustic = cleaned_data["acoustic_peak_hz"]
        traffic = cleaned_data["net_bee_traffic"]

        # 1. Thermal stability deficit (distance from 35.0°C optimum brood temperature)
        temp_deviation = abs(temp - 35.0)

        # 2. Humidity stress index (>70% or <45%)
        hum_stress = 0.0
        if hum > 70.0:
            hum_stress = (hum - 70.0) / 10.0
        elif hum < 45.0:
            hum_stress = (45.0 - hum) / 10.0

        # 3. Foraging activity vigor index
        activity_vigor = min(1.0, traffic / 60.0)

        # 4. Acoustic agitation index (>260Hz indicates agitated buzzing, >300Hz high agitation)
        acoustic_stress = max(0.0, (acoustic - 250.0) / 50.0)

        # 5. Weight change momentum (negative indicates loss, e.g. starving/robbing)
        weight_loss_rate = max(0.0, -weight_delta)

        return {
            "temp_deviation": temp_deviation,
            "hum_stress": hum_stress,
            "activity_vigor": activity_vigor,
            "acoustic_stress": acoustic_stress,
            "weight_loss_rate": weight_loss_rate,
            "raw_temp": temp,
            "raw_hum": hum,
            "raw_weight": weight,
            "raw_weight_delta": weight_delta,
            "raw_acoustic": acoustic,
            "raw_traffic": traffic
        }
