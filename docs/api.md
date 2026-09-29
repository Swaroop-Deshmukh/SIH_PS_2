# FeedSure 360 — RESTful API Specification

**Base URL (Local Prototype):** `http://localhost:8000/api`  
**Interactive Swagger UI:** `http://localhost:8000/docs`  
**OpenAPI Specification:** `http://localhost:8000/openapi.json`

---

## 1. System & Health Endpoints

### `GET /health`
Returns the operational status of the FeedSure Intelligence API, database connectivity, and data mode provenance.

**Response (200 OK):**
```json
{
  "status": "ONLINE",
  "system": "FeedSure 360 Intelligence Engine",
  "storage": "LOCAL SQLITE — OFFLINE PROTOTYPE",
  "data_mode": "SIMULATED DEMO DATA",
  "version": "2026.2.0"
}
```

---

## 2. Authentication & RBAC

### `POST /auth/login`
Authenticates a user and returns a signed JSON Web Token (JWT) along with granted role permissions.

**Request Body:**
```json
{
  "username": "farmer",
  "password": "farmer123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "user_id": "USR-FARMER-01",
    "username": "farmer",
    "full_name": "Ramesh Patil",
    "role": "farmer",
    "organization": "Shiv Dairy Farm"
  },
  "roles": { ... }
}
```

### `GET /auth/me`
Returns details of the currently authenticated user based on the `Authorization: Bearer <token>` header.

---

## 3. Feed & Silage Testing Endpoints

### `POST /analyze-batch`
Executes the comprehensive evidence-fusion intelligence pipeline:
1. Simulates/reads 5-point spatial NIR reflectance spectrum.
2. Applies chemometric preprocessing (SNV + SavGol).
3. Executes PLSR multi-target regression (DM, CP, NDF, ADF).
4. Calculates latent Mahalanobis distance $D_M$ for OOD detection.
5. Fuses 5 evidence sources into composite score.
6. Evaluates dairy ration adequacy based on farmer's feed basket.
7. Generates severity-tiered advisories.
8. Creates SHA-256 digital twin passport.
9. Persists record in local SQLite database.

**Request Body:**
```json
{
  "feed_type": "Maize Silage",
  "scenario": "healthy",
  "farm_profile": {
    "farm_name": "Shiv Dairy Farm",
    "lactating_animals": 17,
    "dry_animals": 7,
    "daily_milk_yield_liters": 260
  }
}
```

---

## 4. Smart Feed Zone Node (IoT)

### `GET /feed-zone`
Returns real-time telemetry from the trough-mounted IoT node.

**Query Parameters:**
- `zone_id` (string, default: `"ZONE-01"`)
- `scenario` (string, default: `"healthy"`)
- `feed_type` (string, default: `"Maize Silage"`)

**Response (200 OK):**
```json
{
  "zone_id": "ZONE-01",
  "temperature_celsius": 24.2,
  "humidity_pct": 58.4,
  "feed_remaining_kg": 8.75,
  "exposure_hours": 4.5,
  "battery_pct": 88,
  "risk_status": "STABLE",
  "risk_label": "Storage conditions within safe operating range",
  "trend": [ ... ],
  "recent_events": [ ... ]
}
```

### `POST /feed-zone/calibrate`
Tares the HX711 scale load cell and recalibrates DHT baseline readings.

---

## 5. Machine Learning & Hardware HAL Endpoints

### `GET /chemometrics/comparison-models`
Returns comparative cross-validation metrics across PLSR, Random Forest Regressor, and XGBoost.

### `GET /hardware/devices`
Returns roster of hardware sensors and their connection status.

### `GET /hardware/diagnostics`
Executes Power-On Self-Test (POST) across NIR spectrometer, macro camera, and trough environmental node.
