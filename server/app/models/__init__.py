import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class AdminUser(Base):
    __tablename__ = "admin_user"

    user_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    name = Column(String(150), default="Admin Administrator")
    email = Column(String(150), default="admin@bank.com")
    role = Column(String(50), default="Administrator")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    predictions = relationship("Prediction", back_populates="user")

class ATM(Base):
    __tablename__ = "atm"

    atm_id = Column(String(50), primary_key=True, index=True)
    atm_name = Column(String(200), nullable=True)
    city = Column(String(120), index=True, nullable=False)
    atm_address = Column(Text, nullable=True)
    total_balance = Column(Float, nullable=False, default=0.0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(30), default="Active")
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    transactions = relationship("ATMTransaction", back_populates="atm", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="atm", cascade="all, delete-orphan")

class ATMTransaction(Base):
    __tablename__ = "atm_transaction"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    atm_id = Column(String(50), ForeignKey("atm.atm_id", ondelete="CASCADE"), index=True, nullable=False)
    transaction_type = Column(String(40), nullable=False)  # Withdrawal, Inquiry, Deposit
    amount = Column(Float, nullable=False, default=0.0)
    balance_after = Column(Float, nullable=True)
    outcome_count = Column(Integer, nullable=True, default=1)
    total_transaction_count = Column(Integer, nullable=True, default=1)
    transaction_time = Column(DateTime, index=True, nullable=False)
    source_metadata = Column(JSON, nullable=True)

    atm = relationship("ATM", back_populates="transactions")

class Prediction(Base):
    __tablename__ = "prediction"

    prediction_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    atm_id = Column(String(50), ForeignKey("atm.atm_id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("admin_user.user_id"), nullable=True)
    predicted_demand = Column(Float, nullable=False)
    current_balance = Column(Float, nullable=False)
    risk_level = Column(String(20), index=True, nullable=False)  # HIGH, MEDIUM, LOW
    recommended_refill = Column(Float, nullable=False, default=0.0)
    prediction_period = Column(String(50), default="next_7_days")
    model_version = Column(String(100), default="rf_demand_v1.0")
    feature_snapshot = Column(JSON, nullable=True)
    review_status = Column(String(30), default="Pending", index=True)  # Pending, Reviewed, Dismissed
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_note = Column(Text, nullable=True)
    prediction_time = Column(DateTime, index=True, default=get_utc_now)

    atm = relationship("ATM", back_populates="predictions")
    user = relationship("AdminUser", back_populates="predictions")
