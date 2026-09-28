from typing import Dict, Any, List, Optional, Union
import numpy as np
from services.chemometrics import get_chemometrics_engine
from services.simulator import generate_nir_spectrum


def predict_nutritional_parameters(
    feed_type: str = "Maize Silage",
    scenario: str = "healthy",
    nir_data: Optional[Dict[str, Any]] = None,
    spectrum: Optional[Union[List[float], np.ndarray]] = None,
) -> Dict[str, Any]:
    """
    Chemometrics Nutritional Inference (ISO 12099 / ASTM E1655):
    Predicts Dry Matter (DM %), Moisture %, Crude Protein (CP %), NDF %, and ADF %
    from preprocessed diffuse reflectance NIR spectra using trained Partial Least Squares
    Regression (PLSR) models and calculates real Mahalanobis calibration domain distance (D_M).
    """
    engine = get_chemometrics_engine()

    if spectrum is not None:
        return engine.predict_spectrum(spectrum, feed_type=feed_type)

    if nir_data is not None and "points" in nir_data:
        return engine.predict_multi_point(nir_data, feed_type=feed_type)

    # Generate scenario NIR spectrum and run through real chemometrics PLSR model
    nir = generate_nir_spectrum(feed_type=feed_type, scenario=scenario)
    return engine.predict_multi_point(nir, feed_type=feed_type)


def evaluate_dairy_ration(nutritional_data: Dict[str, Any], dairy_profile: Dict[str, Any], feed_basket: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Level 3 Intelligence: Connects feed test results + Dairy Herd Profile + Available Feed Basket
    to calculate nutritional adequacy, crude protein gaps, and fiber balance.
    """
    lactating_count = dairy_profile.get("lactating_animals", 17)
    dry_count = dairy_profile.get("dry_animals", 7)
    total_animals = lactating_count + dry_count
    
    # Illustrative demo targets only. These are not a validated ration prescription.
    ration_group = dairy_profile.get("ration_group", "lactating")
    target_cp_pct = 11.0 if ration_group == "dry" else 13.5
    target_ndf_min = 32.0
    target_ndf_max = 40.0
    
    tested_cp = nutritional_data.get("crude_protein_pct", 8.8)
    tested_ndf = nutritional_data.get("ndf_pct", 46.2)

    # Compute weighted crude protein of feed basket
    # Ingredient CP is stored on a dry-matter basis. Weight by dry-matter
    # intake rather than as-fed kilograms to avoid mixing moisture regimes.
    total_dm_kg = sum(item.get("quantity_kg", 0) * item.get("dm_pct", 100.0) / 100.0 for item in feed_basket) or 1
    weighted_cp = sum(
        item.get("quantity_kg", 0) * item.get("dm_pct", 100.0) / 100.0 * item.get("cp_pct", 9.0)
        for item in feed_basket
    ) / total_dm_kg

    cp_gap = round(target_cp_pct - weighted_cp, 1)

    cp_status = "OPTIMAL"
    if cp_gap > 1.5:
        cp_status = "DEFICIENT"
    elif cp_gap < -2.0:
        cp_status = "EXCESS"

    fiber_status = "OPTIMAL"
    if tested_ndf > target_ndf_max:
        fiber_status = "HIGH_FIBER_RESTRICTION"
    elif tested_ndf < target_ndf_min:
        fiber_status = "LOW_FIBER_ACIDOSIS_RISK"

    return {
        "herd_summary": {
            "lactating_animals": lactating_count,
            "dry_animals": dry_count,
            "total_herd": total_animals
        },
        "ration_analysis": {
            "tested_feed_cp_pct": tested_cp,
            "basket_weighted_cp_pct": round(weighted_cp, 1),
            "target_cp_pct": target_cp_pct,
            "ration_group": ration_group,
            "basis": "Weighted crude protein on a dry-matter basis; illustrative demo targets only.",
            "cp_gap_pct": cp_gap,
            "cp_status": cp_status,
            "fiber_status": fiber_status
        },
        "dairy_interpretation": (
            f"Current ration crude protein contribution is {round(weighted_cp, 1)}% vs target requirement of {target_cp_pct}% for lactating herd. "
            + ("Review protein-rich concentrates (Oil Cake/Bran) to balance daily ration." if cp_gap > 0 else "Protein contribution is adequate.")
        )
    }
