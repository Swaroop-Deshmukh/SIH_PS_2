import hashlib
import numpy as np

def generate_nir_spectrum(feed_type: str = "Maize Silage", scenario: str = "healthy"):
    """
    Generates simulated NIR reflectance spectra across 5 sampling points (800nm - 1050nm in 10nm steps).
    Returns 5 spectra dicts with wavelengths and reflectance values, standard deviation, and spectral fit.
    """
    wavelengths = list(range(800, 1060, 10))
    
    # Base reflectance pattern for feed types
    base_reflectance = {
        "Maize Silage": [0.42, 0.44, 0.47, 0.51, 0.53, 0.50, 0.46, 0.43, 0.41, 0.45, 0.49, 0.54, 0.57, 0.55, 0.52, 0.48, 0.45, 0.43, 0.46, 0.50, 0.53],
        "Green Fodder": [0.38, 0.40, 0.43, 0.48, 0.50, 0.47, 0.43, 0.40, 0.38, 0.42, 0.46, 0.51, 0.54, 0.52, 0.49, 0.45, 0.42, 0.40, 0.43, 0.47, 0.50],
        "Dry Fodder":   [0.55, 0.58, 0.61, 0.65, 0.67, 0.64, 0.60, 0.57, 0.55, 0.59, 0.63, 0.68, 0.70, 0.68, 0.65, 0.61, 0.58, 0.56, 0.59, 0.63, 0.66],
        "Concentrate":  [0.30, 0.32, 0.35, 0.39, 0.42, 0.40, 0.37, 0.34, 0.32, 0.36, 0.40, 0.45, 0.48, 0.46, 0.43, 0.39, 0.36, 0.34, 0.37, 0.41, 0.44]
    }.get(feed_type, [0.40] * 21)

    # The feed reference curves contain 21 values (800-1000 nm). Extend them
    # conservatively to the advertised 1050 nm range so each wavelength has a
    # corresponding measurement. These remain simulated reference curves.
    base_reflectance = np.interp(
        wavelengths,
        list(range(800, 1010, 10)),
        base_reflectance,
        left=base_reflectance[0],
        right=base_reflectance[-1],
    ).tolist()

    points = []
    
    seed = int.from_bytes(hashlib.sha256(f"{feed_type}|{scenario}".encode()).digest()[:4], "big")
    rng = np.random.default_rng(seed)

    for i in range(1, 6):
        # Apply scenario-specific variance
        if scenario == "healthy":
            point_variance = rng.normal(0, 0.008, len(base_reflectance))
        elif scenario == "heterogeneous":
            # Significant variance across sampling points (e.g. wet vs dry spots)
            mult = 1.0 + (i - 3) * 0.12
            point_variance = rng.normal(0, 0.03, len(base_reflectance)) + (np.array(base_reflectance) * (mult - 1.0))
        elif scenario == "ood":
            # Out-of-distribution: Wavelength shift / unexpected chemical absorption peak around 940nm
            point_variance = rng.normal(0, 0.01, len(base_reflectance))
            point_variance[14:18] += 0.25  # Severe uncalibrated peak
        elif scenario == "adulteration":
            # Urea / Silica adulteration peak around 910nm and 1020nm
            point_variance = rng.normal(0, 0.015, len(base_reflectance))
            point_variance[11] -= 0.18 # 910 nm demo anomaly; simulation is not chemical confirmation
            point_variance[22] -= 0.12 # 1020 nm demo anomaly
        elif scenario == "storage_warning":
            # Moisture shift (higher water absorption at 970nm)
            point_variance = rng.normal(0, 0.01, len(base_reflectance))
            point_variance[17:20] += 0.12
        else:
            point_variance = rng.normal(0, 0.01, len(base_reflectance))
            
        point_reflectance = [round(float(np.clip(b + v, 0.1, 0.9)), 4) for b, v in zip(base_reflectance, point_variance)]
        points.append({
            "point_id": f"Sampling Point {i}",
            "reflectance": point_reflectance
        })

    return {
        "wavelengths": wavelengths,
        "points": points,
        "scenario": scenario
    }


