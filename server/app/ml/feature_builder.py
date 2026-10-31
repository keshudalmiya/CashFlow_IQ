from typing import Dict, List, Any
import numpy as np

EXPECTED_FEATURES: List[str] = [
    "hour",
    "day_of_week",
    "is_weekend",
    "is_holiday",
    "totalBalance",
    "numberOutcomeTransaction",
    "totalNumberTransaction",
    "previous_demand",
    "previous_transaction_count",
    "rolling_mean_3"
]

import pandas as pd

def validate_and_order_features(raw_features: Dict[str, Any]) -> pd.DataFrame:
    """
    Validates that all 10 required features are present, non-null, and numeric,
    and returns a pandas DataFrame with shape (1, 10) in the exact training order with feature names.
    """
    missing = [feat for feat in EXPECTED_FEATURES if feat not in raw_features]
    if missing:
        raise ValueError(f"Missing required model features: {missing}")

    ordered_dict = {}
    for feat in EXPECTED_FEATURES:
        val = raw_features[feat]
        if val is None:
            raise ValueError(f"Feature '{feat}' cannot be null")
        try:
            num_val = float(val)
        except (ValueError, TypeError):
            raise ValueError(f"Feature '{feat}' must be numeric, got: {val}")

        if not np.isfinite(num_val):
            raise ValueError(f"Feature '{feat}' must be finite, got: {num_val}")
            
        ordered_dict[feat] = [num_val]

    return pd.DataFrame(ordered_dict, columns=EXPECTED_FEATURES)
