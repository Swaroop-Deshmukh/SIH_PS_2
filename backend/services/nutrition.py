from typing import Dict, Any, List

def predict_nutritional_parameters(feed_type: str = "Maize Silage", scenario: str = "healthy") -> Dict[str, Any]:
    """
    Level 1 Intelligence: Predicts Dry Matter (DM), Moisture, Crude Protein (CP), NDF, ADF.
    Values are benchmarked against standard Indian agricultural research standards (ICAR).
    """
    base_values = {
        "Maize Silage": {"dm": 34.5, "moisture": 65.5, "cp": 8.8, "ndf": 46.2, "adf": 26.1},
        "Green Fodder": {"dm": 22.0, "moisture": 78.0, "cp": 11.2, "ndf": 52.0, "adf": 31.0},
        "Dry Fodder":   {"dm": 88.5, "moisture": 11.5, "cp": 4.2,  "ndf": 68.0, "adf": 41.5},
        "Concentrate":  {"dm": 90.0, "moisture": 10.0, "cp": 18.5, "ndf": 28.0, "adf": 14.0}
    }.get(feed_type, {"dm": 35.0, "moisture": 65.0, "cp": 9.0, "ndf": 45.0, "adf": 26.0})

    if scenario == "adulteration":
        # Fake high crude protein reading due to non-protein nitrogen (Urea)
        return {
            "dry_matter_pct": base_values["dm"],
            "moisture_pct": base_values["moisture"],
            "crude_protein_pct": 24.8, # Unusually high for silage
            "ndf_pct": base_values["ndf"],
            "adf_pct": base_values["adf"],
            "is_simulated_data": True,
            "data_badge": "SIMULATED PROTOTYPE DATA"
        }
    elif scenario == "storage_warning":
        # Higher moisture, lower protein due to degradation
        return {
            "dry_matter_pct": 31.0,
            "moisture_pct": 69.0,
            "crude_protein_pct": 7.2,
            "ndf_pct": 51.5,
            "adf_pct": 30.2,
            "is_simulated_data": True,
            "data_badge": "SIMULATED PROTOTYPE DATA"
        }
    
    return {
        "dry_matter_pct": base_values["dm"],
        "moisture_pct": base_values["moisture"],
        "crude_protein_pct": base_values["cp"],
        "ndf_pct": base_values["ndf"],
        "adf_pct": base_values["adf"],
        "is_simulated_data": True,
        "data_badge": "SIMULATED PROTOTYPE DATA"
    }


def evaluate_dairy_ration(nutritional_data: Dict[str, Any], dairy_profile: Dict[str, Any], feed_basket: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Level 3 Intelligence: Connects feed test results + Dairy Herd Profile + Available Feed Basket
    to calculate nutritional adequacy, crude protein gaps, and fiber balance.
    """
    lactating_count = dairy_profile.get("lactating_animals", 17)
    dry_count = dairy_profile.get("dry_animals", 7)
    total_animals = lactating_count + dry_count
    
    # Target requirements per lactating cow per day
    # Approx: 14 kg DM, 13.5% CP, 32-38% NDF
    target_cp_pct = 13.5
    target_ndf_min = 32.0
    target_ndf_max = 40.0
    
    tested_cp = nutritional_data.get("crude_protein_pct", 8.8)
    tested_ndf = nutritional_data.get("ndf_pct", 46.2)

    # Compute weighted crude protein of feed basket
    total_kg = sum(item.get("quantity_kg", 0) for item in feed_basket) or 1
    weighted_cp = sum(item.get("quantity_kg", 0) * item.get("cp_pct", 9.0) for item in feed_basket) / total_kg

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
            "cp_gap_pct": cp_gap,
            "cp_status": cp_status,
            "fiber_status": fiber_status
        },
        "dairy_interpretation": (
            f"Current ration crude protein contribution is {round(weighted_cp, 1)}% vs target requirement of {target_cp_pct}% for lactating herd. "
            + ("Review protein-rich concentrates (Oil Cake/Bran) to balance daily ration." if cp_gap > 0 else "Protein contribution is adequate.")
        )
    }
