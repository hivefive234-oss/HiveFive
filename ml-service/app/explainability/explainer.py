from typing import Dict, Any, List

class ColonyExplainer:
    def explain(
        self,
        health_score: float,
        risk_level: str,
        factors: List[str],
        hive_code: str = "H001"
    ) -> Dict[str, Any]:
        if risk_level == "LOW":
            what_happened = f"Hive {hive_code} exhibits steady brood nest thermoregulation and healthy flight activity."
            why_increasing = "No abnormal trajectory observed. Sensor values are aligned with historical seasonal averages."
            data_caused = factors if factors else ["All monitored metrics within baseline range."]
            what_may_happen = "Colony is projected to sustain current vigor and nectar processing under normal forage availability."
            what_to_check = "Continue standard scheduled bi-weekly checks and verify fresh water availability."
        elif risk_level == "MEDIUM":
            what_happened = f"Telemetry detected moderate divergence from baseline in Hive {hive_code}."
            why_increasing = f"Primary contributors: {'; '.join(factors)}."
            data_caused = factors
            what_may_happen = "If environmental or management stressors persist, colony vigor and upcoming honey yield may diminish."
            what_to_check = "Inspect bottom board for moisture, verify entrance reducer airflow, and check brood comb uniformity."
        else: # HIGH
            what_happened = f"High-risk alert triggered by sharp abnormal deviations in Hive {hive_code}."
            why_increasing = f"Multi-signal indicators: {'; '.join(factors)}."
            data_caused = factors
            what_may_happen = "If unattended, sustained temperature swings and weight loss may lead to brood chilling, absconding risk, or workforce depletion."
            what_to_check = "Immediate hands-on inspection recommended: examine queen presence, check for disease symptoms (foulbrood/chalkbrood), test food stores, and clear ventilation."

        return {
            "whatHappened": what_happened,
            "whyIsRiskIncreasing": why_increasing,
            "dataCausedAlert": data_caused,
            "whatMayHappenIfTrendContinues": what_may_happen,
            "whatShouldBeekeeperCheckNext": what_to_check,
            "scientificDisclaimer": "This analysis represents a model-estimated decision-support indicator. It is not an automated medical diagnosis and does not replace on-site apicultural expertise."
        }

explainer = ColonyExplainer()
