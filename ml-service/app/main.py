from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import tempfile
from .config import settings
from .inference.predictor import predictor
from .explainability.explainer import explainer
from .models.registry import model_registry
from .training.train import load_and_inspect_dataset, preprocess_and_engineer, train_and_export

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable Colony Health, Risk Trajectory & Production Impact ML Service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class TelemetryPayload(BaseModel):
    temperature: Optional[float] = 35.0
    humidity: Optional[float] = 55.0
    weight: Optional[float] = 42.0
    weight_delta_24h: Optional[float] = 0.0
    acoustic_peak_hz: Optional[float] = 235.0
    net_bee_traffic: Optional[float] = 50.0

class TrajectoryPayload(BaseModel):
    currentScore: float = 75.0
    trend: str = "STABLE"
    riskLevel: str = "LOW"

class ExplainPayload(BaseModel):
    healthScore: float = 75.0
    riskLevel: str = "LOW"
    factors: List[str] = Field(default_factory=list)
    hiveCode: Optional[str] = "H001"

class ActionSimulationPayload(BaseModel):
    currentScore: float = 68.0
    trend: str = "DECLINING"

class ProductionImpactPayload(BaseModel):
    expectedBaselineKg: Optional[float] = 24.0
    healthScore: float = 75.0
    weightTrend: Optional[str] = "stable"

# --- Endpoints ---
@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "ONLINE",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model_version": model_registry.active_version
    }

@app.get("/model/metadata")
def get_model_metadata():
    return model_registry.get_active_metadata()

@app.post("/train")
async def train_custom_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV dataset files are supported.")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        df = load_and_inspect_dataset(tmp_path)
        features, y_score, y_risk = preprocess_and_engineer(df)
        train_and_export(features, y_score, y_risk, version="model_v2")
        model_registry.reload()
        return {
            "message": "Model retraining completed successfully!",
            "filename": file.filename,
            "metadata": model_registry.get_active_metadata()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/predict/health")
def predict_health(payload: TelemetryPayload):
    return predictor.predict_health(payload.model_dump())

@app.post("/predict/risk")
def predict_risk(payload: TelemetryPayload):
    # Predict health and risk
    return predictor.predict_health(payload.model_dump())

@app.post("/predict/trajectory")
def predict_trajectory(payload: TrajectoryPayload):
    return predictor.predict_trajectory(
        current_score=payload.currentScore,
        trend=payload.trend,
        risk_level=payload.riskLevel
    )

@app.post("/predict/production-impact")
def predict_production_impact(payload: ProductionImpactPayload):
    return predictor.predict_production_impact(
        expected_baseline_kg=payload.expectedBaselineKg or 24.0,
        health_score=payload.healthScore,
        weight_trend=payload.weightTrend or "stable"
    )

@app.post("/explain")
def explain_alert(payload: ExplainPayload):
    return explainer.explain(
        health_score=payload.healthScore,
        risk_level=payload.riskLevel,
        factors=payload.factors,
        hive_code=payload.hiveCode or "H001"
    )

@app.post("/simulate-action")
def simulate_action(payload: ActionSimulationPayload):
    score = payload.currentScore
    trend = payload.trend

    return {
        "currentState": {
            "healthScore": score,
            "trend": trend
        },
        "options": [
            {
                "id": "OPTION_A",
                "title": "Option A – Continue Monitoring",
                "description": "Maintain passive telemetry monitoring without physical intervention.",
                "expectedHealthTrend": "Continued decline if underlying stressor persists" if trend == "DECLINING" else "Stable trajectory",
                "possibleRiskChange": "Risk may escalate to HIGH within 5–7 days" if trend == "DECLINING" else "Minimal risk change",
                "productionImpactKg": -3.5 if trend == "DECLINING" else 0.0,
                "monitoringRequirement": "Review sensor telemetry dashboard every 12 hours",
                "uncertainty": "Moderate-High (internal cause unverified)"
            },
            {
                "id": "OPTION_B",
                "title": "Option B – Inspect Hive",
                "description": "Perform on-site physical inspection of brood frames, queen indicators, and reserves.",
                "expectedHealthTrend": "Enables accurate diagnosis and informed corrective action",
                "possibleRiskChange": "Reduces diagnostic uncertainty by ~65%",
                "productionImpactKg": -0.5,
                "monitoringRequirement": "Log inspection findings and queen status in Hive Digital Passport",
                "uncertainty": "Low (direct physical confirmation)"
            },
            {
                "id": "OPTION_C",
                "title": "Option C – Appropriate Domain Intervention",
                "description": "Apply validated non-chemical management (adjust ventilation screen, provide emergency syrup/pollen, clean bottom board).",
                "expectedHealthTrend": "Potential stabilization and progressive recovery over 4–8 days",
                "possibleRiskChange": "Estimated 40–60% reduction in high-risk escalation probability",
                "productionImpactKg": +2.0,
                "monitoringRequirement": "Track daily weight and temperature stabilization over subsequent 7 days",
                "uncertainty": "Moderate (dependent on accurate problem diagnosis)"
            },
            {
                "id": "OPTION_D",
                "title": "Option D – Recheck After Short Interval",
                "description": "Wait 24–48 hours while tracking rate-of-change to verify if departure is transient.",
                "expectedHealthTrend": "Confirms if anomaly is transient weather anomaly or chronic trend",
                "possibleRiskChange": "Accepts temporary risk window to avoid unnecessary colony disruption",
                "productionImpactKg": -1.0,
                "monitoringRequirement": "Automated alert if internal temperature departs by >2°C",
                "uncertainty": "Moderate"
            }
        ],
        "disclaimer": "The action simulator provides comparative decision-support projections. It is not an automated medical recommendation."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml-service.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
