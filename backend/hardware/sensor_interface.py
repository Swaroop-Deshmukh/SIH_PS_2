"""FeedSure 360 — Hardware Abstraction Layer (HAL).

Defines standard sensor interfaces and device adapters for on-field deployment:
1. Micro-NIR Spectrometer (e.g., AS7265x / DLP NIRScan Nano)
2. Optical Camera Sensor (e.g., ESP32-CAM OV2640 / PiCam v3)
3. Smart Feed Zone Environmental Node (ESP32 + SHT31/DHT22 + HX711)

In this SIH 2026 prototype, all sensors operate in calibrated high-fidelity
simulation mode with clear provenance tags and deterministic reproducibility.
"""
from abc import ABC, abstractmethod
from datetime import datetime, timezone
import hashlib
from typing import Any, Dict, List, Optional
import numpy as np


class SensorStatus:
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    CALIBRATING = "CALIBRATING"
    ERROR = "ERROR"
    SIMULATED = "SIMULATED_DEMO_NODE"


class BaseSensor(ABC):
    """Abstract Base Class for all FeedSure 360 physical/simulated sensors."""

    def __init__(self, sensor_id: str, model_name: str, is_simulated: bool = True):
        self.sensor_id = sensor_id
        self.model_name = model_name
        self.is_simulated = is_simulated
        self.last_calibration: Optional[str] = datetime.now(timezone.utc).isoformat()
        self.status: str = SensorStatus.SIMULATED if is_simulated else SensorStatus.ONLINE

    @abstractmethod
    def run_self_test(self) -> Dict[str, Any]:
        """Runs hardware POST (Power-On Self Test)."""
        pass

    @abstractmethod
    def read_raw(self, **kwargs) -> Dict[str, Any]:
        """Reads uncalibrated raw detector signals."""
        pass

    @abstractmethod
    def read_calibrated(self, **kwargs) -> Dict[str, Any]:
        """Applies dark/white reference or temperature compensation."""
        pass

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "model_name": self.model_name,
            "is_simulated": self.is_simulated,
            "status": self.status,
            "last_calibration": self.last_calibration,
            "hardware_mode": "SOFTWARE_SIMULATION_DEMO" if self.is_simulated else "PHYSICAL_DEVICE",
        }


