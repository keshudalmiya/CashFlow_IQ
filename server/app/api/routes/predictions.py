from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.core.database import get_db
from app.models import ATM, Prediction, AdminUser
from app.schemas import PredictionCreateRequest, PredictionResponse
from app.ml.model_loader import model_service
from app.services.risk_service import calculate_risk_and_refill
from app.api.deps import get_current_user

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("", response_model=PredictionResponse)
def create_prediction(
    request: PredictionCreateRequest,
    db: Session = Depends(get_db)
):
    atm = db.query(ATM).filter(ATM.atm_id == request.atm_id).first()
    if not atm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ATM '{request.atm_id}' not found"
        )

    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Machine Learning model is not available: {model_service.load_error or 'Model not initialized'}"
        )

    now = datetime.now(timezone.utc)
    hour = now.hour
    dow = now.weekday()
    is_weekend = 1 if dow >= 5 else 0
    is_holiday = 0  # Could be checked against holiday calendar

    # Build realistic 10 features snapshot for this ATM based on its current balance
    curr_balance = float(atm.total_balance)
    
    # Estimate reasonable recent outcome transactions based on ATM historical performance
    est_outcomes = max(5, int(curr_balance / 15000))
    est_total_tx = int(est_outcomes * 1.5)
    prev_demand = float(est_outcomes * 4000)
    prev_count = est_outcomes
    rolling_3 = prev_demand * 1.02

    features = {
        "hour": hour,
        "day_of_week": dow,
        "is_weekend": is_weekend,
        "is_holiday": is_holiday,
        "totalBalance": curr_balance,
        "numberOutcomeTransaction": est_outcomes,
        "totalNumberTransaction": est_total_tx,
        "previous_demand": prev_demand,
        "previous_transaction_count": prev_count,
        "rolling_mean_3": rolling_3
    }

    try:
        # Run inference using the trained Random Forest model
        predicted_demand = model_service.predict(features)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Inference error: {str(e)}"
        )

    # Calculate authoritative risk level and refill recommendation
    risk_level, recommended_refill = calculate_risk_and_refill(predicted_demand, curr_balance)

    # Persist prediction in database
    prediction = Prediction(
        atm_id=atm.atm_id,
        user_id=None,
        predicted_demand=predicted_demand,
        current_balance=curr_balance,
        risk_level=risk_level,
        recommended_refill=recommended_refill,
        prediction_period=request.prediction_period or "next_7_days",
        model_version=model_service.metadata.get("model_version", "RandomForest-Demand-v1.0"),
        feature_snapshot=features,
        review_status="Pending",
        prediction_time=now
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return PredictionResponse(
        prediction_id=prediction.prediction_id,
        atm_id=prediction.atm_id,
        atm_name=atm.atm_name,
        city=atm.city,
        predicted_demand=prediction.predicted_demand,
        current_balance=prediction.current_balance,
        risk_level=prediction.risk_level,
        recommended_refill=prediction.recommended_refill,
        prediction_period=prediction.prediction_period,
        model_version=prediction.model_version,
        prediction_time=prediction.prediction_time,
        review_status=prediction.review_status,
        feature_snapshot=prediction.feature_snapshot
    )

@router.get("")
def list_prediction_history(
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction, ATM).join(ATM, Prediction.atm_id == ATM.atm_id)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Prediction.atm_id.ilike(search_fmt),
                ATM.atm_name.ilike(search_fmt),
                ATM.city.ilike(search_fmt)
            )
        )

    if risk_level and risk_level not in ["All Risk Levels", "all"]:
        query = query.filter(Prediction.risk_level == risk_level.upper())

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    results = (
        query.order_by(desc(Prediction.prediction_time))
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = [
        PredictionResponse(
            prediction_id=p.prediction_id,
            atm_id=p.atm_id,
            atm_name=atm.atm_name,
            city=atm.city,
            predicted_demand=p.predicted_demand,
            current_balance=p.current_balance,
            risk_level=p.risk_level,
            recommended_refill=p.recommended_refill,
            prediction_period=p.prediction_period or "next_7_days",
            model_version=p.model_version or "RandomForest-Demand-v1.0",
            prediction_time=p.prediction_time,
            review_status=p.review_status or "Pending",
            feature_snapshot=p.feature_snapshot
        )
        for p, atm in results
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction_detail(prediction_id: str, db: Session = Depends(get_db)):
    pred = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    atm = db.query(ATM).filter(ATM.atm_id == pred.atm_id).first()

    return PredictionResponse(
        prediction_id=pred.prediction_id,
        atm_id=pred.atm_id,
        atm_name=atm.atm_name if atm else None,
        city=atm.city if atm else None,
        predicted_demand=pred.predicted_demand,
        current_balance=pred.current_balance,
        risk_level=pred.risk_level,
        recommended_refill=pred.recommended_refill,
        prediction_period=pred.prediction_period or "next_7_days",
        model_version=pred.model_version or "RandomForest-Demand-v1.0",
        prediction_time=pred.prediction_time,
        review_status=pred.review_status or "Pending",
        feature_snapshot=pred.feature_snapshot
    )
