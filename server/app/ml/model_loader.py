import json
import os
from pathlib import Path
from typing import Optional, Dict, Any
import joblib
import numpy as np

from app.core.config import settings
from app.ml.feature_builder import validate_and_order_features, EXPECTED_FEATURES

class ModelService:
    _instance = None

    def __init__(self):
        self.model = None
        self.metadata: Dict[str, Any] = {}
        self.is_loaded = False
        self.load_error: Optional[str] = None
        self.load_model()

    def load_model(self):
        model_path = Path(settings.MODEL_PATH)
        metadata_path = Path(settings.METADATA_PATH)

        if not model_path.exists():
            self.load_error = f"Model artifact not found at {model_path}"
            self.is_loaded = False
            return

        try:
            self.model = joblib.load(model_path)
            self.is_loaded = True
            self.load_error = None
        except Exception as e:
            self.load_error = f"Failed to load model: {str(e)}"
            self.is_loaded = False
            self.model = None

        if metadata_path.exists():
            try:
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                self.metadata = {
                    "model_version": "rf_demand_v1.0",
                    "features": EXPECTED_FEATURES,
                    "metrics": {"mae": 0.0, "rmse": 0.0, "r2_score": 0.0, "accuracy_pct": 0.0},
                    "note": f"Error reading metadata: {str(e)}"
                }
        else:
            self.metadata = {
                "model_version": "rf_demand_v1.0",
                "features": EXPECTED_FEATURES,
                "metrics": {"mae": 0.0, "rmse": 0.0, "r2_score": 0.0, "accuracy_pct": 0.0}
            }

    def predict(self, features: Dict[str, Any]) -> float:
        if not self.is_loaded or self.model is None:
            raise RuntimeError(f"ML Model is not loaded: {self.load_error or 'Unknown error'}")

        # Validate and arrange in exact 10-feature training order
        features_vector = validate_and_order_features(features)
        
        # Predict cash demand
        raw_pred = self.model.predict(features_vector)[0]
        # Cash demand cannot be negative
        predicted_demand = float(max(0.0, raw_pred))
        return round(predicted_demand, 2)

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_loaded": self.is_loaded,
            "error": self.load_error,
            "metadata": self.metadata,
            "features_expected": EXPECTED_FEATURES
        }

model_service = ModelService()
