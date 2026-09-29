"""FeedSure 360 — Dairy-Specific Tiered Advisory Engine.

Generates actionable, severity-tiered advisories based on:
  - Evidence trust status (OOD / heterogeneous / adulteration / storage)
  - Nutritional analysis (CP deficiency, NDF imbalance, high moisture)
  - Silage/storage telemetry (pH, temperature, exposure)
  - Dairy profile context (lactating vs dry)

Advisory categories:
  CRITICAL   — do not feed / immediate action
  WARNING    — investigate / inspect
  CAUTION    — monitor / consider adjustment
  INFO       — note / good practice
  OK         — no concern

IMPORTANT: All advisories are clearly labelled as prototype estimates based on
simulated or reference data, not certified laboratory results.
"""
from typing import Dict, Any, List


def generate_advisories(
    evidence: Dict[str, Any],
    nutrition: Dict[str, Any],
    storage: Dict[str, Any],
    dairy_profile: Dict[str, Any] | None = None,
) -> List[Dict[str, Any]]:
    advisories: List[Dict[str, Any]] = []
    trust_status = evidence.get("trust_status", "TRUSTED")
    ration_analysis = nutrition.get("ration_analysis", {})
    metrics = evidence.get("metrics", {})

    # ──────────────────────────────────────────────────────────────────
    # 1. EVIDENCE / CALIBRATION STATUS
    # ──────────────────────────────────────────────────────────────────
    if trust_status == "RESULT NOT TRUSTED":
        advisories.append({
            "id": "ADV-OOD-001",
            "severity": "CRITICAL",
            "category": "Calibration Domain",
            "icon": "shield-x",
            "title": "Result Withheld — Outside Calibration Domain",
            "message": (
                "The NIR spectrum for this sample lies outside the validated calibration domain "
                f"(Mahalanobis D_M = {metrics.get('ood_distance', '?'):.2f} > 2.50 threshold). "
                "Quantitative nutritional predictions are not considered reliable for this sample. "
                "Collect a fresh representative sample or request confirmatory laboratory analysis."
            ),
            "action": "Do not rely on predicted values. Request confirmatory laboratory test.",
            "verification_required": True,
            "data_badge": "PROTOTYPE SIMULATION",
        })
    elif trust_status == "SUSPECTED ADULTERATION":
        advisories.append({
            "id": "ADV-ADULT-001",
            "severity": "CRITICAL",
            "category": "Adulteration Screening",
            "icon": "alert-octagon",
            "title": "Spectral Anomaly — Possible Non-Protein Nitrogen (Urea)",
            "message": (
                "Simulated spectral anomalies detected at 910 nm and 1020 nm absorption bands "
                "consistent with non-protein nitrogen (NPN) adulteration patterns. "
                "Computer vision also flagged particulate anomalies. "
                "This is a screening indication only — chemical confirmation is required."
            ),
            "action": "Isolate this feed batch. Conduct wet-chemistry verification (Kjeldahl + NPN split).",
            "verification_required": True,
            "data_badge": "PROTOTYPE SIMULATION — NOT CHEMICAL CONFIRMATION",
        })
    elif trust_status == "RETEST RECOMMENDED":
        advisories.append({
            "id": "ADV-RETEST-001",
            "severity": "WARNING",
            "category": "Sample Consistency",
            "icon": "refresh-cw",
            "title": "Heterogeneous Sample — Retest Recommended",
            "message": (
                f"Significant variance detected across the 5-point core sampling grid "
                f"(Spatial CV: {metrics.get('sample_consistency', 0):.0f}% consistency). "
                "The batch may have uneven moisture/particle distribution. "
                "Results may not represent the full batch composition."
            ),
            "action": "Thoroughly mix the batch, collect fresh 5-point samples, and re-test before feeding.",
            "verification_required": False,
            "data_badge": "PROTOTYPE SIMULATION",
        })
    elif trust_status == "TRUSTED WITH STORAGE WARNING":
        advisories.append({
            "id": "ADV-STORE-001",
            "severity": "WARNING",
            "category": "Storage Condition",
            "icon": "thermometer",
            "title": "Feed Composition Tested — Active Storage Deterioration Risk",
            "message": (
                "The NIR nutritional result is valid at the time of testing. However, simulated "
                "storage telemetry indicates elevated temperature and pH — conditions associated "
                "with active aerobic spoilage in silage. Feed composition may change rapidly."
            ),
            "action": "Use this batch promptly. Inspect silage face and top layer for heat pockets or spoilage.",
            "verification_required": False,
            "data_badge": "PROTOTYPE SIMULATION",
        })
    else:
        # TRUSTED — check nutritional content for advisories
        advisories.append({
            "id": "ADV-OK-001",
            "severity": "OK",
            "category": "Evidence Quality",
            "icon": "check-circle",
            "title": "Evidence Sufficient — Result Accepted",
            "message": (
                f"All 5 quality checks passed: spectral quality {metrics.get('spectral_quality', 0):.0f}%, "
                f"sample consistency {metrics.get('sample_consistency', 0):.0f}%, "
                f"calibration fit {metrics.get('calibration_fit', 0):.0f}%, "
                "visual agreement acceptable. "
                "Nutritional estimates are within the validated calibration domain."
            ),
            "action": "Review the ration assessment below and compare with your dairy group requirements.",
            "verification_required": False,
            "data_badge": "PROTOTYPE SIMULATION",
        })

    # ──────────────────────────────────────────────────────────────────
    # 2. NUTRITIONAL ADVISORIES (only if result trusted)
    # ──────────────────────────────────────────────────────────────────
    if trust_status in ("TRUSTED", "TRUSTED WITH STORAGE WARNING"):
        cp_status = ration_analysis.get("cp_status", "OPTIMAL")
        fiber_status = ration_analysis.get("fiber_status", "OPTIMAL")
        ration_group = ration_analysis.get("ration_group", "lactating")
        target_cp = ration_analysis.get("target_cp_pct", 13.5)
        basket_cp = ration_analysis.get("basket_weighted_cp_pct", 0)
        cp_gap = ration_analysis.get("cp_gap_pct", 0)

        tested_cp = ration_analysis.get("tested_feed_cp_pct", 0)
        ndf_pct = nutrition.get("ndf_pct", 0)
        moisture_pct = nutrition.get("moisture_pct", 0)

        if cp_status == "DEFICIENT":
            advisories.append({
                "id": "ADV-NUT-001",
                "severity": "WARNING",
                "category": "Dairy Nutrition — Protein",
                "icon": "trending-down",
                "title": "Crude Protein Below Target for Dairy Group",
                "message": (
                    f"The illustrative ration crude protein contribution is {basket_cp:.1f}% "
                    f"against an indicative target of {target_cp:.1f}% for the {ration_group} group. "
                    f"Gap of {abs(cp_gap):.1f} percentage points. "
                    "Review protein-rich concentrate, oil cake, or bran inclusion in the ration. "
                    "These are reference figures only — consult a dairy nutritionist for ration formulation."
                ),
                "action": "Consider increasing protein-rich supplement (soybean meal, cottonseed cake) in the ration.",
                "verification_required": False,
                "data_badge": "ILLUSTRATIVE RATION ESTIMATE",
            })
        elif cp_status == "EXCESS":
            advisories.append({
                "id": "ADV-NUT-002",
                "severity": "CAUTION",
                "category": "Dairy Nutrition — Protein",
                "icon": "trending-up",
                "title": "Crude Protein Contribution Above Indicative Target",
                "message": (
                    f"Basket crude protein ({basket_cp:.1f}%) exceeds the illustrative target "
                    f"({target_cp:.1f}%) for the {ration_group} group. Excess dietary protein can "
                    "increase urinary nitrogen load. This is a reference calculation, not a ration prescription."
                ),
                "action": "Review concentrate inclusion rate with a dairy nutritionist.",
                "verification_required": False,
                "data_badge": "ILLUSTRATIVE RATION ESTIMATE",
            })

        if fiber_status == "HIGH_FIBER_RESTRICTION":
            advisories.append({
                "id": "ADV-NUT-003",
                "severity": "CAUTION",
                "category": "Dairy Nutrition — Fibre",
                "icon": "layers",
                "title": "High NDF — Roughage Balance Advisory",
                "message": (
                    f"Tested NDF is {ndf_pct:.1f}% (indicative target range: 32–40% DM basis). "
                    "High NDF can limit dry matter intake in lactating animals. "
                    "This is a reference indicator, not a clinical diagnosis."
                ),
                "action": "Consider reducing high-fibre coarse fodder fraction and increasing digestible components.",
                "verification_required": False,
                "data_badge": "PROTOTYPE ESTIMATE",
            })
        elif fiber_status == "LOW_FIBER_ACIDOSIS_RISK":
            advisories.append({
                "id": "ADV-NUT-004",
                "severity": "WARNING",
                "category": "Dairy Nutrition — Fibre",
                "icon": "alert-triangle",
                "title": "Low NDF — Rumen Health Consideration",
                "message": (
                    f"Tested NDF is {ndf_pct:.1f}% — below indicative 32% lower limit. "
                    "Insufficient effective fibre may be associated with subacute rumen acidosis risk. "
                    "This is a reference indicator — veterinary and nutritional consultation recommended."
                ),
                "action": "Ensure adequate physically effective fibre (chopped roughage) in the ration.",
                "verification_required": False,
                "data_badge": "PROTOTYPE ESTIMATE",
            })

        if moisture_pct > 70:
            advisories.append({
                "id": "ADV-NUT-005",
                "severity": "CAUTION",
                "category": "Feed Quality — Moisture",
                "icon": "droplets",
                "title": "High Moisture Content — Storage Advisory",
                "message": (
                    f"Estimated moisture content is {moisture_pct:.1f}% (above 70%). "
                    "High moisture feed deteriorates rapidly under warm or humid storage conditions. "
                    "This is a prototype estimate from simulated NIR data."
                ),
                "action": "Store high-moisture feed in sealed/covered conditions. Use promptly. Monitor for spoilage signs.",
                "verification_required": False,
                "data_badge": "PROTOTYPE ESTIMATE",
            })

    # ──────────────────────────────────────────────────────────────────
    # 3. STORAGE / SILAGE TELEMETRY ADVISORIES
    # ──────────────────────────────────────────────────────────────────
    storage_status = storage.get("status", "STABLE")
    temp_c = storage.get("temperature_celsius", 0)
    ph = storage.get("ph", 4.0)
    exposure_days = storage.get("exposure_days", 0)
    spoilage_index = storage.get("spoilage_risk_index", 0)

    if storage_status == "CRITICAL_WARNING":
        advisories.append({
            "id": "ADV-STOR-002",
            "severity": "CRITICAL",
            "category": "Silage / Storage",
            "icon": "flame",
            "title": "Simulated Storage Alert — Silage Heating Detected",
            "message": (
                f"Simulated storage telemetry: Temperature {temp_c}°C (above 32°C threshold), "
                f"pH {ph} (above 4.2 ideal range), Exposure {exposure_days} days. "
                f"Spoilage Risk Index: {spoilage_index}/100. "
                "These are simulated readings — not actual sensor measurements."
            ),
            "action": "Inspect silage pit face and top layer. Remove and discard visibly spoiled material before feeding.",
            "verification_required": True,
            "data_badge": "SIMULATED STORAGE TELEMETRY",
        })
    elif storage_status == "ANOMALOUS_pH":
        advisories.append({
            "id": "ADV-STOR-003",
            "severity": "WARNING",
            "category": "Silage / Storage",
            "icon": "flask-conical",
            "title": "Simulated Anomalous pH — Possible Fermentation Issue",
            "message": (
                f"Simulated pH reading: {ph} (ideal silage pH: 3.8–4.2). "
                "Elevated pH may indicate incomplete fermentation, aerobic spoilage, or "
                "possible urea hydrolysis if adulteration is suspected. "
                "This is a simulated reading."
            ),
            "action": "Conduct physical pH measurement with calibrated meter. Inspect silage odour and colour.",
            "verification_required": True,
            "data_badge": "SIMULATED STORAGE TELEMETRY",
        })
    elif temp_c > 28 and exposure_days > 14:
        advisories.append({
            "id": "ADV-STOR-004",
            "severity": "CAUTION",
            "category": "Silage / Storage",
            "icon": "clock",
            "title": "Extended Warm Exposure — Inspection Recommended",
            "message": (
                f"Simulated exposure: {exposure_days} days at {temp_c}°C. "
                "Prolonged warm exposure increases aerobic spoilage risk. "
                "Simulated indicator only."
            ),
            "action": "Physically inspect stored feed. Look for heating, off-odours, or visible mould.",
            "verification_required": False,
            "data_badge": "SIMULATED STORAGE TELEMETRY",
        })

    return advisories
