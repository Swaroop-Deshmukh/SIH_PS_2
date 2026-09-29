from typing import Dict, Any, List, Optional, Union
import numpy as np
from services.chemometrics import get_chemometrics_engine
from services.simulator import generate_nir_spectrum

# Centralized stage-specific dairy nutrition configuration (ICAR / NRC Reference Standards)
LACTATION_STAGE_SPECS: Dict[str, Dict[str, Any]] = {
    "early_lactation": {
        "name": "Early Lactation (0-100 days)",
        "target_cp_pct": 17.0,
        "cp_range": [16.5, 17.5],
        "dmi_formula": lambda milk: 14.0 + 0.32 * max(0.0, float(milk)),
        "target_ndf_min": 30.0,
        "target_ndf_max": 38.0,
        "description": "High peak milk production demand. Requires dense crude protein and energy."
    },
    "mid_lactation": {
        "name": "Mid Lactation (101-200 days)",
        "target_cp_pct": 15.0,
        "cp_range": [14.5, 15.5],
        "dmi_formula": lambda milk: 12.0 + 0.30 * max(0.0, float(milk)),
        "target_ndf_min": 32.0,
        "target_ndf_max": 40.0,
        "description": "Sustained production phase. Replenishes body weight and energy reserves."
    },
    "late_lactation": {
        "name": "Late Lactation (201+ days)",
        "target_cp_pct": 13.0,
        "cp_range": [12.5, 13.5],
        "dmi_formula": lambda milk: 10.0 + 0.28 * max(0.0, float(milk)),
        "target_ndf_min": 34.0,
        "target_ndf_max": 42.0,
        "description": "Declining milk yield. Focus on restoring body condition before dry period."
    },
    "dry_period": {
        "name": "Dry Period (Non-lactating)",
        "target_cp_pct": 11.5,
        "cp_range": [11.0, 12.0],
        "dmi_formula": lambda milk: 11.0,  # Fixed DMI maintenance requirement
        "target_ndf_min": 35.0,
        "target_ndf_max": 45.0,
        "description": "Mammary gland involution & fetal growth. Low protein, high fiber maintenance."
    }
}


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


