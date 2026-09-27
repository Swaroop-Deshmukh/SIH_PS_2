from typing import Dict, Any, List

def generate_advisories(evidence: Dict[str, Any], nutrition: Dict[str, Any], storage: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generates actionable, safety-first, advisory recommendations ranked by severity.
    Severity ranks: CRITICAL, HIGH, MEDIUM, INFO.
    """
    advisories = []
    trust_status = evidence.get("trust_status", "TRUSTED")

    # 1. Evidence Trust Advisories
    if trust_status == "RESULT NOT TRUSTED":
        advisories.append({
            "id": "ADV-001",
            "severity": "CRITICAL",
            "category": "Evidence & Calibration",
            "title": "Result Not Trusted - Out of Calibration Domain",
            "message": evidence.get("recommendation", "Collect fresh sample or perform confirmatory lab testing."),
            "verification_required": True
        })
    elif trust_status == "SUSPECTED ADULTERATION":
        advisories.append({
            "id": "ADV-002",
            "severity": "CRITICAL",
            "category": "Feed Safety & Adulteration",
            "title": "Suspected Urea / Non-Protein Nitrogen Adulteration",
            "message": "Spectral anomaly indicates suspected non-protein nitrogen or mineral silica adulteration. Isolate feed batch and perform laboratory verification.",
            "verification_required": True
        })
    elif trust_status == "RETEST RECOMMENDED":
        advisories.append({
            "id": "ADV-003",
            "severity": "HIGH",
            "category": "Sample Representative Quality",
            "title": "Non-Uniform Feed Batch Detected",
            "message": "Significant variance between the 5 core sampling points. Thoroughly remix feed and execute 5-point re-test.",
            "verification_required": False
        })

    # 2. Storage Telemetry Advisories
    storage_status = storage.get("status", "STABLE")
    if storage_status == "CRITICAL_WARNING" or storage.get("temperature_celsius", 0) > 32:
        advisories.append({
            "id": "ADV-004",
            "severity": "HIGH",
            "category": "Storage & Deterioration",
            "title": "Silage Storage Heating & Spoilage Risk",
            "message": f"Storage temperature is elevated ({storage.get('temperature_celsius')}°C) with pH {storage.get('ph')}. Inspect pit face for air ingress and feed out top layer immediately.",
            "verification_required": False
        })

    # 3. Dairy Nutrition Advisories
    ration_analysis = nutrition.get("ration_analysis", {})
    cp_status = ration_analysis.get("cp_status", "OPTIMAL")
    if cp_status == "DEFICIENT":
        advisories.append({
            "id": "ADV-005",
            "severity": "MEDIUM",
            "category": "Dairy Nutrition Balance",
            "title": "Lactating Herd Protein Deficit",
            "message": f"Ration crude protein is short by {ration_analysis.get('cp_gap_pct')}% DM. Increase Groundnut / Mustard Oil Cake contribution in daily concentrate mix.",
            "verification_required": False
        })

    # Default Info Advisory
    if not advisories:
        advisories.append({
            "id": "ADV-000",
            "severity": "INFO",
            "category": "Operational Status",
            "title": "Feed Quality Optimal",
            "message": "Feed sample composition and storage conditions are within safe operational parameters for dairy feeding.",
            "verification_required": False
        })

    return advisories
