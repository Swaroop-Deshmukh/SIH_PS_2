"""
Longitudinal 7-Day Silage Pit Telemetry & Aerobic Heating Analytics Engine.
FeedSure 360 - Phase 5 Master Specification.

Implements genuine physical & microbiological silage dynamics:
1. Hourly longitudinal time-series (168-hour / 7-day history) for Feed Zone Nodes.
2. Differential Deterioration Slope:
   dT/dt = (T_t - T_{t - Delta t}) / Delta t  (°C / hour)
3. Cumulative Heat Units:
   Integral max(0, T_core(t) - T_ambient(t)) dt  (°C · hr)
4. Aerobic Stability Shelf-Life Countdown (t_shelf in hours).
5. Secondary Fermentation & Oxygen Breach Anomaly Detection.
"""

from datetime import datetime, timezone, timedelta
import math
import random
from typing import List, Dict, Any, Optional


# Critical Microbiological & Thermal Thresholds (Journal of Dairy Science / Silage Management)
IDEAL_SILAGE_PH_MIN = 3.80
IDEAL_SILAGE_PH_MAX = 4.20
WARNING_HEATING_RATE_DT_DT = 0.35      # °C/hr (onset of aerobic respiration)
CRITICAL_HEATING_RATE_DT_DT = 0.60     # °C/hr (acute runaway secondary fermentation)
CRITICAL_CORE_TEMP_THRESHOLD = 32.0    # °C (above ambient baseline)
DANGER_CORE_TEMP_MAX = 38.0            # °C (severe nutrient & protein denaturation)
MAX_SAFE_CUMULATIVE_HEAT_UNITS = 40.0  # °C·hr (degree-hours above ambient)


def compute_differential_slope(temps: List[float], dt_hours: float = 3.0) -> float:
    """
    Computes numerical deterioration slope dT/dt (°C/hr) over a recent window.
    Uses least-squares linear regression slope if >= 3 points, otherwise backward difference.
    """
    if len(temps) < 2:
        return 0.0
    
    n = min(len(temps), int(dt_hours) + 1)
    sub = temps[-n:]
    if n == 2:
        return round((sub[1] - sub[0]) / 1.0, 3)
    
    # Linear regression slope: beta = cov(t, y) / var(t)
    t = list(range(n))
    t_mean = sum(t) / n
    y_mean = sum(sub) / n
    num = sum((t[i] - t_mean) * (sub[i] - y_mean) for i in range(n))
    den = sum((t[i] - t_mean) ** 2 for i in range(n))
    if den == 0:
        return 0.0
    return round(float(num / den), 3)


def compute_cumulative_heat_units(series: List[Dict[str, Any]]) -> float:
    """
    Computes cumulative degree-hours above ambient baseline:
    Heat Units = sum_{t} max(0, T_core(t) - T_ambient(t)) * 1 hr
    """
    total = 0.0
    for reading in series:
        core = reading.get("core_temp_c", 0.0)
        amb = reading.get("ambient_temp_c", core)
        diff = max(0.0, core - amb)
        total += diff
    return round(total, 2)


