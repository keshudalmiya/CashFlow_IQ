from typing import Tuple

def calculate_risk_and_refill(predicted_demand: float, current_balance: float) -> Tuple[str, float]:
    """
    Authoritative backend risk classification and refill calculation.
    
    Rules:
    - required_cash = D * 1.2
    - recommended_refill = max(0, required_cash - B)
    - If B < D: HIGH
    - Else if B < 1.5 * D: MEDIUM
    - Else: LOW
    
    Edge cases:
    - If D <= 0: risk is LOW, refill is 0.0
    - If B < 0: B treated as is (e.g. required_cash - B becomes positive refill)
    """
    # Safe numeric conversion
    try:
        d = float(predicted_demand)
        b = float(current_balance)
    except (ValueError, TypeError):
        return "HIGH", 0.0

    if d <= 0:
        return "LOW", 0.0

    required_cash = d * 1.2
    recommended_refill = max(0.0, required_cash - b)
    
    if b < d:
        risk_level = "HIGH"
    elif b < 1.5 * d:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return risk_level, round(recommended_refill, 2)
