import hashlib
import json
from datetime import datetime
from typing import Dict, Any, List

def generate_integrity_hash(batch_payload: Dict[str, Any]) -> str:
    """
    Calculates a SHA-256 cryptographic hash over canonicalized batch JSON data.
    Provides tamper-proof integrity verification without requiring blockchain overhead.
    """
    canonical_str = json.dumps(batch_payload, sort_keys=True)
    return hashlib.sha256(canonical_str.encode('utf-8')).hexdigest()

def create_digital_twin(batch_id: str, feed_type: str, evidence: Dict[str, Any], nutrition: Dict[str, Any], storage: Dict[str, Any], scenario: str = "healthy") -> Dict[str, Any]:
    """
    Creates a full Feed Digital Twin tracking the batch lifecycle:
    TEST -> STORE -> MONITOR -> RETEST -> USE
    """
    created_time = datetime.now().isoformat()
    
    canonical_payload = {
        "batch_id": batch_id,
        "feed_type": feed_type,
        "scenario": scenario,
        "created_at": created_time,
        "evidence_score": evidence.get("evidence_score"),
        "trust_status": evidence.get("trust_status"),
        "dry_matter_pct": nutrition.get("dry_matter_pct"),
        "crude_protein_pct": nutrition.get("crude_protein_pct"),
        "storage_ph": storage.get("ph")
    }
    
    integrity_hash = generate_integrity_hash(canonical_payload)
    
    # Timeline events
    timeline = [
        {
            "step": "TEST",
            "title": "Simulated sampling example",
            "timestamp": created_time,
            "status": "SIMULATED",
            "detail": f"Generated 5-point example spectra. No physical scan or image screening was performed. Demo evidence level: {evidence.get('evidence_level')}."
        },
        {
            "step": "STORE",
            "title": "Example storage context",
            "timestamp": created_time,
            "status": "SIMULATED",
            "detail": f"No silo allocation or pH measurement was recorded. Example pH value: {storage.get('ph')}."
        },
        {
            "step": "MONITOR",
            "title": "Telemetry & Spoilage Monitoring",
            "timestamp": created_time,
            "status": "SIMULATED",
            "detail": f"No live sensor is connected. Example temperature: {storage.get('temperature_celsius')}°C; demo indicator: {storage.get('spoilage_risk_index')}/100."
        },
        {
            "step": "RETEST",
            "title": "Scheduled Adaptive Retest",
            "timestamp": "Not scheduled",
            "status": "DEMO GUIDANCE",
            "detail": "No retest has been scheduled. Use a validated test process when one is available."
        },
        {
            "step": "USE",
            "title": "Dairy Ration Feeding",
            "timestamp": "Not recorded",
            "status": "REVIEW REQUIRED",
            "detail": "This prototype never approves feed for use. A qualified person must review validated test results."
        }
    ]

    return {
        "batch_id": batch_id,
        "feed_type": feed_type,
        "scenario": scenario,
        "integrity_hash": integrity_hash,
        "created_at": created_time,
        "evidence": evidence,
        "nutrition": nutrition,
        "storage": storage,
        "timeline": timeline,
        "passport": {
            "title": "FEEDSURE QUALITY PASSPORT",
            "passport_id": f"PASSPORT-{batch_id}",
            "issued_at": created_time,
            "model_version": "Simulated rules V0.1 — no trained nutrient model",
            "verification_status": "HASH GENERATED - VERIFY WHEN NEEDED",
            "verification_badge": "SHA-256 DIGEST"
        }
    }
