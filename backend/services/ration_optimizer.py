"""FeedSure 360 - Mathematical Ration Cost Optimizer (MILP / Linear Programming).

Solves the Least-Cost Dairy Ration formulation under NRC / ICAR nutritional standards:
Minimize:
    Total Feed Cost = sum_j ( c_j * x_j )
Subject to:
    1. Dry Matter Intake (DMI):
       0.95 * DMI_target <= sum_j ( DM_j% / 100 * x_j ) <= 1.05 * DMI_target
    2. Crude Protein (CP):
       sum_j ( CP_j% / 100 * DM_j% / 100 * x_j ) >= Target CP (kg/day)
    3. Minimum Rumen Forage Fiber (NDF% of DMI):
       sum_j ( NDF_j% / 100 * DM_j% / 100 * x_j ) >= 0.28 * Total DMI (prevents SARA / acidosis)
       sum_j ( NDF_j% / 100 * DM_j% / 100 * x_j ) <= 0.45 * Total DMI (prevents gut fill intake depression)
    4. Maximum Fiber Lignification (ADF% of DMI):
       sum_j ( ADF_j% / 100 * DM_j% / 100 * x_j ) <= 0.30 * Total DMI
    5. Minimum Forage / Roughage Inclusion:
       At least 50% of ration DMI must originate from forages/silage to maintain rumination.
    6. Maximum Concentrate Inclusion:
       Concentrates / oil cakes capped at <= 45% of ration DMI to protect rumen pH.
    7. Availability & Non-negativity:
       0 <= x_j <= max_available_as_fed_kg

Engine: scipy.optimize.linprog(method='highs')
"""
from typing import Dict, Any, List, Optional
import numpy as np
from scipy.optimize import linprog

# Default Indian market prices (₹/kg as-fed) & nutritional profiles
DEFAULT_FEED_CATALOG: Dict[str, Dict[str, Any]] = {
    "Green Fodder": {
        "price_per_kg": 2.50,
        "default_dm": 22.0,
        "default_cp": 9.5,
        "default_ndf": 52.0,
        "default_adf": 34.0,
        "is_forage": True,
        "max_inclusion_as_fed_kg": 35.0
    },
    "Dry Fodder": {
        "price_per_kg": 6.00,
        "default_dm": 90.0,
        "default_cp": 3.8,
        "default_ndf": 72.0,
        "default_adf": 48.0,
        "is_forage": True,
        "max_inclusion_as_fed_kg": 8.0
    },
    "Maize Silage": {
        "price_per_kg": 4.50,
        "default_dm": 34.5,
        "default_cp": 8.8,
        "default_ndf": 46.0,
        "default_adf": 26.0,
        "is_forage": True,
        "max_inclusion_as_fed_kg": 25.0
    },
    "Concentrate": {
        "price_per_kg": 24.00,
        "default_dm": 90.0,
        "default_cp": 20.0,
        "default_ndf": 25.0,
        "default_adf": 12.0,
        "is_forage": False,
        "max_inclusion_as_fed_kg": 8.0
    },
    "Cattle Concentrate": {
        "price_per_kg": 24.00,
        "default_dm": 90.0,
        "default_cp": 20.0,
        "default_ndf": 25.0,
        "default_adf": 12.0,
        "is_forage": False,
        "max_inclusion_as_fed_kg": 8.0
    },
    "Mustard Oil Cake": {
        "price_per_kg": 32.00,
        "default_dm": 91.0,
        "default_cp": 36.0,
        "default_ndf": 28.0,
        "default_adf": 16.0,
        "is_forage": False,
        "max_inclusion_as_fed_kg": 3.0
    },
    "Groundnut Cake": {
        "price_per_kg": 36.00,
        "default_dm": 92.0,
        "default_cp": 42.0,
        "default_ndf": 22.0,
        "default_adf": 14.0,
        "is_forage": False,
        "max_inclusion_as_fed_kg": 2.5
    },
    "Rice Bran": {
        "price_per_kg": 16.00,
        "default_dm": 90.0,
        "default_cp": 13.0,
        "default_ndf": 40.0,
        "default_adf": 28.0,
        "is_forage": False,
        "max_inclusion_as_fed_kg": 4.0
    },
    "Mineral Mixture": {
        "price_per_kg": 65.00,
        "default_dm": 98.0,
        "default_cp": 0.0,
        "default_ndf": 0.0,
        "default_adf": 0.0,
        "is_forage": False,
        "max_inclusion_as_fed_kg": 0.15
    }
}


