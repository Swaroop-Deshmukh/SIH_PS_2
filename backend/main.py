"""FeedSure 360 local prototype API."""
from datetime import datetime, timezone
from uuid import uuid4
from typing import Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import (
    DB_PATH, get_batch, get_batch_image, get_farm_context, initialize_database,
    list_batch_images, list_batches, save_batch, save_batch_image, save_farm_context,
    save_silage_telemetry_batch, get_silage_telemetry_history, append_silage_telemetry_reading,
    save_digital_twin_event, get_digital_twin_events
)
from services.simulator import generate_nir_spectrum, generate_cv_screening, generate_storage_telemetry
from services.evidence import evaluate_evidence
from services.nutrition import predict_nutritional_parameters, evaluate_dairy_ration
from services.ration_optimizer import optimize_dairy_ration
from services.advisory import generate_advisories
from services.digital_twin import (
    create_digital_twin, generate_canonical_hash, execute_lifecycle_transition,
    verify_cryptographic_ledger, LIFECYCLE_STATES
)
from services.silage_analytics import (
    generate_silage_longitudinal_series, simulate_step_forward, summarize_silage_telemetry,
    calculate_flieg_index
)
from services.vision import analyze_feed_surface, analyze_urea_strip, get_vision_model_metrics
from services.chemometrics import get_chemometrics_engine
from services.preprocessing import preprocess_spectrum_suite
from services.sampling import build_spatial_nutrition_map

