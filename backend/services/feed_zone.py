"""FeedSure 360 — Smart Feed Zone Node Simulation Service.

Simulates a low-cost IoT node (ESP32 + DHT22 + HX711) mounted near/on
the feed trough.  The physical hardware is NOT connected in this prototype;
all readings are software-generated and clearly labelled as simulation.

Node monitors:
  - Temperature (°C)
  - Relative Humidity (%)
  - Feed weight / quantity (kg) via simulated load cell
  - Feed added / removed events
  - Cumulative exposure duration (h)
  - Battery level (%)

Risk assessment:
  - STABLE         — normal operating conditions
  - WATCH          — elevated temperature or humidity
  - INSPECT        — prolonged exposure or borderline conditions
  - CRITICAL       — conditions strongly associated with rapid deterioration

IMPORTANT: Temperature and humidity do not directly measure mould,
aflatoxin, or any chemical contamination.  Risk levels are probabilistic
indicators only.  Physical inspection is always required for confirmation.
"""
import hashlib
from datetime import datetime, timedelta
from typing import Any, Dict, List

import numpy as np


# ---------------------------------------------------------------------------
# Deterministic simulation helpers
# ---------------------------------------------------------------------------

def _seed_rng(zone_id: str, scenario: str) -> np.random.Generator:
    seed_bytes = hashlib.sha256(f"{zone_id}|{scenario}".encode()).digest()[:4]
    seed = int.from_bytes(seed_bytes, "big")
    return np.random.default_rng(seed)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def simulate_feed_zone(
    zone_id: str = "ZONE-01",
    scenario: str = "healthy",
    feed_type: str = "Maize Silage",
) -> Dict[str, Any]:
    """
    Returns a complete simulated Smart Feed Zone node reading.
    All values are software-generated.
    """
    rng = _seed_rng(zone_id, scenario)

    # ── Scenario parameters ──────────────────────────────────────────────
    if scenario == "storage_warning":
        temp_c       = round(float(rng.uniform(32.0, 38.0)), 1)
        humidity_pct = round(float(rng.uniform(74.0, 85.0)), 1)
        feed_kg      = round(float(rng.uniform(1.2, 3.5)), 2)
        exposure_h   = round(float(rng.uniform(18.0, 36.0)), 1)
        battery_pct  = int(rng.integers(45, 75))
        events       = _generate_events(rng, "spoilage")
        risk_status  = "CRITICAL"
        risk_label   = "Elevated temperature and humidity — inspect feed immediately"
    elif scenario == "adulteration":
        temp_c       = round(float(rng.uniform(26.0, 29.5)), 1)
        humidity_pct = round(float(rng.uniform(60.0, 68.0)), 1)
        feed_kg      = round(float(rng.uniform(4.0, 7.5)), 2)
        exposure_h   = round(float(rng.uniform(8.0, 14.0)), 1)
        battery_pct  = int(rng.integers(62, 88))
        events       = _generate_events(rng, "normal")
        risk_status  = "WATCH"
        risk_label   = "Conditions within range — review NIR adulteration flag independently"
    elif scenario == "heterogeneous":
        temp_c       = round(float(rng.uniform(24.0, 27.5)), 1)
        humidity_pct = round(float(rng.uniform(58.0, 70.0)), 1)
        feed_kg      = round(float(rng.uniform(5.5, 9.0)), 2)
        exposure_h   = round(float(rng.uniform(4.0, 10.0)), 1)
        battery_pct  = int(rng.integers(70, 92))
        events       = _generate_events(rng, "normal")
        risk_status  = "WATCH"
        risk_label   = "Slightly elevated humidity — monitor and mix batch thoroughly"
    else:  # healthy / ood / default
        temp_c       = round(float(rng.uniform(21.0, 25.5)), 1)
        humidity_pct = round(float(rng.uniform(52.0, 63.0)), 1)
        feed_kg      = round(float(rng.uniform(6.0, 12.0)), 2)
        exposure_h   = round(float(rng.uniform(3.0, 8.0)), 1)
        battery_pct  = int(rng.integers(78, 98))
        events       = _generate_events(rng, "normal")
        risk_status  = "STABLE"
        risk_label   = "Storage conditions within safe operating range"

    # ── Trend simulation (hourly snapshots over last 6 hours) ────────────
    trend = _generate_trend(rng, temp_c, humidity_pct, scenario)

    # ── Advisory message ─────────────────────────────────────────────────
    advisory = _zone_advisory(risk_status, temp_c, humidity_pct, exposure_h)

    return {
        "zone_id": zone_id,
        "feed_type": feed_type,
        "scenario": scenario,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data_badge": "SIMULATED SMART FEED ZONE NODE — NO PHYSICAL HARDWARE CONNECTED",

        # Live readings
        "temperature_celsius": temp_c,
        "humidity_pct": humidity_pct,
        "feed_remaining_kg": feed_kg,
        "exposure_hours": exposure_h,
        "battery_pct": battery_pct,

        # Risk assessment
        "risk_status": risk_status,
        "risk_label": risk_label,

        # Trend data
        "trend": trend,

        # Recent feed events
        "recent_events": events,

        # Advisory
        "advisory": advisory,

        # Thresholds used
        "thresholds": {
            "temp_watch_c": 28.0,
            "temp_critical_c": 32.0,
            "humidity_watch_pct": 68.0,
            "humidity_critical_pct": 78.0,
            "exposure_watch_h": 12.0,
            "exposure_critical_h": 24.0,
        },

        # Hardware spec (for documentation)
        "hardware_spec": {
            "controller": "ESP32 (simulated)",
            "temp_humidity_sensor": "DHT22 (simulated)",
            "weight_sensor": "HX711 + 5 kg load cell (simulated)",
            "connectivity": "Wi-Fi / BLE (simulated)",
            "firmware_version": "FZ-SIM-v1.0",
        },
    }