def generate_cv_screening(feed_type: str = "Maize Silage", scenario: str = "healthy"):
    """
    Simulates Computer Vision camera visual screening of feed sample.
    Returns visual anomaly score, mould indication, foreign material indication, and texture score.
    """
    if scenario == "healthy":
        return {
            "visual_anomaly_detected": False,
            "anomaly_score": 4.2, # 0 to 100
            "mould_risk_level": "LOW",
            "mould_coverage_pct": 0.2,
            "foreign_material_detected": False,
            "texture_uniformity": 94.5,
            "color_consistency_score": 96.0,
            "screening_summary": "Visually uniform sample with natural coloration and optimal particle size."
        }
    elif scenario == "heterogeneous":
        return {
            "visual_anomaly_detected": True,
            "anomaly_score": 38.0,
            "mould_risk_level": "LOW-MEDIUM",
            "mould_coverage_pct": 1.5,
            "foreign_material_detected": False,
            "texture_uniformity": 62.0,
            "color_consistency_score": 58.5,
            "screening_summary": "Moderate particle size heterogeneity detected across sample core layers."
        }
    elif scenario == "ood":
        return {
            "visual_anomaly_detected": True,
            "anomaly_score": 72.0,
            "mould_risk_level": "UNKNOWN",
            "mould_coverage_pct": 0.0,
            "foreign_material_detected": True,
            "texture_uniformity": 41.0,
            "color_consistency_score": 45.0,
            "screening_summary": "Unusual spectral-color signature mismatch detected. Sample texture diverges from standard calibration database."
        }
    elif scenario == "storage_warning":
        return {
            "visual_anomaly_detected": True,
            "anomaly_score": 68.5,
            "mould_risk_level": "HIGH",
            "mould_coverage_pct": 12.4,
            "foreign_material_detected": False,
            "texture_uniformity": 78.0,
            "color_consistency_score": 52.0,
            "screening_summary": "Surface discoloration and localized fungal/mould mycelia patches indicated on upper silage layer."
        }
    elif scenario == "adulteration":
        return {
            "visual_anomaly_detected": True,
            "anomaly_score": 84.0,
            "mould_risk_level": "LOW",
            "mould_coverage_pct": 0.5,
            "foreign_material_detected": True,
            "texture_uniformity": 48.0,
            "color_consistency_score": 61.0,
            "screening_summary": "Simulated anomaly flag only. No image model or chemical test is connected; urea or silica is not confirmed."
        }
    return {
        "visual_anomaly_detected": False,
        "anomaly_score": 5.0,
        "mould_risk_level": "LOW",
        "mould_coverage_pct": 0.1,
        "foreign_material_detected": False,
        "texture_uniformity": 95.0,
        "color_consistency_score": 95.0,
        "screening_summary": "Normal sample appearance."
    }


def generate_storage_telemetry(scenario: str = "healthy"):
    """
    Simulates real-time telemetry from storage sensors (pH, temperature, moisture, humidity, exposure).
    """
    if scenario == "storage_warning":
        return {
            "ph": 4.8, # Elevated (ideal silage pH is 3.8 - 4.2)
            "temperature_celsius": 33.4,
            "humidity_pct": 79.2,
            "moisture_pct": 68.5,
            "exposure_days": 21,
            "spoilage_risk_index": 76,
            "status": "CRITICAL_WARNING",
            "telemetry_badge": "SIMULATED STORAGE TELEMETRY"
        }
    elif scenario == "adulteration":
        return {
            "ph": 6.8, # Abnormally high pH due to suspected urea hydrolysis
            "temperature_celsius": 28.1,
            "humidity_pct": 64.0,
            "moisture_pct": 61.0,
            "exposure_days": 10,
            "spoilage_risk_index": 55,
            "status": "ANOMALOUS_pH",
            "telemetry_badge": "SIMULATED STORAGE TELEMETRY"
        }
    else:
        return {
            "ph": 4.0,
            "temperature_celsius": 24.5,
            "humidity_pct": 62.0,
            "moisture_pct": 63.5,
            "exposure_days": 14,
            "spoilage_risk_index": 12,
            "status": "STABLE",
            "telemetry_badge": "SIMULATED STORAGE TELEMETRY"
        }
