"""Small SQLite persistence layer for the offline-capable FeedSure prototype."""

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
DEFAULT_DB = Path("/tmp/feedsure.sqlite3") if is_serverless else Path(__file__).parent / ".data" / "feedsure.sqlite3"
DB_PATH = Path(os.getenv("FEEDSURE_DB_PATH", str(DEFAULT_DB)))

DEFAULT_CONTEXT: dict[str, Any] = {
    "farm_profile": {
        "farm_name": "Shiv Dairy Farm",
        "location": "Pune Region, Maharashtra",
        "lactating_animals": 17,
        "dry_animals": 7,
        "daily_milk_yield_liters": 260,
        "ration_group": "lactating",
        "data_source": "DEMO PROFILE — replace with the farmer's details",
    },
    "feed_basket": [
        {"name": "Maize Silage", "quantity_kg": 20, "cp_pct": 8.8, "dm_pct": 34.5, "data_source": "DEMO REFERENCE"},
        {"name": "Green Fodder", "quantity_kg": 10, "cp_pct": 11.2, "dm_pct": 22.0, "data_source": "DEMO REFERENCE"},
        {"name": "Dry Fodder", "quantity_kg": 4, "cp_pct": 4.2, "dm_pct": 88.5, "data_source": "DEMO REFERENCE"},
        {"name": "Concentrate", "quantity_kg": 5, "cp_pct": 18.5, "dm_pct": 90.0, "data_source": "DEMO REFERENCE"},
        {"name": "Cottonseed Meal", "quantity_kg": 1.5, "cp_pct": 36.0, "dm_pct": 90.0, "data_source": "DEMO REFERENCE"},
        {"name": "Mineral Mixture", "quantity_kg": 0.2, "cp_pct": 0.0, "dm_pct": 98.0, "data_source": "DEMO REFERENCE"},
    ],
}


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    with connect() as db:
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("""CREATE TABLE IF NOT EXISTS app_settings (
            setting_key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS batches (
            batch_id TEXT PRIMARY KEY, feed_type TEXT NOT NULL, scenario TEXT NOT NULL,
            created_at TEXT NOT NULL, result_json TEXT NOT NULL
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS batch_images (
            attachment_id TEXT PRIMARY KEY, batch_id TEXT NOT NULL, original_name TEXT NOT NULL,
            stored_name TEXT NOT NULL, content_type TEXT NOT NULL, size_bytes INTEGER NOT NULL,
            created_at TEXT NOT NULL, analysis_json TEXT
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS silage_telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_id TEXT NOT NULL,
            hour_offset INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            core_temp_c REAL NOT NULL,
            ambient_temp_c REAL NOT NULL,
            ph REAL NOT NULL,
            humidity_pct REAL NOT NULL,
            moisture_pct REAL NOT NULL,
            feed_mass_kg REAL NOT NULL,
            dT_dt REAL NOT NULL,
            cumulative_heat_units REAL NOT NULL,
            status TEXT NOT NULL,
            data_json TEXT
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS digital_twin_events (
            event_id TEXT PRIMARY KEY,
            batch_id TEXT NOT NULL,
            block_index INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            state TEXT NOT NULL,
            action TEXT NOT NULL,
            actor TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            previous_hash TEXT NOT NULL,
            block_hash TEXT NOT NULL
        )""")
        try:
            db.execute("ALTER TABLE batch_images ADD COLUMN analysis_json TEXT")
        except sqlite3.OperationalError:
            pass
        existing = db.execute("SELECT 1 FROM app_settings WHERE setting_key='farm_context'").fetchone()
        if existing is None:
            db.execute(
                "INSERT INTO app_settings(setting_key, value_json, updated_at) VALUES (?, ?, ?)",
                ("farm_context", json.dumps(DEFAULT_CONTEXT), datetime.now(timezone.utc).isoformat()),
            )


def get_farm_context() -> dict[str, Any]:
    with connect() as db:
        row = db.execute("SELECT value_json FROM app_settings WHERE setting_key='farm_context'").fetchone()
    return json.loads(row["value_json"]) if row else DEFAULT_CONTEXT


def save_farm_context(context: dict[str, Any]) -> dict[str, Any]:
    updated_at = datetime.now(timezone.utc).isoformat()
    with connect() as db:
        db.execute(
            "INSERT INTO app_settings(setting_key, value_json, updated_at) VALUES (?, ?, ?) "
            "ON CONFLICT(setting_key) DO UPDATE SET value_json=excluded.value_json, updated_at=excluded.updated_at",
            ("farm_context", json.dumps(context), updated_at),
        )
    return {**context, "updated_at": updated_at}


def save_batch(result: dict[str, Any]) -> None:
    with connect() as db:
        db.execute(
            "INSERT OR REPLACE INTO batches(batch_id, feed_type, scenario, created_at, result_json) VALUES (?, ?, ?, ?, ?)",
            (result["batch_id"], result["feed_type"], result["scenario"], result["digital_twin"]["created_at"], json.dumps(result)),
        )


def get_batch(batch_id: str) -> dict[str, Any] | None:
    with connect() as db:
        row = db.execute("SELECT result_json FROM batches WHERE batch_id=?", (batch_id,)).fetchone()
    return json.loads(row["result_json"]) if row else None


