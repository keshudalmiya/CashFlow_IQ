from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, case

from app.core.database import get_db
from app.models import ATM, Prediction, AdminUser
from app.schemas import RefillResponse, RefillUpdateReviewRequest
from app.api.deps import get_current_user

router = APIRouter(prefix="/refills", tags=["Refill Actions"])

@router.get("")
def list_refill_recommendations(
    risk_level: Optional[str] = None,
    review_status: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Prediction, ATM)
        .join(ATM, Prediction.atm_id == ATM.atm_id)
        .filter(Prediction.recommended_refill > 0)
    )

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

    if review_status and review_status not in ["All", "all"]:
        query = query.filter(Prediction.review_status == review_status)

    if city and city not in ["All Cities", "all"]:
        query = query.filter(ATM.city == city)

    # Sort priority: HIGH risk first, then MEDIUM, then LOW, then highest refill amount
    risk_priority = case(
        (Prediction.risk_level == "HIGH", 1),
        (Prediction.risk_level == "MEDIUM", 2),
        else_=3
    )
    query = query.order_by(risk_priority, desc(Prediction.recommended_refill))

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    results = query.offset(offset).limit(page_size).all()

    items = []
    for p, atm in results:
        priority_label = "High" if p.risk_level == "HIGH" else ("Medium" if p.risk_level == "MEDIUM" else "Low")
        items.append(RefillResponse(
            prediction_id=p.prediction_id,
            atm_id=p.atm_id,
            atm_name=atm.atm_name,
            city=atm.city,
            current_balance=p.current_balance,
            predicted_demand=p.predicted_demand,
            recommended_refill=p.recommended_refill,
            risk_level=p.risk_level,
            priority=priority_label,
            review_status=p.review_status or "Pending",
            reviewed_by=p.reviewed_by,
            reviewed_at=p.reviewed_at,
            prediction_time=p.prediction_time
        ))

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.patch("/{prediction_id}/review", response_model=RefillResponse)
def update_refill_review(
    prediction_id: str,
    request: RefillUpdateReviewRequest,
    db: Session = Depends(get_db)
):
    pred = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction record not found")

    pred.review_status = request.review_status
    pred.reviewed_by = "Admin Administrator"
    pred.reviewed_at = datetime.now(timezone.utc)
    if request.review_note:
        pred.review_note = request.review_note

    db.commit()
    db.refresh(pred)

    atm = db.query(ATM).filter(ATM.atm_id == pred.atm_id).first()
    priority_label = "High" if pred.risk_level == "HIGH" else ("Medium" if pred.risk_level == "MEDIUM" else "Low")

    return RefillResponse(
        prediction_id=pred.prediction_id,
        atm_id=pred.atm_id,
        atm_name=atm.atm_name if atm else None,
        city=atm.city if atm else None,
        current_balance=pred.current_balance,
        predicted_demand=pred.predicted_demand,
        recommended_refill=pred.recommended_refill,
        risk_level=pred.risk_level,
        priority=priority_label,
        review_status=pred.review_status,
        reviewed_by=pred.reviewed_by,
        reviewed_at=pred.reviewed_at,
        prediction_time=pred.prediction_time
    )
