from typing import Dict, Any, List

def generate_advisories(evidence: Dict[str, Any], nutrition: Dict[str, Any], storage: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generates scenario-specific demo messages. These must not read as real feed
    safety advice because all current inputs and outputs are simulated.
    """
    advisories = []
    trust_status = evidence.get("trust_status", "TRUSTED")

    # 1. Evidence Trust Advisories
    if trust_status == "RESULT NOT TRUSTED":
        advisories.append({
            "id": "ADV-001",
            "severity": "INFO",
            "category": "Demo scenario",
            "title": "Demo example: result withheld",
            "message": "This selected scenario demonstrates a withheld result. No physical sample was scanned; it does not assess your feed.",
            "verification_required": True
        })
    elif trust_status == "SUSPECTED ADULTERATION":
        advisories.append({
            "id": "ADV-002",
            "severity": "INFO",
            "category": "Demo scenario",
            "title": "Demo example: anomaly flag",
            "message": "This selected scenario shows an example anomaly flag only. It does not identify urea, silica, or any chemical; no physical sample was scanned.",
            "verification_required": True
        })
    elif trust_status == "RETEST RECOMMENDED":
        advisories.append({
            "id": "ADV-003",
            "severity": "INFO",
            "category": "Demo scenario",
            "title": "Demo example: repeat sample",
            "message": "This selected scenario demonstrates how a repeat-sample prompt could look. No real sampling points were measured.",
            "verification_required": False
        })

    # 2. Storage Telemetry Advisories
    storage_status = storage.get("status", "STABLE")
    if storage_status == "CRITICAL_WARNING" or storage.get("temperature_celsius", 0) > 32:
        advisories.append({
            "id": "ADV-004",
            "severity": "INFO",
            "category": "Demo scenario",
            "title": "Demo example: storage warning",
            "message": "The displayed temperature and pH are simulated. Measure storage conditions with suitable equipment before making a decision.",
            "verification_required": False
        })

    # 3. Dairy Nutrition Advisories
    ration_analysis = nutrition.get("ration_analysis", {})
    cp_status = ration_analysis.get("cp_status", "OPTIMAL")
    if cp_status == "DEFICIENT":
        advisories.append({
            "id": "ADV-005",
            "severity": "INFO",
            "category": "Demo calculation",
            "title": "Illustrative feed basket comparison",
            "message": "This comparison uses demo reference values and is not a ration recommendation. Confirm actual feed values and consult a dairy nutritionist before changing the ration.",
            "verification_required": False
        })

    # Default Info Advisory
    if not advisories:
        advisories.append({
            "id": "ADV-000",
            "severity": "INFO",
            "category": "Operational Status",
            "title": "No warning in this demo example",
            "message": "This healthy scenario produced no demo warning. It is not a pass, safety finding, or laboratory result for real feed.",
            "verification_required": False
        })

    return advisories