def project_aerobic_stability_shelf_life(
    current_temp: float,
    ambient_temp: float,
    dT_dt: float,
    ph: float
) -> Dict[str, Any]:
    """
    Projects remaining safe shelf-life hours before silage exceeds critical thermal limit (35°C).
    Accounts for pH-dependent yeast inhibition and heating acceleration.
    """
    critical_limit = max(CRITICAL_CORE_TEMP_THRESHOLD, ambient_temp + 4.0)
    temp_margin = critical_limit - current_temp

    if current_temp >= critical_limit or dT_dt >= CRITICAL_HEATING_RATE_DT_DT:
        return {
            "shelf_life_hours_remaining": 0.0,
            "status": "CRITICAL_HEATING_EXPIRED",
            "urgency": "IMMEDIATE_DISPOSITION",
            "message": "Silage face actively deteriorating. High yeast/mould respiration. Feed immediately or discard spoiled outer layer."
        }

    if dT_dt <= 0.05:
        # Stable anaerobic conditions: prolonged storage stability
        return {
            "shelf_life_hours_remaining": 168.0,  # 7+ days stable
            "status": "STABLE_ANAEROBIC",
            "urgency": "NORMAL",
            "message": "Silage temperature stable and well-buffered. Anaerobic fermentation seal intact."
        }

    # Linear and accelerated thermal projection
    effective_rate = max(0.05, dT_dt)
    projected_hours = max(1.0, temp_margin / effective_rate)
    
    # pH penalty: if pH is elevated, yeast growth is much faster
    if ph > IDEAL_SILAGE_PH_MAX:
        projected_hours *= 0.70

    projected_hours = round(projected_hours, 1)

    if projected_hours < 24.0:
        status = "RAPID_DETERIORATION_WARNING"
        urgency = "HIGH"
        msg = f"Thermal breach detected (+{dT_dt}°C/hr). Silage will breach critical safety limit in approximately {projected_hours} hours."
    else:
        status = "MODERATE_AERATION"
        urgency = "MONITOR"
        msg = f"Mild thermal elevation (+{dT_dt}°C/hr). Estimated aerobic stability remaining: {projected_hours} hours."

    return {
        "shelf_life_hours_remaining": projected_hours,
        "status": status,
        "urgency": urgency,
        "message": msg
    }