def list_batches(limit: int = 50) -> list[dict[str, Any]]:
    with connect() as db:
        rows = db.execute("SELECT result_json FROM batches ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    return [json.loads(row["result_json"]) for row in rows]


def save_batch_image(image: dict[str, Any]) -> dict[str, Any]:
    analysis_raw = image.get("analysis")
    analysis_json = json.dumps(analysis_raw) if analysis_raw else None
    with connect() as db:
        db.execute(
            "INSERT INTO batch_images(attachment_id,batch_id,original_name,stored_name,content_type,size_bytes,created_at,analysis_json) VALUES(?,?,?,?,?,?,?,?)",
            (image["attachment_id"], image["batch_id"], image["original_name"], image["stored_name"], image["content_type"], image["size_bytes"], image["created_at"], analysis_json),
        )
    clean = {key: value for key, value in image.items() if key != "stored_name"}
    clean["analysis"] = analysis_raw
    return clean


def get_batch_image(attachment_id: str) -> dict[str, Any] | None:
    with connect() as db:
        row = db.execute("SELECT * FROM batch_images WHERE attachment_id=?", (attachment_id,)).fetchone()
    if not row:
        return None
    d = dict(row)
    analysis_raw = d.get("analysis_json")
    d["analysis"] = json.loads(analysis_raw) if analysis_raw else None
    return d


def list_batch_images(batch_id: str) -> list[dict[str, Any]]:
    with connect() as db:
        rows = db.execute("SELECT * FROM batch_images WHERE batch_id=? ORDER BY created_at DESC", (batch_id,)).fetchall()
    results = []
    for row in rows:
        d = dict(row)
        analysis_raw = d.get("analysis_json")
        item = {key: value for key, value in d.items() if key not in ("stored_name", "analysis_json")}
        item["analysis"] = json.loads(analysis_raw) if analysis_raw else None
        results.append(item)
    return results


def save_silage_telemetry_batch(batch_id: str, readings: list[dict[str, Any]]) -> None:
    with connect() as db:
        db.execute("DELETE FROM silage_telemetry WHERE batch_id=?", (batch_id,))
        for r in readings:
            db.execute(
                """INSERT INTO silage_telemetry(
                    batch_id, hour_offset, timestamp, core_temp_c, ambient_temp_c,
                    ph, humidity_pct, moisture_pct, feed_mass_kg, dT_dt,
                    cumulative_heat_units, status, data_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    batch_id,
                    int(r.get("hour_offset", 0)),
                    str(r.get("timestamp", "")),
                    float(r.get("core_temp_c", 0.0)),
                    float(r.get("ambient_temp_c", 0.0)),
                    float(r.get("ph", 4.0)),
                    float(r.get("humidity_pct", 70.0)),
                    float(r.get("moisture_pct", 65.0)),
                    float(r.get("feed_mass_kg", 5000.0)),
                    float(r.get("dT_dt", 0.0)),
                    float(r.get("cumulative_heat_units", 0.0)),
                    str(r.get("status", "STABLE")),
                    json.dumps(r),
                ),
            )


def get_silage_telemetry_history(batch_id: str) -> list[dict[str, Any]]:
    with connect() as db:
        rows = db.execute(
            "SELECT * FROM silage_telemetry WHERE batch_id=? ORDER BY hour_offset ASC",
            (batch_id,)
        ).fetchall()
    results = []
    for row in rows:
        d = dict(row)
        raw_json = d.get("data_json")
        if raw_json:
            parsed = json.loads(raw_json)
            parsed["id"] = d["id"]
            results.append(parsed)
        else:
            results.append(d)
    return results


def append_silage_telemetry_reading(batch_id: str, reading: dict[str, Any]) -> dict[str, Any]:
    with connect() as db:
        cursor = db.execute(
            """INSERT INTO silage_telemetry(
                batch_id, hour_offset, timestamp, core_temp_c, ambient_temp_c,
                ph, humidity_pct, moisture_pct, feed_mass_kg, dT_dt,
                cumulative_heat_units, status, data_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                batch_id,
                int(reading.get("hour_offset", 0)),
                str(reading.get("timestamp", "")),
                float(reading.get("core_temp_c", 0.0)),
                float(reading.get("ambient_temp_c", 0.0)),
                float(reading.get("ph", 4.0)),
                float(reading.get("humidity_pct", 70.0)),
                float(reading.get("moisture_pct", 65.0)),
                float(reading.get("feed_mass_kg", 5000.0)),
                float(reading.get("dT_dt", 0.0)),
                float(reading.get("cumulative_heat_units", 0.0)),
                str(reading.get("status", "STABLE")),
                json.dumps(reading),
            ),
        )
        reading["id"] = cursor.lastrowid
    return reading


def save_digital_twin_event(event: dict[str, Any]) -> dict[str, Any]:
    with connect() as db:
        db.execute(
            """INSERT OR REPLACE INTO digital_twin_events(
                event_id, batch_id, block_index, timestamp, state,
                action, actor, payload_json, previous_hash, block_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                event["event_id"],
                event["batch_id"],
                int(event["block_index"]),
                event["timestamp"],
                event["state"],
                event["action"],
                event["actor"],
                json.dumps(event.get("payload", {})),
                event["previous_hash"],
                event["block_hash"],
            ),
        )
    return event


def get_digital_twin_events(batch_id: str) -> list[dict[str, Any]]:
    with connect() as db:
        rows = db.execute(
            "SELECT * FROM digital_twin_events WHERE batch_id=? ORDER BY block_index ASC",
            (batch_id,)
        ).fetchall()
    events = []
    for r in rows:
        d = dict(r)
        d["payload"] = json.loads(d["payload_json"]) if d.get("payload_json") else {}
        events.append(d)
    return events


# Auto-initialize on load so tables always exist
initialize_database()


