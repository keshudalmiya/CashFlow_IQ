from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "CashFlow IQ - ATM Cash Demand Predictor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "cashflow-iq-secure-enterprise-secret-key-2026-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'cashflow_iq.db'}")
    
    # ML Models & Metadata
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models_storage" / "cash_demand_rf.joblib"))
    METADATA_PATH: str = os.getenv("METADATA_PATH", str(BASE_DIR / "models_storage" / "model_metadata.json"))
    DATA_DIR: str = os.getenv("DATA_DIR", str(BASE_DIR / "data"))
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
    ]

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()
