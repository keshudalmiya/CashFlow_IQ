from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserProfile"

class UserProfile(BaseModel):
    user_id: str
    username: str
    name: str
    email: str
    role: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# --- ATM Schemas ---
class ATMResponse(BaseModel):
    atm_id: str
    atm_name: Optional[str] = None
    city: str
    atm_address: Optional[str] = None
    current_balance: float
    predicted_demand: Optional[float] = None
    recommended_refill: Optional[float] = None
    risk_level: str  # HIGH, MEDIUM, LOW
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_prediction_time: Optional[datetime] = None

class ATMDetailResponse(ATMResponse):
    safety_factor: float = 0.35
    avg_daily_withdrawal: float = 0.0
    peak_day: str = "Friday"
    volatility: str = "Medium"
    suggested_action: str = "Monitor cash levels"

# --- Transaction Schemas ---
class TransactionResponse(BaseModel):
    transaction_id: int
    atm_id: str
    transaction_type: str
    amount: float
    balance_after: Optional[float] = None
    outcome_count: Optional[int] = 1
    total_transaction_count: Optional[int] = 1
    transaction_time: datetime

# --- Engineered Feature Schema ---
class FeatureRecordResponse(BaseModel):
    id: int
    atm_id: str
    timestamp: datetime
    hour: int
    day_of_week: int
    is_weekend: int
    is_holiday: int
    totalBalance: float
    numberOutcomeTransaction: int
    totalNumberTransaction: int
    previous_demand: float
    previous_transaction_count: int
    rolling_mean_3: float
    target_demand: float

# --- Prediction Schemas ---
class PredictionCreateRequest(BaseModel):
    atm_id: str
    prediction_period: Optional[str] = "next_7_days"

class PredictionResponse(BaseModel):
    prediction_id: str
    atm_id: str
    atm_name: Optional[str] = None
    city: Optional[str] = None
    predicted_demand: float
    current_balance: float
    risk_level: str
    recommended_refill: float
    prediction_period: str
    model_version: str
    prediction_time: datetime
    review_status: str
    feature_snapshot: Optional[Dict[str, Any]] = None

# --- Refill Schemas ---
class RefillResponse(BaseModel):
    prediction_id: str
    atm_id: str
    atm_name: Optional[str] = None
    city: Optional[str] = None
    current_balance: float
    predicted_demand: float
    recommended_refill: float
    risk_level: str
    priority: str  # High, Medium, Low
    review_status: str  # Pending, Reviewed, Dismissed
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    prediction_time: datetime

class RefillUpdateReviewRequest(BaseModel):
    review_status: str  # Pending, Reviewed, Dismissed
    review_note: Optional[str] = None

# --- Overview Schemas ---
class OverviewKPIs(BaseModel):
    total_atms: int
    high_risk: int
    high_risk_pct: float
    medium_risk: int
    medium_risk_pct: float
    low_risk: int
    low_risk_pct: float
    network_balance: float
    forecast_demand: float
    recommended_refill: float
    prediction_count: int

class TrendPoint(BaseModel):
    date: str
    actual_demand: float
    predicted_demand: float

class RiskDistribution(BaseModel):
    high_risk: int
    medium_risk: int
    low_risk: int
    total: int

class AttentionItem(BaseModel):
    atm_id: str
    location: str
    current_balance: float
    predicted_demand: float
    risk: str
    recommended_refill: float

class OverviewResponse(BaseModel):
    kpis: OverviewKPIs
    trend: List[TrendPoint]
    risk_distribution: RiskDistribution
    attention_list: List[AttentionItem]
    recent_predictions: List[PredictionResponse]

# --- Analytics Schemas ---
class ModelMetrics(BaseModel):
    mae: float
    rmse: float
    r2_score: float
    accuracy_pct: float
    evaluation_date: str
    model_type: str

class TopAtmDemand(BaseModel):
    atm_id: str
    name: str
    city: str
    demand: float

class DayRiskDistribution(BaseModel):
    date: str
    high: int
    medium: int
    low: int

class AnalyticsResponse(BaseModel):
    metrics: ModelMetrics
    trend: List[TrendPoint]
    risk_over_time: List[DayRiskDistribution]
    top_atms: List[TopAtmDemand]
    risk_distribution: RiskDistribution

# --- System Status ---
class SystemStatusResponse(BaseModel):
    api_server: str = "Online"
    database: str = "Connected"
    ml_model: str = "Loaded (Random Forest)"
    features_count: int = 10
    feature_names: List[str]
    last_model_update: str
    db_type: str
    version: str = "1.0.0"

# Fix forward refs
TokenResponse.model_rebuild()