class NIRSpectrometerSensor(BaseSensor):
    """
    Micro-NIR Spectrometer Interface.
    Simulates / abstracts a 900–1700 nm 26-band MEMS or Fabry-Pérot NIR sensor
    (e.g., Hamamatsu, TI DLP NIRScan Nano, or AMS AS7265x tri-chip spectral sensor).
    """

    WAVELENGTHS = [
        900, 932, 964, 996, 1028, 1060, 1092, 1124, 1156, 1188,
        1220, 1252, 1284, 1316, 1348, 1380, 1412, 1444, 1476, 1508,
        1540, 1572, 1604, 1636, 1668, 1700
    ]

    def __init__(self, sensor_id: str = "NIR-SPEC-001", model_name: str = "FeedSure SpectralEngine v1.0"):
        super().__init__(sensor_id, model_name, is_simulated=True)

    def run_self_test(self) -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "self_test": "PASSED",
            "lamp_intensity_pct": 98.4,
            "detector_temperature_c": 24.2,
            "integration_time_ms": 150,
            "dark_reference_valid": True,
            "white_reference_valid": True,
            "status": self.status,
        }

    def read_raw(self, seed: Optional[int] = None) -> Dict[str, Any]:
        rng = np.random.default_rng(seed or 42)
        raw_ad_counts = rng.integers(12000, 48000, size=len(self.WAVELENGTHS)).tolist()
        return {
            "sensor_id": self.sensor_id,
            "wavelengths_nm": self.WAVELENGTHS,
            "raw_adc_counts": raw_ad_counts,
            "integration_time_ms": 150,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def read_calibrated(self, seed: Optional[int] = None, feed_type: str = "Maize Silage") -> Dict[str, Any]:
        """Simulates calibrated reflectance standard [0.0 - 1.0]."""
        rng = np.random.default_rng(seed or 42)
        # Typical diffuse reflectance curve for biomass
        base_curve = 0.35 + 0.15 * np.sin(np.linspace(0, 3.14, len(self.WAVELENGTHS)))
        noise = rng.normal(0, 0.008, len(self.WAVELENGTHS))
        reflectance = np.clip(base_curve + noise, 0.05, 0.95).round(4).tolist()
        return {
            "sensor_id": self.sensor_id,
            "wavelengths_nm": self.WAVELENGTHS,
            "reflectance": reflectance,
            "snr_db": round(float(rng.uniform(42.0, 48.0)), 1),
            "dark_corrected": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


class OpticalCameraSensor(BaseSensor):
    """
    Optical Macro Camera Sensor Interface.
    Simulates / abstracts a 5MP macro camera (ESP32-CAM / PiCam v3)
    used for physical feed surface inspection, mould spot screening,
    and rapid urea colorimetric strip reading.
    """

    def __init__(self, sensor_id: str = "CAM-OPT-001", model_name: str = "FeedSure OpticalEye v1.0"):
        super().__init__(sensor_id, model_name, is_simulated=True)

    def run_self_test(self) -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "self_test": "PASSED",
            "cmos_active": True,
            "white_balance_locked": True,
            "illumination_ring_lux": 850,
            "focal_distance_mm": 65.0,
            "status": self.status,
        }

    def read_raw(self, **kwargs) -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "resolution": "1920x1080",
            "frame_rate_fps": 15,
            "exposure_mode": "FIXED_MANUAL_CALIBRATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def read_calibrated(self, mode: str = "surface_texture") -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "mode": mode,
            "color_space": "LAB_CALIBRATED",
            "white_patch_delta_e": 0.42,
            "illumination_uniformity_pct": 96.5,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


class EnvironmentalTroughSensor(BaseSensor):
    """
    Smart Feed Zone Node (Trough Environmental Monitor).
    Abstracts ESP32 + DHT22/SHT31 (Temperature + RH) + HX711 (Trough load cell).
    """

    def __init__(self, sensor_id: str = "ZONE-TROUGH-01", model_name: str = "FeedSure TroughNode v1.0"):
        super().__init__(sensor_id, model_name, is_simulated=True)

    def run_self_test(self) -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "self_test": "PASSED",
            "sht31_i2c_bus": "ACK_RECEIVED",
            "hx711_tare_offset": 84210,
            "battery_mv": 3950,
            "wifi_rssi_dbm": -62,
            "status": self.status,
        }

    def read_raw(self, **kwargs) -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "sht31_ticks": [6240, 11820],
            "hx711_counts": 245100,
            "battery_adc": 2980,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def read_calibrated(self, temp_c: float = 24.5, humidity_pct: float = 58.0, feed_kg: float = 8.5) -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "temperature_c": round(temp_c, 1),
            "relative_humidity_pct": round(humidity_pct, 1),
            "feed_remaining_kg": round(feed_kg, 2),
            "dew_point_c": round(temp_c - ((100 - humidity_pct) / 5.0), 1),
            "spoilage_acceleration_factor": round(max(1.0, (temp_c - 20) * 0.15 + (humidity_pct - 60) * 0.05), 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


class HardwareRegistry:
    """Singleton device registry for field discovery and diagnostic health."""

    def __init__(self):
        self.devices: Dict[str, BaseSensor] = {
            "nir": NIRSpectrometerSensor(),
            "camera": OpticalCameraSensor(),
            "trough": EnvironmentalTroughSensor(),
        }

    def get_device(self, device_type: str) -> Optional[BaseSensor]:
        return self.devices.get(device_type)

    def get_all_status(self) -> List[Dict[str, Any]]:
        return [dev.get_metadata() for dev in self.devices.values()]

    def run_all_diagnostics(self) -> Dict[str, Any]:
        return {
            dev_type: dev.run_self_test()
            for dev_type, dev in self.devices.items()
        }


_registry = HardwareRegistry()

def get_hardware_registry() -> HardwareRegistry:
    return _registry
