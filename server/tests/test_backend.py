import pytest
import os
import sys
from pathlib import Path

# Add server to path
SERVER_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SERVER_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.services.risk_service import calculate_risk_and_refill
from app.ml.feature_builder import validate_and_order_features, EXPECTED_FEATURES
from app.ml.model_loader import model_service
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

client = TestClient(app)

# 1. Unit Tests for Risk Rules and Refill Calculation
def test_risk_and_refill_rules():
    # HIGH Risk: Balance < Predicted Demand
    risk, refill = calculate_risk_and_refill(predicted_demand=120000, current_balance=42000)
    assert risk == "HIGH"
    # required_cash = 120000 * 1.2 = 144000; refill = 144000 - 42000 = 102000
    assert refill == 102000.0

    # MEDIUM Risk: Balance >= Predicted Demand but Balance < 1.5 * Predicted Demand
    # e.g. Demand = 100,000, 1.5 * D = 150,000, Balance = 110,000
    risk, refill = calculate_risk_and_refill(predicted_demand=100000, current_balance=110000)
    assert risk == "MEDIUM"
    # required_cash = 100000 * 1.2 = 120000; refill = 120000 - 110000 = 10000
    assert refill == 10000.0

    # LOW Risk: Balance >= 1.5 * Predicted Demand
    # e.g. Demand = 100,000, Balance = 160,000
    risk, refill = calculate_risk_and_refill(predicted_demand=100000, current_balance=160000)
    assert risk == "LOW"
    # required_cash = 120000; refill = max(0, 120000 - 160000) = 0.0
    assert refill == 0.0

    # Edge cases
    # Demand is 0 or negative
    risk, refill = calculate_risk_and_refill(predicted_demand=0, current_balance=50000)
    assert risk == "LOW"
    assert refill == 0.0

    risk, refill = calculate_risk_and_refill(predicted_demand=-5000, current_balance=50000)
    assert risk == "LOW"
    assert refill == 0.0

    # Balance is 0 or negative
    risk, refill = calculate_risk_and_refill(predicted_demand=50000, current_balance=0)
    assert risk == "HIGH"
    assert refill == 60000.0

# 2. Unit Tests for Feature Builder and Ordering
def test_feature_order_and_validation():
    sample_features = {
        "hour": 14,
        "day_of_week": 2,
        "is_weekend": 0,
        "is_holiday": 0,
        "totalBalance": 150000.0,
        "numberOutcomeTransaction": 20,
        "totalNumberTransaction": 35,
        "previous_demand": 95000.0,
        "previous_transaction_count": 18,
        "rolling_mean_3": 92000.0
    }
    
    df = validate_and_order_features(sample_features)
    assert list(df.columns) == EXPECTED_FEATURES
    assert df.shape == (1, 10)
    assert df["hour"].iloc[0] == 14
    assert df["totalBalance"].iloc[0] == 150000.0

    # Missing feature should raise ValueError
    incomplete = sample_features.copy()
    del incomplete["rolling_mean_3"]
    with pytest.raises(ValueError, match="Missing required model features"):
        validate_and_order_features(incomplete)

    # Non-numeric feature should raise ValueError
    invalid = sample_features.copy()
    invalid["hour"] = "two_pm"
    with pytest.raises(ValueError, match="must be numeric"):
        validate_and_order_features(invalid)

# 3. Test Model Inference
def test_model_inference():
    assert model_service.is_loaded is True
    sample_features = {
        "hour": 11,
        "day_of_week": 3,
        "is_weekend": 0,
        "is_holiday": 0,
        "totalBalance": 80000.0,
        "numberOutcomeTransaction": 12,
        "totalNumberTransaction": 20,
        "previous_demand": 60000.0,
        "previous_transaction_count": 10,
        "rolling_mean_3": 65000.0
    }
    prediction = model_service.predict(sample_features)
    assert isinstance(prediction, float)
    assert prediction >= 0.0

# 4. Security & Authentication Tests
def test_security_auth():
    plain = "Secur3P@ss!"
    hashed = get_password_hash(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

    token = create_access_token(subject="admin-user-id")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "admin-user-id"

# 5. Integration / API Tests
def test_api_health_and_system():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "version" in data

    res = client.get("/api/system/status")
    assert res.status_code == 200
    data = res.json()
    assert data["features_count"] == 10
    assert len(data["feature_names"]) == 10

def test_api_auth_flow():
    # Valid login
    res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Invalid login
    res = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert res.status_code == 401

    # Get /me with token
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["username"] == "admin"

def test_api_overview():
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "trend" in data
    assert "risk_distribution" in data
    assert "attention_list" in data
    assert data["kpis"]["total_atms"] >= 1

def test_api_atms_and_details():
    res = client.get("/api/atms?page=1&page_size=5")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) <= 5
    atm_id = data["items"][0]["atm_id"]

    # ATM detail
    res = client.get(f"/api/atms/{atm_id}")
    assert res.status_code == 200
    atm_detail = res.json()
    assert atm_detail["atm_id"] == atm_id
    assert "safety_factor" in atm_detail

    # ATM trend
    res = client.get(f"/api/atms/{atm_id}/trend")
    assert res.status_code == 200
    assert len(res.json()) >= 10

def test_api_prediction_workflow():
    # Make a prediction
    res = client.post("/api/predictions", json={"atm_id": "ATM001", "prediction_period": "next_7_days"})
    assert res.status_code == 200
    pred = res.json()
    assert pred["atm_id"] == "ATM001"
    assert pred["predicted_demand"] >= 0
    assert pred["risk_level"] in ["HIGH", "MEDIUM", "LOW"]
    pred_id = pred["prediction_id"]

    # Retrieve in history
    res = client.get(f"/api/predictions/{pred_id}")
    assert res.status_code == 200
    assert res.json()["prediction_id"] == pred_id

    # List history
    res = client.get("/api/predictions?page=1&page_size=5")
    assert res.status_code == 200
    assert res.json()["total"] >= 1

def test_api_refills_and_review():
    res = client.get("/api/refills?page=1&page_size=5")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    if data["items"]:
        pred_id = data["items"][0]["prediction_id"]
        # Update review status
        res = client.patch(f"/api/refills/{pred_id}/review", json={"review_status": "Reviewed"})
        assert res.status_code == 200
        assert res.json()["review_status"] == "Reviewed"

def test_api_data_explorer_and_analytics():
    # Transactions
    res = client.get("/api/transactions?page=1&page_size=5")
    assert res.status_code == 200
    assert "items" in res.json()

    # Features
    res = client.get("/api/features?page=1&page_size=5")
    assert res.status_code == 200
    assert "items" in res.json()

    # Analytics
    res = client.get("/api/analytics")
    assert res.status_code == 200
    analytics = res.json()
    assert "metrics" in analytics
    assert analytics["metrics"]["mae"] > 0
    assert "top_atms" in analytics