def get_zone_history(
    zone_id: str = "ZONE-01",
    scenario: str = "healthy",
) -> Dict[str, Any]:
    """
    Returns simulated 7-day history for a feed zone node.
    """
    rng = _seed_rng(zone_id, f"{scenario}_history")
    days = []
    base_temp = 24.0 if scenario != "storage_warning" else 33.0

    for i in range(7):
        date_str = (datetime.utcnow() - timedelta(days=6 - i)).strftime("%Y-%m-%d")
        t = round(float(base_temp + rng.uniform(-1.5, 2.5 if scenario != "storage_warning" else 4.0)), 1)
        h = round(float(rng.uniform(55, 80 if scenario == "storage_warning" else 66)), 1)
        days.append({
            "date": date_str,
            "avg_temp_c": t,
            "avg_humidity_pct": h,
            "feed_consumed_kg": round(float(rng.uniform(8, 18)), 1),
            "risk_events": int(rng.integers(0, 3 if scenario == "storage_warning" else 1)),
        })

    return {
        "zone_id": zone_id,
        "history_days": 7,
        "data_badge": "SIMULATED — NO PHYSICAL HARDWARE",
        "daily": days,
    }


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _generate_trend(
    rng: np.random.Generator,
    base_temp: float,
    base_humidity: float,
    scenario: str,
) -> List[Dict[str, Any]]:
    """6-hour rolling trend at 1-hour intervals."""
    points = []
    now = datetime.utcnow()
    for h in range(6, 0, -1):
        offset_t = float(rng.uniform(-0.8, 0.8))
        offset_h = float(rng.uniform(-2.0, 2.0))
        # Storage warning scenario shows rising temp trend
        if scenario == "storage_warning":
            offset_t += (6 - h) * 0.35
        points.append({
            "timestamp": (now - timedelta(hours=h)).strftime("%H:%M"),
            "temp_c": round(base_temp + offset_t, 1),
            "humidity_pct": round(base_humidity + offset_h, 1),
        })
    # Add current
    points.append({
        "timestamp": now.strftime("%H:%M"),
        "temp_c": base_temp,
        "humidity_pct": base_humidity,
    })
    return points


def _generate_events(
    rng: np.random.Generator,
    mode: str,
) -> List[Dict[str, Any]]:
    """Recent feed addition/removal events."""
    now = datetime.utcnow()
    if mode == "spoilage":
        return [
            {"type": "FEED_ADDED", "quantity_kg": 12.5, "time_ago": "6 hours ago",
             "note": "Simulated — last feeding event"},
            {"type": "TEMP_ALERT", "quantity_kg": None, "time_ago": "3 hours ago",
             "note": "Simulated — temperature exceeded 32°C threshold"},
            {"type": "FEED_REMOVED", "quantity_kg": round(float(rng.uniform(1.0, 3.0)), 1),
             "time_ago": "1 hour ago", "note": "Simulated — partial consumption"},
        ]
    else:
        return [
            {"type": "FEED_ADDED", "quantity_kg": round(float(rng.uniform(8.0, 15.0)), 1),
             "time_ago": "5 hours ago", "note": "Simulated"},
            {"type": "FEED_REMOVED", "quantity_kg": round(float(rng.uniform(3.0, 6.0)), 1),
             "time_ago": "2 hours ago", "note": "Simulated — normal consumption"},
        ]


def _zone_advisory(
    risk_status: str,
    temp_c: float,
    humidity_pct: float,
    exposure_h: float,
) -> Dict[str, str]:
    if risk_status == "CRITICAL":
        return {
            "severity": "CRITICAL",
            "title": "Immediate Inspection Required",
            "message": (
                f"Simulated conditions ({temp_c}°C / {humidity_pct}% RH / {exposure_h:.0f}h exposure) "
                "indicate high risk of aerobic spoilage. Inspect feed immediately. "
                "Do not rely on this sensor alone — physical inspection is required."
            ),
        }
    elif risk_status == "WATCH":
        return {
            "severity": "WARNING",
            "title": "Monitor Closely",
            "message": (
                f"Conditions ({temp_c}°C / {humidity_pct}% RH) are approaching risk thresholds. "
                "Continue monitoring and physically inspect if conditions worsen."
            ),
        }
    elif risk_status == "INSPECT":
        return {
            "severity": "CAUTION",
            "title": "Inspection Recommended",
            "message": (
                f"Extended exposure ({exposure_h:.0f} h) detected. "
                "Physically inspect feed for off-odours, discolouration, or heating."
            ),
        }
    else:
        return {
            "severity": "OK",
            "title": "Feed Zone Stable",
            "message": (
                f"Simulated conditions ({temp_c}°C / {humidity_pct}% RH / {exposure_h:.0f}h) "
                "are within normal operating range."
            ),
        }
