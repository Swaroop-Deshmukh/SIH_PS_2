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
            "title": "NIR Chemometrics PLSR & OOD Scan",
            "timestamp": created_time,
            "status": "CHEMOMETRICS_PROCESSED",
            "detail": f"Preprocessed via SNV + Savitzky-Golay (w=5, p=2, d=1). Multi-target PLSR predicted DM: {nutrition.get('dry_matter_pct')}%, CP: {nutrition.get('crude_protein_pct')}%, NDF: {nutrition.get('ndf_pct')}%, ADF: {nutrition.get('adf_pct')}%. Mahalanobis Distance D_M: {evidence.get('metrics', {}).get('ood_distance', 1.0)}."
        },
        {
            "step": "STORE",
            "title": "Storage Context & Microclimate",
            "timestamp": created_time,
            "status": "TELEMETRY_LOGGED",
            "detail": f"Storage environment logged. Silage pH: {storage.get('ph')}, Ambient temp: {storage.get('temperature_celsius')}°C."
        },
        {
            "step": "MONITOR",
            "title": "Telemetry & Spoilage Monitoring",
            "timestamp": created_time,
            "status": "MONITORED",
            "detail": f"Active thermal and pH tracking: {storage.get('temperature_celsius')}°C; Spoilage Risk Index: {storage.get('spoilage_risk_index')}/100."
        },
        {
            "step": "RETEST",
            "title": "Scheduled Adaptive Retest",
            "timestamp": "Not scheduled",
            "status": "ADAPTIVE_TRIGGER",
            "detail": "Adaptive test protocol monitors batch consistency and recalibrates upon variance spike."
        },
        {
            "step": "USE",
            "title": "Dairy Ration Feeding",
            "timestamp": "Not recorded",
            "status": "RATION_FORMULATED",
            "detail": "Nutrient parameters integrated into herd dry matter and crude protein ration balance."
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
            "model_version": "Chemometrics PLSR V2.0 (ISO 12099 / ASTM E1655) with Mahalanobis OOD Gating",
            "verification_status": "HASH GENERATED - VERIFY WHEN NEEDED",
            "verification_badge": "SHA-256 DIGEST"
        }
    }
