from typing import Dict, Any, List
from ..preprocessing.cleaner import DataPreprocessor
from ..features.engineer import FeatureEngineer
from ..models.registry import model_registry

class ColonyPredictor:
    def __init__(self):
        self.cleaner = DataPreprocessor()
        self.engineer = FeatureEngineer()

    def predict_health(self, raw_input: Dict[str, Any]) -> Dict[str, Any]:
        cleaned = self.cleaner.clean_telemetry(raw_input)
        features = self.engineer.extract_features(cleaned)

        score = 95.0
        factors: List[str] = []

        # Temperature dysregulation
        if features["temp_deviation"] > 1.5:
            penalty = min(35.0, features["temp_deviation"] * 9.0)
            score -= penalty
            factors.append(
                f"Brood nest temperature dysregulation ({cleaned['temperature']:.1f}°C vs optimal 34.5–35.5°C)"
            )

        # Humidity stress
        if features["hum_stress"] > 0:
            penalty = min(25.0, features["hum_stress"] * 15.0)
            score -= penalty
            if cleaned["humidity"] > 70.0:
                factors.append(f"Elevated internal humidity ({cleaned['humidity']:.1f}% RH, risk of condensation)")
            else:
                factors.append(f"Low internal humidity ({cleaned['humidity']:.1f}% RH)")

        # Weight loss penalty
        if features["weight_loss_rate"] > 0.4:
            penalty = min(25.0, features["weight_loss_rate"] * 18.0)
            score -= penalty
            factors.append(
                f"Rapid daily weight decline ({cleaned['weight_delta_24h']:.2f} kg/24h, possible resource depletion)"
            )

        # Acoustic distress
        if features["acoustic_stress"] > 0.8:
            penalty = min(20.0, features["acoustic_stress"] * 12.0)
            score -= penalty
            factors.append(
                f"Elevated acoustic agitation ({cleaned['acoustic_peak_hz']:.0f} Hz peak, possible distress hum)"
            )

        # Activity vigor
        if features["activity_vigor"] < 0.35:
            score -= 10.0
            factors.append(
                f"Subdued entrance flight activity ({cleaned['net_bee_traffic']:.0f} flights/min)"
            )

        score = max(10.0, min(100.0, round(score, 1)))

        risk_level = "LOW"
        trend = "STABLE"

        if score < 55.0:
            risk_level = "HIGH"
            trend = "DECLINING"
        elif score < 75.0:
            risk_level = "MEDIUM"
            trend = "DECLINING"
        elif score >= 88.0:
            trend = "IMPROVING"

        if not factors:
            factors.append("Multi-sensor telemetry aligns with healthy reference thresholds.")

        metadata = model_registry.get_active_metadata()

        return {
            "mode": "demo",
            "model_version": metadata.get("version", "model_v1"),
            "healthScore": score,
            "riskLevel": risk_level,
            "trend": trend,
            "confidence": 0.84,
            "factors": factors
        }

    def predict_trajectory(self, current_score: float, trend: str, risk_level: str) -> Dict[str, Any]:
        if risk_level == "HIGH" or trend == "DECLINING":
            window = "3–7 days"
            confidence = 0.72
            summary = "If the current abnormal trend continues without intervention, colony condition may reach high-risk state within 3–7 days."
            points = [
                {"day": "Day 0 (Now)", "score": current_score},
                {"day": "Day 2", "score": max(15.0, current_score - 7.0)},
                {"day": "Day 4", "score": max(12.0, current_score - 14.0)},
                {"day": "Day 7", "score": max(10.0, current_score - 22.0)}
            ]
        elif risk_level == "MEDIUM":
            window = "7–14 days"
            confidence = 0.68
            summary = "Moderate anomaly trajectory. Potential deterioration over 1–2 weeks if stressors persist."
            points = [
                {"day": "Day 0 (Now)", "score": current_score},
                {"day": "Day 2", "score": max(20.0, current_score - 3.0)},
                {"day": "Day 4", "score": max(20.0, current_score - 6.0)},
                {"day": "Day 7", "score": max(20.0, current_score - 10.0)}
            ]
        else:
            window = "Normal monitoring schedule"
            confidence = 0.88
            summary = "Colony parameters forecast stable vitality under standard seasonal conditions."
            points = [
                {"day": "Day 0 (Now)", "score": current_score},
                {"day": "Day 2", "score": min(100.0, current_score + 1.0)},
                {"day": "Day 4", "score": min(100.0, current_score + 2.0)},
                {"day": "Day 7", "score": min(100.0, current_score + 2.0)}
            ]

        return {
            "mode": "demo",
            "estimatedRiskWindow": window,
            "confidence": confidence,
            "projectionSummary": summary,
            "trajectoryPoints": points
        }

    def predict_production_impact(self, expected_baseline_kg: float, health_score: float, weight_trend: str) -> Dict[str, Any]:
        loss_factor = 0.0
        if health_score < 50.0:
            loss_factor = 0.40
        elif health_score < 70.0:
            loss_factor = 0.22
        elif health_score < 85.0:
            loss_factor = 0.08

        estimated_yield = round(expected_baseline_kg * (1.0 - loss_factor), 1)
        difference = round(expected_baseline_kg - estimated_yield, 1)

        return {
            "expectedProductionKg": expected_baseline_kg,
            "currentEstimatedProductionKg": estimated_yield,
            "potentialDifferenceKg": difference,
            "confidence": 0.76,
            "factors": [
                f"Colony vigor index: {health_score}/100",
                f"7-day weight velocity indicator: {weight_trend}",
                "Seasonal nectar availability baseline"
            ],
            "disclaimer": "Production projections are statistical model estimates based on colony vigor and telemetry. Not a guaranteed harvest volume."
        }

predictor = ColonyPredictor()