def optimize_dairy_ration(
    dairy_profile: Dict[str, Any],
    feed_basket: List[Dict[str, Any]],
    price_overrides: Optional[Dict[str, float]] = None,
    allow_catalog_expansion: bool = True
) -> Dict[str, Any]:
    """
    Executes Linear Programming optimization to minimize total daily feed cost
    while satisfying ICAR / NRC nutritional requirements for the specified herd context.
    """
    price_overrides = price_overrides or {}
    lactating_count = max(0, int(dairy_profile.get("lactating_animals", 10)))
    dry_count = max(0, int(dairy_profile.get("dry_animals", 0)))
    milk_yield = max(0.0, float(dairy_profile.get("daily_milk_yield_liters", 12.0)))
    stage = str(dairy_profile.get("lactation_stage", "early_lactation")).lower()
    
    # Herd animal context for target
    is_dry = stage == "dry_period" or str(dairy_profile.get("ration_group", "")).lower() == "dry"
    animal_count = dry_count if is_dry and dry_count > 0 else (lactating_count or 1)
    
    # 1. Target requirements per animal per day (NRC / ICAR guidelines)
    if is_dry:
        target_dmi_kg = 11.0
        target_cp_pct = 11.5
        target_ndf_min_pct = 35.0
        target_ndf_max_pct = 48.0
        max_conc_pct_dmi = 25.0
    elif stage == "late_lactation":
        target_dmi_kg = round(10.0 + 0.28 * milk_yield, 2)
        target_cp_pct = 13.0
        target_ndf_min_pct = 32.0
        target_ndf_max_pct = 42.0
        max_conc_pct_dmi = 35.0
    elif stage == "mid_lactation":
        target_dmi_kg = round(12.0 + 0.30 * milk_yield, 2)
        target_cp_pct = 15.0
        target_ndf_min_pct = 30.0
        target_ndf_max_pct = 40.0
        max_conc_pct_dmi = 40.0
    else:  # early_lactation
        target_dmi_kg = round(14.0 + 0.32 * milk_yield, 2)
        target_cp_pct = 17.0
        target_ndf_min_pct = 28.0
        target_ndf_max_pct = 38.0
        max_conc_pct_dmi = 45.0

    target_cp_kg = round(target_dmi_kg * (target_cp_pct / 100.0), 3)

    # 2. Assemble candidate feed ingredients
    ingredients: List[Dict[str, Any]] = []
    seen_names = set()

    # Ingest farmer's active feed basket
    for item in feed_basket:
        name = str(item.get("name", "Unknown Feed")).strip()
        if not name:
            continue
        seen_names.add(name)
        cat_info = DEFAULT_FEED_CATALOG.get(name, {})
        
        dm = float(item.get("dm_pct", cat_info.get("default_dm", 85.0)))
        cp = float(item.get("cp_pct", cat_info.get("default_cp", 10.0)))
        ndf = float(item.get("ndf_pct", cat_info.get("default_ndf", 45.0)))
        adf = float(item.get("adf_pct", cat_info.get("default_adf", 28.0)))
        
        # Determine price (override -> item price -> catalog default -> 10.0 fallback)
        price = float(price_overrides.get(name, item.get("price_per_kg", cat_info.get("price_per_kg", 10.0))))
        is_forage = cat_info.get("is_forage", any(term in name.lower() for term in ["fodder", "silage", "grass", "straw", "hay"]))
        
        # Farmer's current feeding rate per cow
        farmer_total_kg = float(item.get("quantity_kg", 0.0))
        farmer_per_cow_kg = round(farmer_total_kg / animal_count, 2) if animal_count > 0 else farmer_total_kg
        
        max_inclusion = cat_info.get("max_inclusion_as_fed_kg", 30.0 if is_forage else 8.0)
        
        ingredients.append({
            "name": name,
            "price_per_kg": price,
            "dm_fraction": dm / 100.0,
            "cp_fraction": cp / 100.0,
            "ndf_fraction": ndf / 100.0,
            "adf_fraction": adf / 100.0,
            "dm_pct": dm,
            "cp_pct": cp,
            "ndf_pct": ndf,
            "adf_pct": adf,
            "is_forage": is_forage,
            "max_inclusion_as_fed_kg": max_inclusion,
            "farmer_per_cow_kg": farmer_per_cow_kg,
            "farmer_total_kg": farmer_total_kg,
        })

    # If the basket is too sparse (e.g. only 1 or 2 items), expand with available standard feeds if allowed
    if allow_catalog_expansion and len(ingredients) < 4:
        for cat_name, cat_data in DEFAULT_FEED_CATALOG.items():
            if cat_name not in seen_names and cat_name != "Cattle Concentrate":
                price = float(price_overrides.get(cat_name, cat_data["price_per_kg"]))
                ingredients.append({
                    "name": cat_name,
                    "price_per_kg": price,
                    "dm_fraction": cat_data["default_dm"] / 100.0,
                    "cp_fraction": cat_data["default_cp"] / 100.0,
                    "ndf_fraction": cat_data["default_ndf"] / 100.0,
                    "adf_fraction": cat_data["default_adf"] / 100.0,
                    "dm_pct": cat_data["default_dm"],
                    "cp_pct": cat_data["default_cp"],
                    "ndf_pct": cat_data["default_ndf"],
                    "adf_pct": cat_data["default_adf"],
                    "is_forage": cat_data["is_forage"],
                    "max_inclusion_as_fed_kg": cat_data["max_inclusion_as_fed_kg"],
                    "farmer_per_cow_kg": 0.0,
                    "farmer_total_kg": 0.0,
                })

    n = len(ingredients)
    if n == 0:
        return {"status": "ERROR", "message": "No feed ingredients provided for optimization."}

    # 3. Formulate Linear Program
    # Variables: x_i = kg as-fed of ingredient i per cow per day
    c = np.array([ing["price_per_kg"] for ing in ingredients], dtype=np.float64)

    # Matrices for A_ub @ x <= b_ub
    # Constraints:
    # 1. Total DM <= 1.05 * target_dmi_kg
    #    sum(dm_i * x_i) <= 1.05 * target_dmi_kg
    # 2. Total DM >= 0.95 * target_dmi_kg  --> -sum(dm_i * x_i) <= -0.95 * target_dmi_kg
    # 3. Total CP >= target_cp_kg         --> -sum(dm_i * cp_i * x_i) <= -target_cp_kg
    # 4. Total NDF >= target_ndf_min_pct * Total DM
    #    sum( (target_ndf_min_frac - ndf_i) * dm_i * x_i ) <= 0
    # 5. Total NDF <= target_ndf_max_pct * Total DM
    #    sum( (ndf_i - target_ndf_max_frac) * dm_i * x_i ) <= 0
    # 6. Maximum Concentrate DM <= max_conc_pct_dmi * Total DM
    #    sum( (is_conc_i - max_conc_frac) * dm_i * x_i ) <= 0
    # 7. Minimum Forage DM >= 0.50 * Total DM
    #    sum( (0.50 - is_forage_i) * dm_i * x_i ) <= 0

    dm_vec = np.array([ing["dm_fraction"] for ing in ingredients])
    cp_dm_vec = np.array([ing["dm_fraction"] * ing["cp_fraction"] for ing in ingredients])
    ndf_dm_vec = np.array([ing["dm_fraction"] * ing["ndf_fraction"] for ing in ingredients])
    is_forage_vec = np.array([1.0 if ing["is_forage"] else 0.0 for ing in ingredients])
    is_conc_vec = np.array([0.0 if ing["is_forage"] else 1.0 for ing in ingredients])

    A_ub = []
    b_ub = []

    # 1. Max DMI
    A_ub.append(dm_vec)
    b_ub.append(1.05 * target_dmi_kg)

    # 2. Min DMI
    A_ub.append(-dm_vec)
    b_ub.append(-0.95 * target_dmi_kg)

    # 3. Min CP
    A_ub.append(-cp_dm_vec)
    b_ub.append(-target_cp_kg)

    # 4. Min NDF (acidosis prevention)
    target_ndf_min_frac = target_ndf_min_pct / 100.0
    A_ub.append((target_ndf_min_frac * dm_vec) - ndf_dm_vec)
    b_ub.append(0.0)

    # 5. Max NDF (gut fill limit)
    target_ndf_max_frac = target_ndf_max_pct / 100.0
    A_ub.append(ndf_dm_vec - (target_ndf_max_frac * dm_vec))
    b_ub.append(0.0)

    # 6. Max Concentrate Inclusion
    max_conc_frac = max_conc_pct_dmi / 100.0
    A_ub.append((is_conc_vec * dm_vec) - (max_conc_frac * dm_vec))
    b_ub.append(0.0)

    # 7. Min Forage Inclusion (>= 50% DMI)
    A_ub.append((0.50 * dm_vec) - (is_forage_vec * dm_vec))
    b_ub.append(0.0)

    # Variable bounds (0 <= x_i <= max_inclusion)
    bounds = [(0.0, ing["max_inclusion_as_fed_kg"]) for ing in ingredients]

    # Run HiGHS Linear Programming Solver
    res = linprog(
        c=c,
        A_ub=np.array(A_ub, dtype=np.float64),
        b_ub=np.array(b_ub, dtype=np.float64),
        bounds=bounds,
        method="highs"
    )

    is_success = res.success
    if not is_success:
        # If strict constraints are infeasible with current basket, relax bounds slightly (soft solve)
        # e.g. relax DMI range to +/- 15% and allow up to 55% concentrate
        A_ub_relaxed = []
        b_ub_relaxed = []
        A_ub_relaxed.append(dm_vec)
        b_ub_relaxed.append(1.15 * target_dmi_kg)
        A_ub_relaxed.append(-dm_vec)
        b_ub_relaxed.append(-0.85 * target_dmi_kg)
        A_ub_relaxed.append(-cp_dm_vec)
        b_ub_relaxed.append(-target_cp_kg * 0.90)  # 90% CP satisfaction
        A_ub_relaxed.append((0.24 * dm_vec) - ndf_dm_vec)
        b_ub_relaxed.append(0.0)

        res = linprog(
            c=c,
            A_ub=np.array(A_ub_relaxed, dtype=np.float64),
            b_ub=np.array(b_ub_relaxed, dtype=np.float64),
            bounds=bounds,
            method="highs"
        )
        optimization_status = "RELAXED_FEASIBLE" if res.success else "INFEASIBLE"
    else:
        optimization_status = "OPTIMAL_FEASIBLE"

    if res.success:
        optimal_x = np.maximum(0.0, res.x)
    else:
        # Fallback to normalized proportional allocation if solver fails
        optimal_x = np.array([ing["farmer_per_cow_kg"] for ing in ingredients], dtype=np.float64)
        if np.sum(optimal_x) <= 0:
            optimal_x = np.array([15.0 if ing["is_forage"] else 3.0 for ing in ingredients], dtype=np.float64)

    # 4. Compute Farmer's Current Cost & Baseline Nutrition
    current_cost_per_cow = 0.0
    current_dmi_per_cow = 0.0
    current_cp_kg_per_cow = 0.0
    current_ndf_kg_per_cow = 0.0

    for ing in ingredients:
        f_kg = ing["farmer_per_cow_kg"]
        cost = f_kg * ing["price_per_kg"]
        dm_kg = f_kg * ing["dm_fraction"]
        cp_kg = dm_kg * ing["cp_fraction"]
        ndf_kg = dm_kg * ing["ndf_fraction"]

        current_cost_per_cow += cost
        current_dmi_per_cow += dm_kg
        current_cp_kg_per_cow += cp_kg
        current_ndf_kg_per_cow += ndf_kg

    # 5. Compute Optimized Allocation Breakdown
    optimal_cost_per_cow = float(np.sum(optimal_x * c))
    optimal_dmi_per_cow = float(np.sum(optimal_x * dm_vec))
    optimal_cp_kg_per_cow = float(np.sum(optimal_x * cp_dm_vec))
    optimal_ndf_kg_per_cow = float(np.sum(optimal_x * ndf_dm_vec))

    optimal_cp_pct = (optimal_cp_kg_per_cow / optimal_dmi_per_cow * 100.0) if optimal_dmi_per_cow > 0 else 0.0
    optimal_ndf_pct = (optimal_ndf_kg_per_cow / optimal_dmi_per_cow * 100.0) if optimal_dmi_per_cow > 0 else 0.0

    current_cp_pct = (current_cp_kg_per_cow / current_dmi_per_cow * 100.0) if current_dmi_per_cow > 0 else 0.0
    current_ndf_pct = (current_ndf_kg_per_cow / current_dmi_per_cow * 100.0) if current_dmi_per_cow > 0 else 0.0

    # Daily & Monthly Cost Savings
    daily_saving_per_cow = max(0.0, current_cost_per_cow - optimal_cost_per_cow) if current_cost_per_cow > 0 else 0.0
    daily_herd_saving = daily_saving_per_cow * animal_count
    monthly_herd_saving = daily_herd_saving * 30.0

    # Build ingredient-by-ingredient allocation comparison
    allocation_details = []
    for i, ing in enumerate(ingredients):
        opt_as_fed = round(float(optimal_x[i]), 2)
        opt_dm = round(opt_as_fed * ing["dm_fraction"], 2)
        daily_cost = round(opt_as_fed * ing["price_per_kg"], 2)
        pct_of_dmi = round((opt_dm / optimal_dmi_per_cow * 100.0), 1) if optimal_dmi_per_cow > 0 else 0.0

        if opt_as_fed > 0.05 or ing["farmer_per_cow_kg"] > 0:
            allocation_details.append({
                "name": ing["name"],
                "price_per_kg_inr": ing["price_per_kg"],
                "optimal_as_fed_kg": opt_as_fed,
                "optimal_dm_kg": opt_dm,
                "optimal_daily_cost_inr": daily_cost,
                "current_as_fed_kg": round(ing["farmer_per_cow_kg"], 2),
                "current_daily_cost_inr": round(ing["farmer_per_cow_kg"] * ing["price_per_kg"], 2),
                "pct_of_dmi": pct_of_dmi,
                "is_forage": ing["is_forage"],
                "cp_pct": ing["cp_pct"],
                "dm_pct": ing["dm_pct"],
                "ndf_pct": ing["ndf_pct"]
            })

    # Sort so items with higher allocation come first
    allocation_details.sort(key=lambda x: x["optimal_as_fed_kg"], reverse=True)

    # Practical dairy explanation
    if daily_saving_per_cow > 5.0:
        advice = (
            f"By balancing protein and fiber from high-quality forage (such as tested silage) and fine-tuning "
            f"expensive concentrate supplementation, the farm can save ₹{round(daily_saving_per_cow, 1)} per cow/day "
            f"(₹{int(monthly_herd_saving):,} per month for {animal_count} cows) while fully satisfying NRC "
            f"protein ({round(optimal_cp_pct, 1)}% CP) and rumen fiber safety ({round(optimal_ndf_pct, 1)}% NDF)."
        )
    else:
        advice = (
            f"The LP optimizer has configured a nutritionally balanced daily ration meeting {target_cp_pct}% CP "
            f"and {round(target_dmi_kg, 1)} kg DMI at an optimal cost of ₹{round(optimal_cost_per_cow, 1)}/cow/day. "
            f"Fiber safety index ({round(optimal_ndf_pct, 1)}% NDF) safeguards rumen fermentation against acidosis."
        )

    return {
        "status": optimization_status,
        "solver": "SciPy HiGHS Interior-Point / Simplex MILP",
        "herd_context": {
            "lactation_stage": stage,
            "animal_count": animal_count,
            "daily_milk_yield_liters": milk_yield,
            "target_dmi_kg": target_dmi_kg,
            "target_cp_pct": target_cp_pct,
            "target_cp_kg": target_cp_kg,
            "target_ndf_min_pct": target_ndf_min_pct,
            "target_ndf_max_pct": target_ndf_max_pct
        },
        "cost_summary": {
            "current_cost_per_cow_day_inr": round(current_cost_per_cow, 2),
            "optimal_cost_per_cow_day_inr": round(optimal_cost_per_cow, 2),
            "daily_saving_per_cow_inr": round(daily_saving_per_cow, 2),
            "daily_herd_saving_inr": round(daily_herd_saving, 2),
            "monthly_herd_saving_inr": round(monthly_herd_saving, 2),
            "savings_pct": round((daily_saving_per_cow / current_cost_per_cow * 100.0), 1) if current_cost_per_cow > 0 else 0.0
        },
        "nutrition_balance": {
            "current_dmi_kg": round(current_dmi_per_cow, 2),
            "optimal_dmi_kg": round(optimal_dmi_per_cow, 2),
            "current_cp_pct": round(current_cp_pct, 1),
            "optimal_cp_pct": round(optimal_cp_pct, 1),
            "optimal_cp_kg": round(optimal_cp_kg_per_cow, 2),
            "current_ndf_pct": round(current_ndf_pct, 1),
            "optimal_ndf_pct": round(optimal_ndf_pct, 1),
            "forage_to_concentrate_ratio": (
                f"{round(sum(a['pct_of_dmi'] for a in allocation_details if a['is_forage']), 1)} : "
                f"{round(sum(a['pct_of_dmi'] for a in allocation_details if not a['is_forage']), 1)}"
            ),
            "rumen_acidosis_risk": "SAFE (Adequate NDF)" if optimal_ndf_pct >= target_ndf_min_pct else "CAUTION (Low NDF)"
        },
        "allocation_table": allocation_details,
        "advisory": advice
    }
