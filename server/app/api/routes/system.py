from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db
from app.ml.model_loader import model_service
from app.ml.feature_builder import EXPECTED_FEATURES
from app.schemas import SystemStatusResponse

router = APIRouter(prefix="", tags=["System"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok and model_service.is_loaded else "degraded",
        "api": "ok",
        "database": "connected" if db_ok else "unavailable",
        "ml_model": "loaded" if model_service.is_loaded else "unavailable",
        "version": settings.VERSION
    }

@router.get("/system/status", response_model=SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    db_status = "Connected"
    db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite (Local Embedded)"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "Disconnected"

    ml_status = "Loaded (Random Forest)" if model_service.is_loaded else f"Error: {model_service.load_error}"
    last_update = model_service.metadata.get("evaluation", {}).get("evaluation_date", "27-Oct-2026 11:54 UTC")

    return SystemStatusResponse(
        api_server="Online",
        database=db_status,
        ml_model=ml_status,
        features_count=len(EXPECTED_FEATURES),
        feature_names=EXPECTED_FEATURES,
        last_model_update=last_update,
        db_type=db_type,
        version=settings.VERSION
    )
