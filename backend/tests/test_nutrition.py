import sys
from pathlib import Path
import pytest

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from services.nutrition import evaluate_dairy_ration, predict_nutritional_parameters


def test_case_1_early_lactation_adequate_ration():
    """CASE 1: Early lactation + adequate ration -> Should produce appropriate requirement and OPTIMAL status."""
    nutritional_data = {"crude_protein_pct": 17.5, "dry_matter_pct": 35.0, "ndf_pct": 34.0}
    profile = {
        "lactating_animals": 10,
        "dry_animals": 0,
        "daily_milk_yield_liters": 15.0,
        "lactation_stage": "early_lactation",
        "ration_group": "lactating"
    }
    # Feed basket configured to supply 17.2% DM-weighted CP and sufficient DMI (~188 kg DM total for 10 cows = 18.8 kg/cow)
    feed_basket = [
        {"name": "Maize Silage", "quantity_kg": 250, "dm_pct": 35.0, "cp_pct": 9.0},     # 87.5 kg DM, 7.875 kg CP
        {"name": "Mustard Oil Cake", "quantity_kg": 50, "dm_pct": 90.0, "cp_pct": 35.0}, # 45.0 kg DM, 15.75 kg CP
        {"name": "Commercial Feed", "quantity_kg": 60, "dm_pct": 90.0, "cp_pct": 20.0},  # 54.0 kg DM, 10.8 kg CP
    ]

    res = evaluate_dairy_ration(nutritional_data, profile, feed_basket)
    ration = res["ration_analysis"]

    assert ration["lactation_stage"] == "early_lactation"
    assert ration["target_cp_pct"] == 17.0
    assert ration["required_dmi_per_animal_kg"] == 18.8  # 14.0 + 0.32 * 15.0
    assert ration["cp_status"] in ["OPTIMAL", "EXCESS"]
    assert "Early Lactation" in ration["stage_name"]


def test_case_2_early_lactation_deficient_ration():
    """CASE 2: Early lactation + protein-deficient ration -> Should detect CP deficit and generate advisory."""
    nutritional_data = {"crude_protein_pct": 8.0, "dry_matter_pct": 35.0, "ndf_pct": 46.0}
    profile = {
        "lactating_animals": 10,
        "dry_animals": 0,
        "daily_milk_yield_liters": 15.0,
        "lactation_stage": "early_lactation",
        "ration_group": "lactating"
    }
    # Low-protein feed basket (Wheat Straw + low CP Silage) -> ~8.5% weighted CP vs 17.0% target
    feed_basket = [
        {"name": "Maize Silage", "quantity_kg": 200, "dm_pct": 35.0, "cp_pct": 8.0},    # 70 kg DM, 5.6 kg CP
        {"name": "Wheat Straw", "quantity_kg": 100, "dm_pct": 88.0, "cp_pct": 4.0},     # 88 kg DM, 3.52 kg CP
    ]

    res = evaluate_dairy_ration(nutritional_data, profile, feed_basket)
    ration = res["ration_analysis"]

    assert ration["cp_status"] == "DEFICIENT"
    assert ration["overall_status"] == "DEFICIENT"
    assert ration["cp_gap_pct"] > 5.0
    assert "Crude Protein deficit" in res["dairy_interpretation"]


def test_case_3_dry_period():
    """CASE 3: Dry period -> Should use dry-animal requirement configuration (11.5% target CP, 11.0 kg/cow DMI)."""
    nutritional_data = {"crude_protein_pct": 10.0, "dry_matter_pct": 35.0, "ndf_pct": 42.0}
    profile = {
        "lactating_animals": 0,
        "dry_animals": 8,
        "daily_milk_yield_liters": 0.0,
        "lactation_stage": "dry_period",
        "ration_group": "dry"
    }
    feed_basket = [
        {"name": "Green Fodder", "quantity_kg": 200, "dm_pct": 22.0, "cp_pct": 11.5},
        {"name": "Wheat Straw", "quantity_kg": 50, "dm_pct": 88.0, "cp_pct": 4.5},
    ]

    res = evaluate_dairy_ration(nutritional_data, profile, feed_basket)
    ration = res["ration_analysis"]

    assert ration["lactation_stage"] == "dry_period"
    assert ration["target_cp_pct"] == 11.5
    assert ration["required_dmi_per_animal_kg"] == 11.0
    assert ration["required_dm_total_kg"] == 88.0  # 11.0 * 8
    assert "Dry Period" in ration["stage_name"]


def test_case_4_multiple_animals_scaling():
    """CASE 4: Multiple animals -> Verify herd-level requirements scale correctly with animal count."""
    nutritional_data = {"crude_protein_pct": 15.0, "dry_matter_pct": 35.0, "ndf_pct": 36.0}
    
    profile_5 = {"lactating_animals": 5, "daily_milk_yield_liters": 10.0, "lactation_stage": "mid_lactation"}
    profile_50 = {"lactating_animals": 50, "daily_milk_yield_liters": 10.0, "lactation_stage": "mid_lactation"}

    basket_single_cow = [
        {"name": "Silage", "quantity_kg": 25, "dm_pct": 35.0, "cp_pct": 9.0},
        {"name": "Concentrate", "quantity_kg": 7, "dm_pct": 90.0, "cp_pct": 20.0},
    ]

    basket_5 = [{"name": b["name"], "quantity_kg": b["quantity_kg"] * 5, "dm_pct": b["dm_pct"], "cp_pct": b["cp_pct"]} for b in basket_single_cow]
    basket_50 = [{"name": b["name"], "quantity_kg": b["quantity_kg"] * 50, "dm_pct": b["dm_pct"], "cp_pct": b["cp_pct"]} for b in basket_single_cow]

    res_5 = evaluate_dairy_ration(nutritional_data, profile_5, basket_5)["ration_analysis"]
    res_50 = evaluate_dairy_ration(nutritional_data, profile_50, basket_50)["ration_analysis"]

    assert res_50["required_dm_total_kg"] == res_5["required_dm_total_kg"] * 10
    assert res_50["required_cp_total_kg"] == res_5["required_cp_total_kg"] * 10
    assert res_50["available_dm_total_kg"] == res_5["available_dm_total_kg"] * 10
    assert res_50["basket_weighted_cp_pct"] == res_5["basket_weighted_cp_pct"]


def test_case_5_measured_nir_values_flow():
    """CASE 5: Measured NIR DM/CP values -> Verify NIR predictions flow into ration calculation."""
    chemometrics_result = predict_nutritional_parameters(feed_type="Maize Silage", scenario="healthy")
    
    cp_measured = round(float(chemometrics_result["crude_protein_pct"]), 1)
    dm_measured = round(float(chemometrics_result["dry_matter_pct"]), 1)

    profile = {"lactating_animals": 10, "daily_milk_yield_liters": 12.0, "lactation_stage": "mid_lactation"}
    
    feed_basket = [
        {"name": "Maize Silage", "quantity_kg": 200, "dm_pct": dm_measured, "cp_pct": cp_measured, "data_source": "CHEMOMETRICS PLSR MODEL"},
    ]

    res = evaluate_dairy_ration(chemometrics_result, profile, feed_basket)
    ration = res["ration_analysis"]

    assert ration["tested_feed_cp_pct"] == cp_measured
    assert ration["tested_feed_dm_pct"] == dm_measured
    assert ration["ingredient_breakdown"][0]["cp_pct"] == cp_measured
    assert ration["ingredient_breakdown"][0]["dm_pct"] == dm_measured
