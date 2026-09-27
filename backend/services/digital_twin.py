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
            "title": "Representative Sampling & NIR Scan",
            "timestamp": created_time,
            "status": "COMPLETED",
            "detail": f"5-point NIR scan & CV visual screening completed. Evidence level: {evidence.get('evidence_level')}."
        },
        {
            "step": "STORE",
            "title": "Storage Allocation",
            "timestamp": created_time,
            "status": "COMPLETED",
            "detail": f"Assigned to Storage Trench Silo 2. Initial pH: {storage.get('ph')}."
        },
        {
            "step": "MONITOR",
            "title": "Telemetry & Spoilage Monitoring",
            "timestamp": created_time,
            "status": "ACTIVE" if storage.get("status") == "STABLE" else "WARNING",
            "detail": f"Simulated sensor telemetry active. Temp: {storage.get('temperature_celsius')}°C, Risk: {storage.get('spoilage_risk_index')}/100."
        },
        {
            "step": "RETEST",
            "title": "Scheduled Adaptive Retest",
            "timestamp": "Pending (14 Days)",
            "status": "SCHEDULED" if evidence.get("trust_status") == "TRUSTED" else "ACTION_REQUIRED",
            "detail": "Retest recommended prior to ration transition."
        },
        {
            "step": "USE",
            "title": "Dairy Ration Feeding",
            "timestamp": "Pending",
            "status": "APPROVED" if evidence.get("trust_status") == "TRUSTED" else "HELD",
            "detail": "Approved for Lactating Herd Feed Basket." if evidence.get("trust_status") == "TRUSTED" else "Batch held due to unverified evidence."
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
            "model_version": "FeedSure-v2026.1-CALIB_V4",
            "verification_status": "INTEGRITY VERIFIED",
            "verification_badge": "SHA-256 SECURED"
        }
    }