def generate_silage_longitudinal_series(
    batch_id: str,
    scenario: str = "healthy",
    hours: int = 168,
    end_time: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Generates realistic 7-day (168-hour) longitudinal sensor telemetry for a Silage Pit Node.
    
    Scenarios:
    - 'healthy': Well-packed bunker, anaerobic seal intact, core buffered (22-24°C), pH 3.92.
    - 'storage_warning': Tarp breach at Day 5 (hour 96), acute aerobic heating climbing to 35.8°C, pH 4.8.
    - 'adulteration': Alkaline ammonia spike from urea hydrolysis (pH 6.8), normal thermal curve.
    - 'heterogeneous' / 'ood': Slight micro-pocket aeration with intermittent localized thermal spikes.
    """
    if end_time is None:
        end_time = datetime.now(timezone.utc)
    
    start_time = end_time - timedelta(hours=hours - 1)
    series: List[Dict[str, Any]] = []

    # Deterministic seed based on batch_id for reproducible time series per batch
    seed_val = sum(ord(c) for c in batch_id) % 10000
    rng = random.Random(seed_val)

    # Initial states
    initial_mass_kg = 5400.0  # Pit zone mass in kg
    daily_consumption_rate = 140.0 / 24.0  # Feeding out rate kg/hr

    # Ambient parameters: Pune / Maharashtra dairy belt diurnal cycle
    # Daytime peak ~30°C at 14:00, nighttime low ~19°C at 05:00
    mean_amb = 24.5
    amb_amplitude = 5.2

    core_temp = 22.8
    ph = 3.92
    moisture = 65.5
    humidity = 68.0

    cumulative_heat = 0.0
    recent_temps: List[float] = [core_temp]

    # Breach time offset for 'storage_warning'
    breach_hour = int(hours * 0.58) if scenario == "storage_warning" else 9999

    for h in range(hours):
        current_dt = start_time + timedelta(hours=h)
        hour_of_day = current_dt.hour
        
        # Diurnal ambient temperature model: peak at 14:00 (phase offset 8)
        ambient_temp = mean_amb + amb_amplitude * math.sin(2 * math.pi * (hour_of_day - 8) / 24.0)
        ambient_temp += rng.uniform(-0.4, 0.4)
        ambient_temp = round(ambient_temp, 2)

        # Humidity anti-correlated with ambient temperature
        humidity = round(85.0 - (ambient_temp - 19.0) * 2.2 + rng.uniform(-1.5, 1.5), 1)

        # Core Temperature Dynamics
        if scenario == "healthy":
            # Anaerobic core: High thermal insulation, tracks ambient with 48h lag and damped amplitude
            core_target = 22.5 + 0.6 * math.sin(2 * math.pi * (h - 20) / 24.0)
            core_temp = 0.95 * core_temp + 0.05 * core_target + rng.uniform(-0.04, 0.04)
            ph = round(3.90 + 0.05 * math.sin(h / 30.0) + rng.uniform(-0.02, 0.02), 2)
            moisture = round(65.4 + 0.4 * math.sin(h / 40.0), 1)

        elif scenario == "storage_warning":
            if h < breach_hour:
                # Pre-breach healthy phase
                core_target = 23.0 + 0.5 * math.sin(2 * math.pi * (h - 20) / 24.0)
                core_temp = 0.95 * core_temp + 0.05 * core_target + rng.uniform(-0.03, 0.03)
                ph = round(3.95 + rng.uniform(-0.02, 0.02), 2)
                moisture = round(65.8 + rng.uniform(-0.2, 0.2), 1)
            else:
                # Post-breach aerobic heating runaway: exponential growth towards 37°C
                elapsed_breach = h - breach_hour
                heating_acceleration = 0.18 * math.exp(elapsed_breach / 32.0)
                core_temp += heating_acceleration * 0.22 + rng.uniform(0.02, 0.12)
                core_temp = min(37.4, core_temp)
                # Lactic acid oxidation raises pH
                ph = min(4.88, ph + 0.013 + rng.uniform(0.0, 0.005))
                # Moisture evaporation at the face
                moisture = max(61.0, moisture - 0.05)

        elif scenario == "adulteration":
            # Normal thermal profile, but alkaline shift
            core_target = 23.2 + 0.5 * math.sin(2 * math.pi * (h - 20) / 24.0)
            core_temp = 0.95 * core_temp + 0.05 * core_target + rng.uniform(-0.03, 0.03)
            # Rapid rise to pH 6.78
            ph = min(6.82, 4.2 + (h / 30.0) * 1.4)
            moisture = round(62.0 + rng.uniform(-0.3, 0.3), 1)

        else:
            # Mild variation for heterogeneous/ood
            core_target = 24.0 + 1.2 * math.sin(2 * math.pi * (h - 15) / 24.0)
            core_temp = 0.92 * core_temp + 0.08 * core_target + rng.uniform(-0.08, 0.08)
            ph = round(4.12 + 0.10 * math.sin(h / 20.0), 2)
            moisture = round(64.5 + rng.uniform(-0.3, 0.3), 1)

        core_temp = round(core_temp, 2)
        ph = round(ph, 2)
        recent_temps.append(core_temp)
        if len(recent_temps) > 6:
            recent_temps.pop(0)

        # Calculate instantaneous differential slope dT/dt (°C/hr)
        dT_dt = compute_differential_slope(recent_temps, dt_hours=3.0)

        # Cumulative heat units above ambient baseline
        heat_increment = max(0.0, core_temp - ambient_temp)
        cumulative_heat = round(cumulative_heat + heat_increment, 2)

        # Feed bunk mass reduction
        feed_mass = max(800.0, round(initial_mass_kg - (h * daily_consumption_rate) + rng.uniform(-5.0, 5.0), 1))

        # Status categorization
        if core_temp > 33.0 or dT_dt >= CRITICAL_HEATING_RATE_DT_DT:
            status = "CRITICAL_HEATING"
        elif dT_dt >= WARNING_HEATING_RATE_DT_DT or core_temp > 28.5:
            status = "ELEVATED_HEATING"
        elif ph > 6.0:
            status = "ALKALINE_ANOMALY"
        elif ph > IDEAL_SILAGE_PH_MAX:
            status = "FERMENTATION_DRIFT"
        else:
            status = "STABLE_ANAEROBIC"

        series.append({
            "hour_offset": h,
            "timestamp": current_dt.isoformat(),
            "core_temp_c": core_temp,
            "ambient_temp_c": ambient_temp,
            "temp_delta_c": round(core_temp - ambient_temp, 2),
            "ph": ph,
            "humidity_pct": humidity,
            "moisture_pct": moisture,
            "feed_mass_kg": feed_mass,
            "dT_dt": dT_dt,
            "cumulative_heat_units": cumulative_heat,
            "status": status,
        })

    # Summary metrics over the series
    summary = summarize_silage_telemetry(series)

    return {
        "batch_id": batch_id,
        "scenario": scenario,
        "total_hours": hours,
        "time_series": series,
        "summary": summary
    }


def summarize_silage_telemetry(series: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Summarizes longitudinal time series into actionable executive telemetry metrics.
    """
    if not series:
        return {}

    latest = series[-1]
    core_temps = [r["core_temp_c"] for r in series]
    ambient_temps = [r["ambient_temp_c"] for r in series]
    phs = [r["ph"] for r in series]
    slopes = [r["dT_dt"] for r in series]

    latest_core = latest["core_temp_c"]
    latest_amb = latest["ambient_temp_c"]
    latest_ph = latest["ph"]
    latest_slope = latest["dT_dt"]
    cumulative_heat = latest["cumulative_heat_units"]

    max_slope = max(slopes)
    max_core = max(core_temps)
    mean_core = round(sum(core_temps) / len(core_temps), 2)
    mean_amb = round(sum(ambient_temps) / len(ambient_temps), 2)

    # Shelf-life and stability projection
    projection = project_aerobic_stability_shelf_life(
        latest_core, latest_amb, latest_slope, latest_ph
    )

    # Deterioration risk index (0 to 100)
    risk_score = 10.0
    if latest_core > 30.0:
        risk_score += (latest_core - 30.0) * 7.5
    if latest_slope > 0.15:
        risk_score += latest_slope * 45.0
    if latest_ph > IDEAL_SILAGE_PH_MAX:
        risk_score += (latest_ph - IDEAL_SILAGE_PH_MAX) * 25.0
    if cumulative_heat > 25.0:
        risk_score += min(25.0, (cumulative_heat - 25.0) * 0.8)
    risk_score = min(100.0, max(5.0, round(risk_score, 1)))

    # Overall alarm badge
    if risk_score >= 70.0 or latest_core >= CRITICAL_CORE_TEMP_THRESHOLD or latest_slope >= WARNING_HEATING_RATE_DT_DT:
        overall_status = "CRITICAL_WARNING"
        status_color = "red"
        status_label = "AEROBIC HEATING ALERT"
    elif risk_score >= 40.0 or latest_ph > IDEAL_SILAGE_PH_MAX:
        overall_status = "MODERATE_WARNING"
        status_color = "amber"
        status_label = "FERMENTATION ELEVATED"
    else:
        overall_status = "OPTIMAL_ANAEROBIC"
        status_color = "emerald"
        status_label = "FERMENTATION STABLE"

    return {
        "current_core_temp_c": latest_core,
        "current_ambient_temp_c": latest_amb,
        "temp_differential_c": round(latest_core - latest_amb, 2),
        "current_ph": latest_ph,
        "current_moisture_pct": latest["moisture_pct"],
        "current_humidity_pct": latest["humidity_pct"],
        "current_feed_mass_kg": latest["feed_mass_kg"],
        "dT_dt": latest_slope,
        "max_dT_dt": max_slope,
        "mean_core_temp_c": mean_core,
        "max_core_temp_c": max_core,
        "cumulative_heat_units": cumulative_heat,
        "spoilage_risk_index": int(risk_score),
        "shelf_life_hours_remaining": projection["shelf_life_hours_remaining"],
        "aerobic_status": latest["status"],
        "overall_status": overall_status,
        "status_color": status_color,
        "status_label": status_label,
        "advisory_message": projection["message"],
        "recommended_action": (
            "Immediately inspect pit face, check plastic tarp seal, and discard heating aerobic crust."
            if overall_status == "CRITICAL_WARNING" else
            "Monitor bunker face temperature daily; ensure feed-out rate exceeds 15 cm/day."
            if overall_status == "MODERATE_WARNING" else
            "Silage storage microclimate is optimal. Proceed with daily balanced herd feeding."
        ),
        "telemetry_badge": "LONGITUDINAL 7-DAY PIT TELEMETRY (dT/dt ENABLED)"
    }


def simulate_step_forward(
    existing_series: List[Dict[str, Any]],
    trigger_breach: bool = False,
    custom_temp_delta: Optional[float] = None
) -> Dict[str, Any]:
    """
    Simulates advancing telemetry by 1 hour.
    Enables live dynamic demonstration to hackathon judges.
    """
    if not existing_series:
        fallback = generate_silage_longitudinal_series("TMP", "healthy", hours=24)
        existing_series = fallback["time_series"]

    last = existing_series[-1]
    last_dt = datetime.fromisoformat(last["timestamp"].replace("Z", "+00:00"))
    next_dt = last_dt + timedelta(hours=1)
    next_h = last["hour_offset"] + 1

    hour_of_day = next_dt.hour
    ambient_temp = round(24.5 + 5.2 * math.sin(2 * math.pi * (hour_of_day - 8) / 24.0) + random.uniform(-0.3, 0.3), 2)
    humidity = round(85.0 - (ambient_temp - 19.0) * 2.2 + random.uniform(-1.0, 1.0), 1)

    core_temp = last["core_temp_c"]
    ph = last["ph"]
    moisture = last["moisture_pct"]
    feed_mass = max(500.0, round(last["feed_mass_kg"] - 5.8 + random.uniform(-1.0, 1.0), 1))

    if custom_temp_delta is not None:
        core_temp += custom_temp_delta
    elif trigger_breach or last.get("status") in ("CRITICAL_HEATING", "ELEVATED_HEATING"):
        # Accelerate heating
        core_temp += random.uniform(0.35, 0.65)
        core_temp = min(38.5, core_temp)
        ph = min(5.2, ph + 0.03)
        moisture = max(60.0, moisture - 0.1)
    else:
        # Stable fluctuation
        target = 22.8 + 0.4 * math.sin(2 * math.pi * (next_h - 20) / 24.0)
        core_temp = 0.94 * core_temp + 0.06 * target + random.uniform(-0.03, 0.03)

    core_temp = round(core_temp, 2)
    ph = round(ph, 2)

    # Recent temps for slope
    recent = [r["core_temp_c"] for r in existing_series[-3:]] + [core_temp]
    dT_dt = compute_differential_slope(recent, dt_hours=3.0)

    # Cumulative heat units
    heat_inc = max(0.0, core_temp - ambient_temp)
    cumulative_heat = round(last["cumulative_heat_units"] + heat_inc, 2)

    if core_temp > 33.0 or dT_dt >= CRITICAL_HEATING_RATE_DT_DT:
        status = "CRITICAL_HEATING"
    elif dT_dt >= WARNING_HEATING_RATE_DT_DT:
        status = "ELEVATED_HEATING"
    else:
        status = "STABLE_ANAEROBIC"

    new_reading = {
        "hour_offset": next_h,
        "timestamp": next_dt.isoformat(),
        "core_temp_c": core_temp,
        "ambient_temp_c": ambient_temp,
        "temp_delta_c": round(core_temp - ambient_temp, 2),
        "ph": ph,
        "humidity_pct": humidity,
        "moisture_pct": moisture,
        "feed_mass_kg": feed_mass,
        "dT_dt": dT_dt,
        "cumulative_heat_units": cumulative_heat,
        "status": status,
    }

    updated_series = existing_series + [new_reading]
    if len(updated_series) > 168:
        updated_series.pop(0)

    summary = summarize_silage_telemetry(updated_series)

    return {
        "new_reading": new_reading,
        "summary": summary,
        "updated_series": updated_series
    }
