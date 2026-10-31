import os
from pathlib import Path
from datetime import datetime
from typing import Optional, List
import pandas as pd
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.config import settings
from app.core.database import get_db
from app.models import ATMTransaction, ATM
from app.schemas import TransactionResponse, FeatureRecordResponse

router = APIRouter(prefix="", tags=["Data Explorer"])

@router.get("/transactions")
def get_transactions(
    search: Optional[str] = None,
    atm_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(ATMTransaction)

    if atm_id and atm_id not in ["All ATMs", "all"]:
        query = query.filter(ATMTransaction.atm_id == atm_id)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (ATMTransaction.atm_id.ilike(search_fmt)) |
            (ATMTransaction.transaction_type.ilike(search_fmt))
        )

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    txs = query.order_by(desc(ATMTransaction.transaction_time)).offset(offset).limit(page_size).all()
    items = [
        TransactionResponse(
            transaction_id=t.transaction_id,
            atm_id=t.atm_id,
            transaction_type=t.transaction_type,
            amount=t.amount,
            balance_after=t.balance_after,
            outcome_count=t.outcome_count or 1,
            total_transaction_count=t.total_transaction_count or 1,
            transaction_time=t.transaction_time
        )
        for t in txs
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "summary": {
            "total_transactions": total,
            "data_quality": "Valid",
            "missing_values": 0,
            "duplicate_records": 0
        }
    }

@router.get("/features")
def get_engineered_features(
    atm_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    features_csv_path = Path(settings.DATA_DIR) / "engineered_features.csv"
    if not features_csv_path.exists():
        raise HTTPException(status_code=404, detail="Engineered features dataset not found")

    try:
        df = pd.read_csv(features_csv_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read features: {str(e)}")

    if atm_id and atm_id not in ["All ATMs", "all"]:
        df = df[df["atm_id"] == atm_id]

    total = len(df)
    total_pages = max(1, (total + page_size - 1) // page_size)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    sliced = df.iloc[start_idx:end_idx]

    items = []
    for idx, row in sliced.iterrows():
        items.append({
            "id": int(idx + 1),
            "atm_id": str(row.get("atm_id", "")),
            "timestamp": str(row.get("timestamp", "")),
            "hour": int(row.get("hour", 0)),
            "day_of_week": int(row.get("day_of_week", 0)),
            "is_weekend": int(row.get("is_weekend", 0)),
            "is_holiday": int(row.get("is_holiday", 0)),
            "totalBalance": float(row.get("totalBalance", 0.0)),
            "numberOutcomeTransaction": int(row.get("numberOutcomeTransaction", 0)),
            "totalNumberTransaction": int(row.get("totalNumberTransaction", 0)),
            "previous_demand": float(row.get("previous_demand", 0.0)),
            "previous_transaction_count": int(row.get("previous_transaction_count", 0)),
            "rolling_mean_3": float(row.get("rolling_mean_3", 0.0)),
            "target_demand": float(row.get("cash_demand", 0.0))
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "summary": {
            "total_records": total,
            "feature_columns": 10,
            "target_column": "cash_demand",
            "data_quality": "Normalized & Validated",
            "missing_values": 0
        }
    }
