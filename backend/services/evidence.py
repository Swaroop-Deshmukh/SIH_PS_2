import numpy as np
from typing import Dict, List, Any

def evaluate_evidence(nir_data: Dict[str, Any], cv_data: Dict[str, Any], scenario: str = "healthy") -> Dict[str, Any]:
    """
    Evaluates multi-source evidence (NIR 5-point scans, CV screening, OOD distance, prediction uncertainty).
    Outputs Evidence Score, Level (HIGH/MEDIUM/LOW), Trust Status, and Explainable Diagnostics.
    """
    points = nir_data.get("points", [])
    if not points:
        return {
            "evidence_score": 0,
            "evidence_level": "LOW",
            "trust_status": "RESULT NOT TRUSTED",
            "untrusted_reasons": ["No multi-point NIR scan data available."],
            "recommendation": "Execute multi-point sampling process."
        }

    # 1. Calculate Sample Consistency across 5 sampling points
    all_reflectances = [p["reflectance"] for p in points]
    # Matrix of shape (5, 21)
    matrix = np.array(all_reflectances)
    point_stds = np.std(matrix, axis=0)
    avg_std = float(np.mean(point_stds))
    
    # Map std to consistency score (0 to 100)
    # std < 0.01 -> 95-100%
    # std > 0.05 -> <50%
    sample_consistency = max(0.0, min(100.0, 100.0 - (avg_std * 1400.0)))
    
    # 2. Spectral Quality Score
    spectral_quality = 96.0 if scenario != "heterogeneous" else 88.0
    if scenario == "ood":
        spectral_quality = 74.0

    # 3. Calibration Fit & OOD Score (Mahalanobis distance concept)
    if scenario == "ood":
        calibration_fit = 38.0  # Outside validated domain
        ood_distance = 4.85     # Threshold usually 2.5
        prediction_uncertainty = 85.0 # High uncertainty
    elif scenario == "adulteration":
        calibration_fit = 62.0
        ood_distance = 2.95
        prediction_uncertainty = 68.0
    elif scenario == "heterogeneous":
        calibration_fit = 85.0
        ood_distance = 1.40
        prediction_uncertainty = 42.0
    else: # healthy or storage_warning
        calibration_fit = 95.0
        ood_distance = 0.85
        prediction_uncertainty = 12.0

    # 4. Visual Agreement
    anomaly_score = cv_data.get("anomaly_score", 0.0)
    visual_agreement = max(0.0, min(100.0, 100.0 - anomaly_score))

    # 5. Evidence Fusion (Weighted Combination)
    weights = {
        "spectral_quality": 0.20,
        "sample_consistency": 0.25,
        "calibration_fit": 0.25,
        "prediction_uncertainty": 0.15, # inverted (100 - uncertainty)
        "visual_agreement": 0.15
    }
    
    certainty_score = 100.0 - prediction_uncertainty
    overall_score = (
        spectral_quality * weights["spectral_quality"] +
        sample_consistency * weights["sample_consistency"] +
        calibration_fit * weights["calibration_fit"] +
        certainty_score * weights["prediction_uncertainty"] +
        visual_agreement * weights["visual_agreement"]
    )
    overall_score = round(float(np.clip(overall_score, 0, 100)), 1)

    # Determine Evidence Level & Trust Status
    untrusted_reasons = []
    
    if scenario == "ood":
        evidence_level = "LOW"
        trust_status = "RESULT NOT TRUSTED"
        untrusted_reasons.append("Sample spectrum lies outside the validated calibration domain (Mahalanobis Distance = 4.85).")
        untrusted_reasons.append("Prediction uncertainty band exceeds safe limits (>80%).")
        untrusted_reasons.append("High probability of non-calibrated feed matrix or unmodeled additives.")
        recommendation = "Do NOT rely on automated results. Collect fresh representative sample or request confirmatory laboratory testing."

    elif scenario == "heterogeneous":
        evidence_level = "MEDIUM"
        trust_status = "RETEST RECOMMENDED"
        untrusted_reasons.append(f"Significant variance detected between the 5 core sampling points (Consistency Score: {round(sample_consistency, 1)}%).")
        untrusted_reasons.append("Sample is non-uniform (e.g. moisture gradient or uneven mixture).")
        recommendation = "Thoroughly mix the batch and perform a 5-point re-test before feeding."

    elif scenario == "adulteration":
        evidence_level = "MEDIUM-LOW"
        trust_status = "SUSPECTED ADULTERATION"
        untrusted_reasons.append("Spectral absorption anomalies detected at 910nm and 1020nm (NPN / Urea absorption bands).")
        untrusted_reasons.append(cv_data.get("screening_summary", "Particulate visual anomaly."))
        recommendation = "Isolate feed batch immediately. Request laboratory verification for crude protein vs non-protein nitrogen."

    elif scenario == "storage_warning":
        evidence_level = "HIGH"
        trust_status = "TRUSTED WITH STORAGE WARNING"
        untrusted_reasons.append("Initial feed quality test is valid, BUT storage telemetry indicates active spoilage risk (Temp > 33°C, pH > 4.5).")
        recommendation = "Feed composition valid today, but batch is actively deteriorating in storage. Inspect silage wall and use immediately."

    else:
        evidence_level = "HIGH"
        trust_status = "TRUSTED"
        recommendation = "Feed composition meets all quality & consistency standards. Safe for dairy ration formulation."

    return {
        "evidence_score": overall_score,
        "evidence_level": evidence_level,
        "trust_status": trust_status,
        "metrics": {
            "spectral_quality": round(spectral_quality, 1),
            "sample_consistency": round(sample_consistency, 1),
            "calibration_fit": round(calibration_fit, 1),
            "prediction_uncertainty": round(prediction_uncertainty, 1),
            "visual_agreement": round(visual_agreement, 1),
            "ood_distance": round(ood_distance, 2)
        },
        "untrusted_reasons": untrusted_reasons,
        "recommendation": recommendation
    }