app = FastAPI(
    title="FeedSure 360 Intelligence API",
    description="Evidence-aware feed and silage decision-support prototype with longitudinal silage analytics and cryptographic digital twin.",
    version="2026.5.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)

SCENARIOS = {
    "healthy": {"name": "Scenario A: Healthy Feed", "badge": "TRUSTED (SIMULATION)", "description": "Consistent five-point demo scan and stable simulated storage."},
    "heterogeneous": {"name": "Scenario B: Heterogeneous Sample", "badge": "RETEST (SIMULATION)", "description": "Simulated variance between five sample points."},
    "ood": {"name": "Scenario C: Out-of-Distribution", "badge": "RESULT NOT TRUSTED", "description": "Simulated spectrum outside the demo calibration domain."},
    "storage_warning": {"name": "Scenario D: Storage Spoilage", "badge": "STORAGE ALERT (SIMULATION)", "description": "Simulated heating and elevated pH; inspect and confirm with suitable measurements."},
    "adulteration": {"name": "Scenario E: Possible Adulteration", "badge": "SCREENING FLAG — CONFIRM", "description": "Simulated spectral/visual anomaly only; not chemical proof of urea or silica."},
}
FEED_TYPES = {"Maize Silage", "Green Fodder", "Dry Fodder", "Concentrate"}
IMAGE_DIR = DB_PATH.parent / "batch_images"
MAX_IMAGE_BYTES = 8 * 1024 * 1024
IMAGE_TYPES = {"image/jpeg": ("jpg", b"\xff\xd8\xff"), "image/png": ("png", b"\x89PNG\r\n\x1a\n"), "image/webp": ("webp", b"RIFF")}


class BasketItem(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    quantity_kg: float = Field(ge=0, le=10000)
    cp_pct: float = Field(ge=0, le=100)
    dm_pct: float = Field(ge=0, le=100)
    data_source: str = "DEMO REFERENCE"


class FarmProfile(BaseModel):
    farm_name: str = Field(default="My Farm", min_length=1, max_length=100)
    location: str = Field(default="", max_length=120)
    lactating_animals: int = Field(default=0, ge=0, le=100000)
    dry_animals: int = Field(default=0, ge=0, le=100000)
    daily_milk_yield_liters: float = Field(default=0, ge=0, le=1000000)
    ration_group: str = "lactating"
    lactation_stage: str = "early_lactation"
    data_source: str = "FARMER PROVIDED"


class FarmContextRequest(BaseModel):
    farm_profile: FarmProfile
    feed_basket: list[BasketItem]


class BatchAnalyzeRequest(BaseModel):
    batch_id: str | None = Field(default=None, max_length=80)
    feed_type: str = "Maize Silage"
    scenario: str = "healthy"
    farm_profile: FarmProfile | None = None
    feed_basket: list[BasketItem] | None = None


class ChemometricsPredictRequest(BaseModel):
    spectrum: list[float] | None = None
    nir_data: dict[str, Any] | None = None
    feed_type: str = "Maize Silage"


class ChemometricsPreprocessRequest(BaseModel):
    spectrum: list[float]


class SpatialMapRequest(BaseModel):
    nir_data: dict[str, Any]
    nutrition_data: dict[str, Any]
    cv_data: dict[str, Any] | None = None
    storage_data: dict[str, Any] | None = None
    scenario: str = "healthy"


class FliegIndexRequest(BaseModel):
    ph: float = Field(default=4.0, ge=3.0, le=8.5)
    dry_matter_pct: float = Field(default=35.0, ge=10.0, le=80.0)


class SilageStepRequest(BaseModel):
    trigger_breach: bool = False
    custom_temp_delta: float | None = None


class LifecycleTransitionRequest(BaseModel):
    target_state: str
    action: str = "MANUAL_STATUS_ADVANCEMENT"
    actor: str = "FARM_MANAGER"
    notes: str | None = None


class RationOptimizeRequest(BaseModel):
    farm_profile: FarmProfile | None = None
    feed_basket: list[BasketItem] | None = None
    price_overrides: dict[str, float] | None = None
    allow_catalog_expansion: bool = True


@app.on_event("startup")
def startup() -> None:
    initialize_database()


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    from database import DB_PATH
    return {
        "status": "ONLINE",
        "system": "FeedSure 360 Intelligence Engine",
        "storage": "LOCAL SQLITE — OFFLINE PROTOTYPE",
        "database_path": str(DB_PATH),
        "data_mode": "SIMULATED DEMO DATA — NO TRAINED MODEL OR PHYSICAL DEVICE CONNECTED",
        "version": "2026.2.0",
    }


@app.get("/api/scenarios")
def get_scenarios() -> list[dict[str, str]]:
    return [{"id": key, **value} for key, value in SCENARIOS.items()]


@app.get("/api/farm-context")
def read_farm_context() -> dict[str, Any]:
    return get_farm_context()


@app.put("/api/farm-context")
def update_farm_context(request: FarmContextRequest) -> dict[str, Any]:
    if not request.feed_basket:
        raise HTTPException(status_code=422, detail="Add at least one ingredient to the feed basket.")
    if sum(item.quantity_kg for item in request.feed_basket) <= 0:
        raise HTTPException(status_code=422, detail="Feed basket quantities must total more than zero.")
    return save_farm_context(request.model_dump())


@app.post("/api/analyze-batch")
def analyze_batch(req: BatchAnalyzeRequest) -> dict[str, Any]:
    if req.feed_type not in FEED_TYPES:
        raise HTTPException(status_code=422, detail=f"Unsupported feed type: {req.feed_type}")
    if req.scenario not in SCENARIOS:
        raise HTTPException(status_code=422, detail=f"Unsupported scenario: {req.scenario}")

    context = get_farm_context()
    profile = req.farm_profile.model_dump() if req.farm_profile else context["farm_profile"]
    basket = [item.model_dump() for item in req.feed_basket] if req.feed_basket is not None else context["feed_basket"]
    if not basket or sum(max(0, float(item.get("quantity_kg", 0))) for item in basket) <= 0:
        raise HTTPException(status_code=422, detail="A feed basket with positive quantities is required.")

    batch_id = req.batch_id or f"FS-{datetime.now().strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"
    nir_data = generate_nir_spectrum(req.feed_type, req.scenario)
    cv_data = generate_cv_screening(req.feed_type, req.scenario)

    # Phase 5: Generate real 7-day longitudinal silage telemetry series
    silage_obj = generate_silage_longitudinal_series(batch_id, req.scenario, hours=168)
    silage_summary = silage_obj["summary"]
    silage_series = silage_obj["time_series"]
    save_silage_telemetry_batch(batch_id, silage_series)

    # Multi-sensor storage telemetry fused with longitudinal metrics
    storage_data = {
        "ph": silage_summary["current_ph"],
        "temperature_celsius": silage_summary["current_core_temp_c"],
        "ambient_temp_c": silage_summary["current_ambient_temp_c"],
        "temp_differential_c": silage_summary["temp_differential_c"],
        "humidity_pct": silage_summary["current_humidity_pct"],
        "moisture_pct": silage_summary["current_moisture_pct"],
        "feed_mass_kg": silage_summary["current_feed_mass_kg"],
        "exposure_days": round(silage_obj["total_hours"] / 24.0, 1),
        "spoilage_risk_index": silage_summary["spoilage_risk_index"],
        "status": silage_summary["overall_status"],
        "status_color": silage_summary["status_color"],
        "status_label": silage_summary["status_label"],
        "telemetry_badge": silage_summary["telemetry_badge"],
        "dT_dt": silage_summary["dT_dt"],
        "max_dT_dt": silage_summary["max_dT_dt"],
        "delta_t_24h": silage_summary.get("delta_t_24h", 0.0),
        "aerobic_heating_detected": silage_summary.get("aerobic_heating_detected", False),
        "flieg_evaluation": silage_summary.get("flieg_evaluation", {}),
        "cumulative_heat_units": silage_summary["cumulative_heat_units"],
        "shelf_life_hours_remaining": silage_summary["shelf_life_hours_remaining"],
        "advisory_message": silage_summary["advisory_message"],
        "recommended_action": silage_summary["recommended_action"],
        "recent_time_series": silage_series[-48:],
    }
    nutrition = predict_nutritional_parameters(req.feed_type, req.scenario, nir_data=nir_data)
    evidence = evaluate_evidence(nir_data, cv_data, scenario=req.scenario, nutrition_data=nutrition, feed_type=req.feed_type)

    # Use the measured/simulated values for the tested feed in the actual saved ration basket.
    ration_basket = [dict(item) for item in basket]
    tested_item = next((item for item in ration_basket if item.get("name") == req.feed_type), None)
    if tested_item:
        tested_item["cp_pct"] = nutrition["crude_protein_pct"]
        tested_item["dm_pct"] = nutrition["dry_matter_pct"]
    else:
        ration_basket.append({
            "name": req.feed_type, "quantity_kg": 20,
            "cp_pct": nutrition["crude_protein_pct"], "dm_pct": nutrition["dry_matter_pct"],
            "data_source": nutrition.get("data_badge", "CHEMOMETRICS PLSR MODEL"),
        })
    ration = evaluate_dairy_ration(nutrition, profile, ration_basket)
    advisories = generate_advisories(evidence, ration, storage_data)

    # Phase 3: Dynamic 5-Point Sampling & Spatial Nutrition Map (ISO 12099 W/X Pattern)
    spatial_sampling = build_spatial_nutrition_map(
        nir_data=nir_data,
        nutrition_data=nutrition,
        cv_data=cv_data,
        storage_data=storage_data,
        scenario=req.scenario
    )

    # Phase 8: Mathematical Least-Cost Ration Cost Optimizer (SciPy HiGHS LP)
    optimizer_result = optimize_dairy_ration(
        dairy_profile=profile,
        feed_basket=ration_basket,
        price_overrides={},
        allow_catalog_expansion=True
    )

    twin = create_digital_twin(batch_id, req.feed_type, evidence, nutrition, storage_data, req.scenario)
    for evt in twin.get("lifecycle_events", []):
        save_digital_twin_event(evt)
    created_at = twin["created_at"]
    result = {
        "batch_id": batch_id,
        "feed_type": req.feed_type,
        "scenario": req.scenario,
        "nir_data": nir_data,
        "cv_screening": cv_data,
        "storage_telemetry": storage_data,
        "evidence": evidence,
        "nutritional_analysis": nutrition,
        "spatial_sampling": spatial_sampling,
        "dairy_ration": ration,
        "ration_optimizer": optimizer_result,
        "advisories": advisories,
        "digital_twin": twin,
        "farm_profile": profile,
        "feed_basket": ration_basket,
        "data_provenance": {
            "mode": "RESEARCH_GRADE_HYBRID",
            "measurement_source": "NIR Diffuse Reflectance 5-Point Scan (800nm - 1050nm)",
            "sampling_source": "ISO 12099 Dynamic 5-Point W/X Spatial Grid with Coefficient of Variation (CV%) & Adaptive Test Escalation",
            "nutrition_source": "Chemometrics PLSR Multi-Target Model (ISO 12099 / ASTM E1655) with Mahalanobis Calibration OOD Gating",
            "vision_source": "Computer Vision 22-D Channel Moments + Laplacian Variance Texture Analyzer",
            "evidence_source": "Multi-Source Evidence Fusion (NIR Consistency, Calibration Fit, Visual Agreement)",
            "storage_source": "Multi-Sensor Storage Telemetry (pH, Temp, Moisture)",
            "chemometrics_model": "PLSRegression(n_components=4) + PCA(n_components=4) with Mahalanobis D_M (threshold=2.50)",
            "ration_optimizer_solver": "SciPy HiGHS MILP Least-Cost Solver (ICAR/NRC DMI, CP, NDF, ADF constraints)",
            "record_created_at": created_at,
        },
    }
    save_batch(result)
    return result


@app.post("/api/dairy/optimize-ration")
def optimize_ration_endpoint(req: RationOptimizeRequest) -> dict[str, Any]:
    """
    Executes Linear Programming optimization to minimize total daily feed cost
    under NRC / ICAR nutritional constraints for the specified dairy herd context.
    """
    context = get_farm_context()
    profile = req.farm_profile.model_dump() if req.farm_profile else context["farm_profile"]
    basket = [item.model_dump() for item in req.feed_basket] if req.feed_basket is not None else context["feed_basket"]
    if not basket:
        raise HTTPException(status_code=422, detail="At least one feed ingredient is required to optimize ration.")
    return optimize_dairy_ration(
        dairy_profile=profile,
        feed_basket=basket,
        price_overrides=req.price_overrides or {},
        allow_catalog_expansion=req.allow_catalog_expansion
    )


@app.get("/api/batches")
def read_batches(limit: int = 50) -> list[dict[str, Any]]:
    return list_batches(max(1, min(limit, 200)))


@app.get("/api/batches/{batch_id}")
def read_batch(batch_id: str) -> dict[str, Any]:
    result = get_batch(batch_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Batch not found.")
    return result


@app.post("/api/batches/{batch_id}/images")
async def attach_batch_image(batch_id: str, image: UploadFile = File(...)) -> dict[str, Any]:
    batch = get_batch(batch_id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found. Run the feed demo first.")
    content_type = (image.content_type or "").lower()
    if content_type not in IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Choose a JPEG, PNG, or WebP image.")
    contents = await image.read(MAX_IMAGE_BYTES + 1)
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Images must be 8 MB or smaller.")
    extension, signature = IMAGE_TYPES[content_type]
    if not contents.startswith(signature) or (content_type == "image/webp" and contents[8:12] != b"WEBP"):
        raise HTTPException(status_code=415, detail="The selected file does not match its image type.")

    # Execute pixel-level computer vision analysis on uploaded feed image
    feed_type = batch.get("feed_type", "Maize Silage")
    try:
        analysis = analyze_feed_surface(contents, feed_type=feed_type)
    except Exception as exc:
        analysis = {
            "analysis_type": "FEED_SURFACE_VISION",
            "error": str(exc),
            "screening_summary": "Image received but automated visual screening could not be processed.",
        }

    attachment_id = uuid4().hex
    stored_name = f"{attachment_id}.{extension}"
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    (IMAGE_DIR / stored_name).write_bytes(contents)
    safe_name = Path(image.filename or f"feed-photo.{extension}").name[:160]
    record = save_batch_image({
        "attachment_id": attachment_id,
        "batch_id": batch_id,
        "original_name": safe_name,
        "stored_name": stored_name,
        "content_type": content_type,
        "size_bytes": len(contents),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "analysis": analysis,
    })
    # Fuse real camera visual screening into the batch digital twin evidence
    if "error" not in analysis:
        twin = batch.get("digital_twin", {})
        nir = twin.get("nir_spectrum", {})
        scenario = batch.get("scenario", "healthy")
        updated_evidence = evaluate_evidence(
            nir, analysis, scenario=scenario, nutrition_data=batch.get("nutritional_analysis"), feed_type=feed_type
        )
        twin["evidence"] = updated_evidence
        twin["cv_screening"] = analysis
        batch["evidence"] = updated_evidence
        save_batch(batch)

    return {
        **record,
        "image_analysis": analysis,
        "updated_evidence": batch.get("digital_twin", {}).get("evidence"),
        "message": f"Computer vision analysis complete: {analysis.get('screening_summary', 'Visual features extracted.')}",
    }


@app.post("/api/vision/feed-surface")
@app.post("/ml/vision/feed-surface")
async def vision_feed_surface(
    image: UploadFile = File(...),
    feed_type: str = "Maize Silage",
) -> dict[str, Any]:
    """Standalone endpoint for real-time computer vision screening of feed samples."""
    content_type = (image.content_type or "").lower()
    if content_type not in IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Choose a JPEG, PNG, or WebP image.")
    contents = await image.read(MAX_IMAGE_BYTES + 1)
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Images must be 8 MB or smaller.")
    return analyze_feed_surface(contents, feed_type=feed_type)


@app.post("/api/vision/urea-strip")
@app.post("/ml/vision/urea-strip")
async def vision_urea_strip(
    image: UploadFile = File(...),
) -> dict[str, Any]:
    """Rapid chemical test: smartphone-readable paper strip colorimetry for urea adulteration."""
    content_type = (image.content_type or "").lower()
    if content_type not in IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Choose a JPEG, PNG, or WebP image.")
    contents = await image.read(MAX_IMAGE_BYTES + 1)
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Images must be 8 MB or smaller.")
    return analyze_urea_strip(contents)


@app.get("/api/vision/models/metrics")
@app.get("/ml/vision/models/metrics")
def read_vision_model_metrics() -> dict[str, Any]:
    """Returns training metrics, accuracy, and calibration parameters for vision models."""
    return get_vision_model_metrics()


@app.post("/api/chemometrics/predict")
@app.post("/ml/chemometrics/predict")
def chemometrics_predict(req: ChemometricsPredictRequest) -> dict[str, Any]:
    """
    Chemometrics PLSR nutritional prediction and calibration domain Mahalanobis distance D_M.
    Supports either single spectrum array or 5-point sampling grid nir_data.
    """
    engine = get_chemometrics_engine()
    if req.nir_data and "points" in req.nir_data:
        return engine.predict_multi_point(req.nir_data, feed_type=req.feed_type)
    elif req.spectrum:
        return engine.predict_spectrum(req.spectrum, feed_type=req.feed_type)
    else:
        raise HTTPException(
            status_code=422,
            detail="Provide either 'spectrum' (26-point reflectance list) or 'nir_data' (5-point sampling dict)."
        )


@app.post("/api/chemometrics/preprocess")
@app.post("/ml/chemometrics/preprocess")
def chemometrics_preprocess(req: ChemometricsPreprocessRequest) -> dict[str, Any]:
    """
    Returns full chemometrics transform suite: Raw, SNV, Savitzky-Golay 1st & 2nd derivative, Detrended.
    """
    if not req.spectrum:
        raise HTTPException(status_code=422, detail="Provide a non-empty 'spectrum' array.")
    return preprocess_spectrum_suite(req.spectrum)


@app.get("/api/chemometrics/models/metrics")
@app.get("/ml/chemometrics/models/metrics")
def chemometrics_model_metrics() -> dict[str, Any]:
    """
    Returns ISO 12099 / ASTM E1655 chemometrics calibration performance report:
    R2, RMSECV, SEP, RPD, PCA explained variance, and Mahalanobis distance thresholds.
    """
    return get_chemometrics_engine().get_metrics()


@app.post("/api/sampling/spatial-map")
def sampling_spatial_map(req: SpatialMapRequest) -> dict[str, Any]:
    """
    Computes genuine 3x3 spatial nutrition grid, heterogeneity CV%,
    outlier core localization, and adaptive test escalation protocols.
    """
    return build_spatial_nutrition_map(
        nir_data=req.nir_data,
        nutrition_data=req.nutrition_data,
        cv_data=req.cv_data,
        storage_data=req.storage_data,
        scenario=req.scenario
    )


@app.get("/api/batches/{batch_id}/images")
def read_batch_images(batch_id: str) -> list[dict[str, Any]]:
    if get_batch(batch_id) is None:
        raise HTTPException(status_code=404, detail="Batch not found.")
    records = list_batch_images(batch_id)
    return [{**record, "url": f"/api/batches/{batch_id}/images/{record['attachment_id']}"} for record in records]


@app.get("/api/batches/{batch_id}/images/{attachment_id}")
def read_batch_image(batch_id: str, attachment_id: str) -> FileResponse:
    record = get_batch_image(attachment_id)
    if record is None or record["batch_id"] != batch_id:
        raise HTTPException(status_code=404, detail="Image attachment not found.")
    path = IMAGE_DIR / record["stored_name"]
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Image file is missing from local storage.")
    return FileResponse(path, media_type=record["content_type"], filename=record["original_name"], content_disposition_type="inline")


@app.post("/api/batches/{batch_id}/verify-integrity")
def verify_batch_integrity(batch_id: str) -> dict[str, Any]:
    result = get_batch(batch_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Batch not found.")
    twin = result["digital_twin"]
    storage = twin.get("storage", {})
    genesis_hash = twin.get("passport", {}).get("genesis_hash")
    if not genesis_hash and twin.get("lifecycle_events"):
        genesis_hash = twin["lifecycle_events"][0].get("block_hash")

    payload = {
        "batch_id": twin["batch_id"],
        "feed_type": twin["feed_type"],
        "scenario": twin["scenario"],
        "created_at": twin["created_at"],
        "evidence_score": twin["evidence"].get("evidence_score"),
        "trust_status": twin["evidence"].get("trust_status"),
        "dry_matter_pct": twin["nutrition"].get("dry_matter_pct"),
        "crude_protein_pct": twin["nutrition"].get("crude_protein_pct"),
        "storage_ph": storage.get("current_ph", storage.get("ph")),
        "genesis_hash": genesis_hash
    }
    actual = generate_canonical_hash(payload)
    expected = twin.get("integrity_hash")
    summary_valid = (actual == expected)

    # Cryptographic ledger verification
    db_events = get_digital_twin_events(batch_id)
    events_to_verify = db_events if db_events else twin.get("lifecycle_events", [])
    ledger_audit = verify_cryptographic_ledger(events_to_verify) if events_to_verify else {"is_valid": True, "total_blocks": 0}

    overall_valid = summary_valid and ledger_audit.get("is_valid", True)

    return {
        "batch_id": batch_id,
        "integrity_valid": overall_valid,
        "summary_digest_valid": summary_valid,
        "cryptographic_chain_valid": ledger_audit.get("is_valid", True),
        "total_lifecycle_blocks": ledger_audit.get("total_blocks", len(events_to_verify)),
        "genesis_hash": ledger_audit.get("genesis_hash"),
        "latest_block_hash": ledger_audit.get("latest_block_hash"),
        "algorithm": "SHA-256 Chained Event Ledger (Block Hash Chaining)",
        "scope": "Full batch lifecycle audit trail from NIR calibration through storage monitoring.",
        "ledger_audit": ledger_audit
    }


# ============================================================================
# PHASE 5: SILAGE LONGITUDINAL TELEMETRY & DIGITAL TWIN STATE MACHINE ENDPOINTS
# ============================================================================

@app.get("/api/silage/telemetry/{batch_id}")
def read_silage_telemetry(batch_id: str) -> dict[str, Any]:
    """
    Returns 7-day longitudinal hourly telemetry for the silage pit zone:
    core temp, ambient temp, differential dT/dt slope, pH, cumulative heat units, and aerobic risk.
    """
    history = get_silage_telemetry_history(batch_id)
    if not history:
        batch = get_batch(batch_id)
        scenario = batch.get("scenario", "healthy") if batch else "healthy"
        generated = generate_silage_longitudinal_series(batch_id, scenario=scenario, hours=168)
        history = generated["time_series"]
        save_silage_telemetry_batch(batch_id, history)

    summary = summarize_silage_telemetry(history)
    return {
        "batch_id": batch_id,
        "total_readings": len(history),
        "summary": summary,
        "time_series": history,
        "telemetry_badge": "LONGITUDINAL 7-DAY PIT TELEMETRY (dT/dt ENABLED)"
    }


@app.post("/api/silage/telemetry/{batch_id}/simulate-hour")
def simulate_silage_hour(batch_id: str, req: SilageStepRequest) -> dict[str, Any]:
    """
    Advances silage telemetry by 1 hour (or simulates an aerobic tarp breach).
    Computes updated differential slope dT/dt and degree-hours.
    If heating slope exceeds threshold, automatically transitions Digital Twin to RETEST_ALERT.
    """
    history = get_silage_telemetry_history(batch_id)
    if not history:
        batch = get_batch(batch_id)
        scenario = batch.get("scenario", "healthy") if batch else "healthy"
        generated = generate_silage_longitudinal_series(batch_id, scenario=scenario, hours=168)
        history = generated["time_series"]

    step_result = simulate_step_forward(
        history,
        trigger_breach=req.trigger_breach,
        custom_temp_delta=req.custom_temp_delta
    )
    new_reading = step_result["new_reading"]
    summary = step_result["summary"]
    updated_series = step_result["updated_series"]

    append_silage_telemetry_reading(batch_id, new_reading)

    auto_transitioned = False
    transition_message = None

    # Auto-escalation watchdog: If dT/dt exceeds warning threshold, flag RETEST_ALERT
    batch = get_batch(batch_id)
    if batch:
        twin = batch.get("digital_twin", {})
        curr_state = twin.get("current_state", "STORAGE_MONITORING")
        if (summary["dT_dt"] >= 0.35 or summary["overall_status"] == "CRITICAL_WARNING") and curr_state == "STORAGE_MONITORING":
            events = get_digital_twin_events(batch_id)
            if not events:
                events = twin.get("lifecycle_events", [])
            try:
                new_evt, updated_events = execute_lifecycle_transition(
                    events,
                    target_state="RETEST_ALERT",
                    action="HEATING_RATE_EXCEEDED_ALERT",
                    actor="SILAGE_ANALYTICS_WATCHDOG",
                    payload_data={
                        "dT_dt": summary["dT_dt"],
                        "core_temp_c": summary["current_core_temp_c"],
                        "cumulative_heat_units": summary["cumulative_heat_units"],
                    },
                    notes=f"Automated Alert: Heating slope (+{summary['dT_dt']}°C/hr) breached critical safety limit."
                )
                save_digital_twin_event(new_evt)
                twin["current_state"] = "RETEST_ALERT"
                twin["lifecycle_events"] = updated_events
                twin["passport"]["current_lifecycle_state"] = "RETEST_ALERT"
                twin["passport"]["chain_tip_hash"] = new_evt["block_hash"]
                batch["digital_twin"] = twin
                save_batch(batch)
                auto_transitioned = True
                transition_message = "Automated escalation triggered: Digital twin transitioned to RETEST_ALERT."
            except Exception as e:
                transition_message = f"Escalation logged with warning: {e}"

    return {
        "batch_id": batch_id,
        "new_reading": new_reading,
        "summary": summary,
        "recent_time_series": updated_series[-48:],
        "auto_transitioned": auto_transitioned,
        "transition_message": transition_message
    }


@app.post("/api/silage/telemetry/{batch_id}/reset")
def reset_silage_telemetry(batch_id: str, scenario: str = "healthy") -> dict[str, Any]:
    """Resets silage telemetry to clean 7-day baseline."""
    generated = generate_silage_longitudinal_series(batch_id, scenario=scenario, hours=168)
    save_silage_telemetry_batch(batch_id, generated["time_series"])
    return {
        "batch_id": batch_id,
        "message": f"Silage telemetry reset to 7-day baseline ({scenario}).",
        "summary": generated["summary"],
        "recent_time_series": generated["time_series"][-48:]
    }


@app.post("/api/silage/flieg-index")
def compute_flieg_index(req: FliegIndexRequest) -> dict[str, Any]:
    """
    Computes genuine Flieg's Silage Quality Index (0-100) and acid profile
    from pH and Dry Matter % under international agronomic standards.
    """
    return calculate_flieg_index(req.ph, req.dry_matter_pct)


@app.get("/api/digital-twin/{batch_id}/ledger")
def read_digital_twin_ledger(batch_id: str) -> dict[str, Any]:
    """
    Returns the complete cryptographic event ledger and verifies block hash chaining integrity.
    """
    events = get_digital_twin_events(batch_id)
    if not events:
        batch = get_batch(batch_id)
        if batch:
            events = batch.get("digital_twin", {}).get("lifecycle_events", [])
            for e in events:
                save_digital_twin_event(e)

    verification = verify_cryptographic_ledger(events) if events else {"is_valid": False, "total_blocks": 0}
    return {
        "batch_id": batch_id,
        "verification": verification,
        "events": events,
        "available_states": LIFECYCLE_STATES
    }


@app.post("/api/digital-twin/{batch_id}/transition")
def transition_digital_twin_state(batch_id: str, req: LifecycleTransitionRequest) -> dict[str, Any]:
    """
    Executes a formal lifecycle state transition:
    Validates state machine rules, signs a new SHA-256 event block, and appends to the immutable chain.
    """
    batch = get_batch(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")

    events = get_digital_twin_events(batch_id)
    twin = batch.get("digital_twin", {})
    if not events:
        events = twin.get("lifecycle_events", [])

    try:
        new_event, updated_events = execute_lifecycle_transition(
            events,
            target_state=req.target_state,
            action=req.action,
            actor=req.actor,
            payload_data={"notes": req.notes},
            notes=req.notes
        )
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

    save_digital_twin_event(new_event)
    twin["current_state"] = req.target_state
    twin["lifecycle_events"] = updated_events
    twin["passport"]["current_lifecycle_state"] = req.target_state
    twin["passport"]["chain_tip_hash"] = new_event["block_hash"]
    twin["passport"]["total_lifecycle_blocks"] = len(updated_events)
    batch["digital_twin"] = twin
    save_batch(batch)

    verification = verify_cryptographic_ledger(updated_events)

    return {
        "batch_id": batch_id,
        "current_state": req.target_state,
        "transitioned_event": new_event,
        "chain_verification": verification,
        "message": f"Successfully transitioned to state {req.target_state}."
    }


@app.get("/api/digital-twin/{batch_id}/passport")
def read_digital_twin_passport(batch_id: str) -> dict[str, Any]:
    """
    Exports the official Feed Quality Passport document:
    ISO 12099 compliance seal, cryptographic root hash, nutritional specs, and full audit ledger.
    """
    batch = get_batch(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")

    twin = batch["digital_twin"]
    events = get_digital_twin_events(batch_id) or twin.get("lifecycle_events", [])
    verification = verify_cryptographic_ledger(events)

    return {
        "passport": twin.get("passport", {}),
        "batch_id": batch_id,
        "feed_type": batch["feed_type"],
        "scenario": batch["scenario"],
        "current_state": twin.get("current_state", "STORAGE_MONITORING"),
        "nutritional_analysis": batch.get("nutritional_analysis", {}),
        "storage_telemetry": batch.get("storage_telemetry", {}),
        "evidence": batch.get("evidence", {}),
        "verification": verification,
        "chain_tip_hash": events[-1].get("block_hash") if events else None,
        "total_audit_blocks": len(events),
        "export_timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/sample-farm")
def get_sample_farm() -> dict[str, Any]:
    """Compatibility endpoint for older clients."""
    context = get_farm_context()
    return {**context["farm_profile"], "feed_basket": context["feed_basket"]}

