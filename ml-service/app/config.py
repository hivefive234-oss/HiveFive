import os

class Settings:
    PROJECT_NAME: str = "HoneyChain Multimodal ML Service"
    VERSION: str = "1.0.0"
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "model_v1")
    MODE: str = os.getenv("ML_MODE", "demo") # "demo" or "trained"
    HOST: str = os.getenv("ML_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("ML_PORT", "8000"))

    # Colony Physiological Reference Benchmarks
    BROOD_TEMP_OPTIMAL_MIN: float = 34.5
    BROOD_TEMP_OPTIMAL_MAX: float = 35.5
    BROOD_TEMP_CRITICAL_LOW: float = 32.0
    BROOD_TEMP_CRITICAL_HIGH: float = 38.0

    HUMIDITY_OPTIMAL_MIN: float = 50.0
    HUMIDITY_OPTIMAL_MAX: float = 65.0
    HUMIDITY_ALERT_HIGH: float = 75.0

    ACOUSTIC_BASE_MIN_HZ: float = 220.0
    ACOUSTIC_BASE_MAX_HZ: float = 260.0
    ACOUSTIC_DISTRESS_HZ: float = 300.0

settings = Settings()
