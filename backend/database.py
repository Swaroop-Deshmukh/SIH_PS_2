"""Small SQLite persistence layer for the offline-capable FeedSure prototype."""

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_DB = Path(__file__).parent / ".data" / "feedsure.sqlite3"
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
            created_at TEXT NOT NULL
        )""")
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
    with connect() as db:
        db.execute(
            "INSERT INTO batch_images(attachment_id,batch_id,original_name,stored_name,content_type,size_bytes,created_at) VALUES(?,?,?,?,?,?,?)",
            (image["attachment_id"], image["batch_id"], image["original_name"], image["stored_name"], image["content_type"], image["size_bytes"], image["created_at"]),
        )
    return {key: value for key, value in image.items() if key != "stored_name"}


def get_batch_image(attachment_id: str) -> dict[str, Any] | None:
    with connect() as db:
        row = db.execute("SELECT * FROM batch_images WHERE attachment_id=?", (attachment_id,)).fetchone()
    return dict(row) if row else None


def list_batch_images(batch_id: str) -> list[dict[str, Any]]:
    with connect() as db:
        rows = db.execute("SELECT * FROM batch_images WHERE batch_id=? ORDER BY created_at DESC", (batch_id,)).fetchall()
    return [{key: value for key, value in dict(row).items() if key != "stored_name"} for row in rows]
