from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from services.simulator import generate_nir_spectrum, generate_cv_screening, generate_storage_telemetry
from services.evidence import evaluate_evidence
from services.nutrition import predict_nutritional_parameters, evaluate_dairy_ration
from services.advisory import generate_advisories
from services.digital_twin import create_digital_twin

app = FastAPI(
    title="FeedSure 360 Intelligence API",
    description="Adaptive Evidence-Aware Feed & Silage Intelligence API for SIH 2026 Problem Statement 26111",
    version="2026.1.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BatchAnalyzeRequest(BaseModel):
    batch_id: Optional[str] = "FS-2026-0104"
    feed_type: str = "Maize Silage"
    scenario: str = "healthy" # healthy, heterogeneous, ood, storage_warning, adulteration

class RationRequest(BaseModel):
    lactating_animals: int = 17
    dry_animals: int = 7
    tested_feed_cp: float = 8.8
    tested_feed_ndf: float = 46.2
    feed_basket: Optional[List[Dict[str, Any]]] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "FeedSure 360 Intelligence Engine",
        "hardware_mode": "SOFTWARE SIMULATOR LAYER (ZERO HARDWARE DEPENDENCY)",
        "version": "2026.1.0"
    }

@app.get("/api/scenarios")
def get_scenarios():
    return [
        {
            "id": "healthy",
            "name": "Scenario A: Healthy Feed",
            "badge": "TRUSTED",
            "description": "Consistent 5-point scan, optimal NIR fit, clear visual screening."
        },
        {
            "id": "heterogeneous",
            "name": "Scenario B: Heterogeneous Sample",
            "badge": "RETEST",
            "description": "High variance between 5 sampling points. Non-uniform core."
        },
        {
            "id": "ood",
            "name": "Scenario C: Out-of-Distribution",
            "badge": "RESULT NOT TRUSTED",
            "description": "Wavelength shift outside calibration domain. High prediction uncertainty."
        },
        {
            "id": "storage_warning",
            "name": "Scenario D: Storage Spoilage",
            "badge": "STORAGE ALERT",
            "description": "Temperature heating (>33°C), pH elevation, microbial exposure."
        },
        {
            "id": "adulteration",
            "name": "Scenario E: Suspected Adulteration",
            "badge": "SUSPECTED ADULTERATION",
            "description": "Absorption anomalies at urea/silica spectral bands."
        }
    ]

@app.post("/api/analyze-batch")
def analyze_batch(req: BatchAnalyzeRequest):
    # 1. Run Simulator Layer
    nir_data = generate_nir_spectrum(req.feed_type, req.scenario)
    cv_data = generate_cv_screening(req.feed_type, req.scenario)
    storage_data = generate_storage_telemetry(req.scenario)

    # 2. Level 2 Evidence Engine
    evidence_res = evaluate_evidence(nir_data, cv_data, req.scenario)

    # 3. Level 1 Nutritional Prediction
    nutrition_res = predict_nutritional_parameters(req.feed_type, req.scenario)

    # 4. Level 3 Dairy Ration Evaluation
    sample_dairy_profile = {"lactating_animals": 17, "dry_animals": 7}
    sample_basket = [
        {"name": "Maize Silage", "quantity_kg": 20, "cp_pct": nutrition_res["crude_protein_pct"]},
        {"name": "Green Fodder", "quantity_kg": 10, "cp_pct": 11.2},
        {"name": "Dry Straw", "quantity_kg": 4, "cp_pct": 4.2},
        {"name": "Dairy Concentrate", "quantity_kg": 5, "cp_pct": 18.5}
    ]
    dairy_ration_res = evaluate_dairy_ration(nutrition_res, sample_dairy_profile, sample_basket)

    # 5. Advisory Rule Engine
    advisories = generate_advisories(evidence_res, dairy_ration_res, storage_data)

    # 6. Feed Digital Twin & Passport
    digital_twin = create_digital_twin(req.batch_id, req.feed_type, evidence_res, nutrition_res, storage_data, req.scenario)

    return {
        "batch_id": req.batch_id,
        "feed_type": req.feed_type,
        "scenario": req.scenario,
        "nir_data": nir_data,
        "cv_screening": cv_data,
        "storage_telemetry": storage_data,
        "evidence": evidence_res,
        "nutritional_analysis": nutrition_res,
        "dairy_ration": dairy_ration_res,
        "advisories": advisories,
        "digital_twin": digital_twin
    }

@app.get("/api/sample-farm")
def get_sample_farm():
    return {
        "farm_name": "Shiv Dairy Farm",
        "location": "Pune Region, Maharashtra",
        "total_cattle": 24,
        "lactating_cows": 17,
        "dry_cows": 7,
        "daily_milk_yield_liters": 260,
        "feed_basket": [
            {"ingredient": "Maize Silage", "quantity_kg": 20, "cp_pct": 8.8, "dm_pct": 34.5},
            {"ingredient": "Green Napier Grass", "quantity_kg": 10, "cp_pct": 11.2, "dm_pct": 22.0},
            {"ingredient": "Wheat Straw", "quantity_kg": 4, "cp_pct": 4.2, "dm_pct": 88.5},
            {"ingredient": "Compound Feed Concentrate", "quantity_kg": 5, "cp_pct": 18.5, "dm_pct": 90.0},
            {"ingredient": "Cottonseed Meal", "quantity_kg": 1.5, "cp_pct": 36.0, "dm_pct": 90.0},
            {"ingredient": "Mineral Mixture", "quantity_kg": 0.2, "cp_pct": 0.0, "dm_pct": 98.0}
        ]
    }
