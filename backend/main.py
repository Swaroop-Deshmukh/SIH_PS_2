"""FeedSure 360 local prototype API."""
from datetime import datetime, timezone
from uuid import uuid4
from typing import Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import DB_PATH, get_batch, get_batch_image, get_farm_context, initialize_database, list_batch_images, list_batches, save_batch, save_batch_image, save_farm_context
from services.simulator import generate_nir_spectrum, generate_cv_screening, generate_storage_telemetry
from services.evidence import evaluate_evidence
from services.nutrition import predict_nutritional_parameters, evaluate_dairy_ration
from services.advisory import generate_advisories
from services.digital_twin import create_digital_twin, generate_integrity_hash
from services.vision import analyze_feed_surface, analyze_urea_strip, get_vision_model_metrics
from services.chemometrics import get_chemometrics_engine
from services.preprocessing import preprocess_spectrum_suite

app = FastAPI(
    title="FeedSure 360 Intelligence API",
    description="Evidence-aware feed and silage decision-support prototype. All current readings are simulated demo data.",
    version="2026.2.0",
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
    storage_data = generate_storage_telemetry(req.scenario)
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
    twin = create_digital_twin(batch_id, req.feed_type, evidence, nutrition, storage_data, req.scenario)
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
        "dairy_ration": ration,
        "advisories": advisories,
        "digital_twin": twin,
        "farm_profile": profile,
        "feed_basket": ration_basket,
        "data_provenance": {
            "mode": "RESEARCH_GRADE_HYBRID",
            "measurement_source": "NIR Diffuse Reflectance 5-Point Scan (800nm - 1050nm)",
            "nutrition_source": "Chemometrics PLSR Multi-Target Model (ISO 12099 / ASTM E1655) with Mahalanobis Calibration OOD Gating",
            "vision_source": "Computer Vision 22-D Channel Moments + Laplacian Variance Texture Analyzer",
            "evidence_source": "Multi-Source Evidence Fusion (NIR Consistency, Calibration Fit, Visual Agreement)",
            "storage_source": "Multi-Sensor Storage Telemetry (pH, Temp, Moisture)",
            "chemometrics_model": "PLSRegression(n_components=4) + PCA(n_components=4) with Mahalanobis D_M (threshold=2.50)",
            "record_created_at": created_at,
        },
    }
    save_batch(result)
    return result


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
    payload = {
        "batch_id": twin["batch_id"], "feed_type": twin["feed_type"], "scenario": twin["scenario"],
        "created_at": twin["created_at"], "evidence_score": twin["evidence"].get("evidence_score"),
        "trust_status": twin["evidence"].get("trust_status"),
        "dry_matter_pct": twin["nutrition"].get("dry_matter_pct"),
        "crude_protein_pct": twin["nutrition"].get("crude_protein_pct"),
        "storage_ph": twin["storage"].get("ph"),
    }
    actual = generate_integrity_hash(payload)
    expected = twin.get("integrity_hash")
    return {"batch_id": batch_id, "integrity_valid": actual == expected, "algorithm": "SHA-256", "scope": "Stored batch summary only; this is tamper-evidence, not a digital signature or blockchain certificate."}


@app.get("/api/sample-farm")
def get_sample_farm() -> dict[str, Any]:
    """Compatibility endpoint for older clients."""
    context = get_farm_context()
    return {**context["farm_profile"], "feed_basket": context["feed_basket"]}