def evaluate_dairy_ration(
    nutritional_data: Dict[str, Any],
    dairy_profile: Dict[str, Any],
    feed_basket: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Level 3 Intelligence: Connects feed test results + Stage-Specific Dairy Herd Profile + Available Feed Basket
    to calculate nutritional adequacy, crude protein gaps, dry matter intake, and fiber balance.
    """
    lactating_count = max(0, int(dairy_profile.get("lactating_animals", 10)))
    dry_count = max(0, int(dairy_profile.get("dry_animals", 0)))
    daily_milk_yield = max(0.0, float(dairy_profile.get("daily_milk_yield_liters", 12.0)))

    # Determine stage of lactation (with fallback to ration_group compatibility)
    raw_stage = str(dairy_profile.get("lactation_stage", "")).lower().replace(" ", "_")
    ration_group = str(dairy_profile.get("ration_group", "lactating")).lower()

    if raw_stage in LACTATION_STAGE_SPECS:
        stage_key = raw_stage
    elif ration_group == "dry":
        stage_key = "dry_period"
    else:
        stage_key = "early_lactation"

    spec = LACTATION_STAGE_SPECS[stage_key]
    stage_name = spec["name"]
    target_cp_pct = float(spec["target_cp_pct"])
    target_ndf_min = float(spec["target_ndf_min"])
    target_ndf_max = float(spec["target_ndf_max"])

    # Determine target herd animal count for this stage calculation
    if stage_key == "dry_period":
        animal_count = dry_count if dry_count > 0 else (lactating_count + dry_count or 1)
    else:
        animal_count = lactating_count if lactating_count > 0 else (lactating_count + dry_count or 1)

    animal_count = max(1, animal_count)

    # Calculate per-animal and total herd DMI requirement (kg/day)
    req_dmi_per_animal_kg = round(float(spec["dmi_formula"](daily_milk_yield)), 2)
    req_dm_total_kg = round(req_dmi_per_animal_kg * animal_count, 2)

    # Calculate required Crude Protein total (kg/day)
    req_cp_total_kg = round(req_dm_total_kg * (target_cp_pct / 100.0), 2)

    # Calculate available Dry Matter and Crude Protein from current feed basket
    available_dm_total_kg = 0.0
    available_cp_total_kg = 0.0

    ingredient_breakdown = []
    for item in feed_basket:
        qty_as_fed = max(0.0, float(item.get("quantity_kg", 0.0)))
        dm_pct = max(0.0, min(100.0, float(item.get("dm_pct", 100.0))))
        cp_pct = max(0.0, min(100.0, float(item.get("cp_pct", 0.0))))

        item_dm_kg = qty_as_fed * (dm_pct / 100.0)
        item_cp_kg = item_dm_kg * (cp_pct / 100.0)

        available_dm_total_kg += item_dm_kg
        available_cp_total_kg += item_cp_kg

        ingredient_breakdown.append({
            "name": str(item.get("name", "Feed Ingredient")),
            "quantity_as_fed_kg": round(qty_as_fed, 2),
            "dm_pct": round(dm_pct, 1),
            "cp_pct": round(cp_pct, 1),
            "available_dm_kg": round(item_dm_kg, 2),
            "available_cp_kg": round(item_cp_kg, 2),
            "data_source": str(item.get("data_source", "FARMER PROVIDED"))
        })

    available_dm_total_kg = round(available_dm_total_kg, 2)
    available_cp_total_kg = round(available_cp_total_kg, 2)

    # Calculate DM-weighted CP % of the current feed basket
    if available_dm_total_kg > 0:
        basket_weighted_cp_pct = round((available_cp_total_kg / available_dm_total_kg) * 100.0, 1)
        available_dmi_per_animal_kg = round(available_dm_total_kg / animal_count, 2)
    else:
        basket_weighted_cp_pct = 0.0
        available_dmi_per_animal_kg = 0.0

    # Calculate Deficits / Surpluses
    dm_deficit_surplus_kg = round(available_dm_total_kg - req_dm_total_kg, 2)
    cp_deficit_surplus_kg = round(available_cp_total_kg - req_cp_total_kg, 2)
    cp_gap_pct = round(target_cp_pct - basket_weighted_cp_pct, 1)

    # CP Adequacy Status
    if cp_gap_pct > 1.0:
        cp_status = "DEFICIENT"
    elif cp_gap_pct < -2.0:
        cp_status = "EXCESS"
    else:
        cp_status = "OPTIMAL"

    # Overall Ration Status
    if cp_status == "DEFICIENT" or dm_deficit_surplus_kg < - (req_dm_total_kg * 0.15):
        overall_status = "DEFICIENT"
    elif cp_status == "EXCESS":
        overall_status = "EXCESS"
    else:
        overall_status = "OPTIMAL"

    # Fiber adequacy status
    tested_ndf = float(nutritional_data.get("ndf_pct", 46.2))
    if tested_ndf > target_ndf_max:
        fiber_status = "HIGH_FIBER_RESTRICTION"
    elif tested_ndf < target_ndf_min:
        fiber_status = "LOW_FIBER_ACIDOSIS_RISK"
    else:
        fiber_status = "OPTIMAL"

    # Generate explainable stage-specific recommendation
    if cp_status == "DEFICIENT":
        deficit_cp_per_cow_kg = round(abs(cp_deficit_surplus_kg) / animal_count, 2)
        recommendation = (
            f"The current ration for {stage_name} has a Crude Protein deficit of {abs(cp_gap_pct)}% "
            f"({abs(cp_deficit_surplus_kg)} kg/day total herd shortfall, or {deficit_cp_per_cow_kg} kg CP/cow/day). "
            f"Increase protein-rich concentrates (such as Mustard Oil Cake or Groundnut Cake) to reach the target {target_cp_pct}% CP."
        )
    elif cp_status == "EXCESS":
        recommendation = (
            f"The current ration crude protein ({basket_weighted_cp_pct}%) exceeds the target requirement of {target_cp_pct}% for {stage_name}. "
            f"Reduce expensive protein concentrates to optimize feed costs without reducing yield."
        )
    elif dm_deficit_surplus_kg < 0:
        recommendation = (
            f"Crude protein % ({basket_weighted_cp_pct}%) is optimal, but total Dry Matter intake ({available_dm_total_kg} kg/day) "
            f"is below the required intake of {req_dm_total_kg} kg/day for {animal_count} animals ({req_dmi_per_animal_kg} kg/cow/day). "
            f"Increase total fodder bulk."
        )
    else:
        recommendation = (
            f"The current ration fully satisfies nutritional requirements for {stage_name} "
            f"(Target CP: {target_cp_pct}%, Measured Basket CP: {basket_weighted_cp_pct}%, DMI: {available_dmi_per_animal_kg} kg/cow/day). "
            f"Maintain current feed basket ratio."
        )

    return {
        "herd_summary": {
            "lactating_animals": lactating_count,
            "dry_animals": dry_count,
            "total_herd": lactating_count + dry_count,
            "evaluated_animals_count": animal_count,
            "lactation_stage": stage_key,
            "stage_name": stage_name,
            "daily_milk_yield_liters": daily_milk_yield
        },
        "ration_analysis": {
            "lactation_stage": stage_key,
            "stage_name": stage_name,
            "tested_feed_cp_pct": round(float(nutritional_data.get("crude_protein_pct", 8.8)), 1),
            "tested_feed_dm_pct": round(float(nutritional_data.get("dry_matter_pct", 34.5)), 1),
            "basket_weighted_cp_pct": basket_weighted_cp_pct,
            "target_cp_pct": target_cp_pct,
            "cp_gap_pct": cp_gap_pct,
            "required_dmi_per_animal_kg": req_dmi_per_animal_kg,
            "available_dmi_per_animal_kg": available_dmi_per_animal_kg,
            "required_dm_total_kg": req_dm_total_kg,
            "available_dm_total_kg": available_dm_total_kg,
            "dm_deficit_surplus_kg": dm_deficit_surplus_kg,
            "required_cp_total_kg": req_cp_total_kg,
            "available_cp_total_kg": available_cp_total_kg,
            "cp_deficit_surplus_kg": cp_deficit_surplus_kg,
            "cp_status": cp_status,
            "overall_status": overall_status,
            "fiber_status": fiber_status,
            "ingredient_breakdown": ingredient_breakdown,
            "basis": f"Stage-specific requirements ({stage_name}) based on NRC/ICAR dairy nutrition standards."
        },
        "dairy_interpretation": recommendation
    }
