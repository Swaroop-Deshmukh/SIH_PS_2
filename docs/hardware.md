# FeedSure 360 — Hardware Abstraction Layer (HAL) & IoT Architecture

## 1. Hardware Architecture Overview

FeedSure 360 abstracts physical sensors through a unified object-oriented Python Hardware Abstraction Layer (`backend/hardware/sensor_interface.py`). This allows seamless transition between simulated test rigs and on-field physical devices.

```
                          ┌───────────────────────────┐
                          │   FeedSure Python HAL     │
                          │ (BaseSensorInterface)     │
                          └─────────────┬─────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
│ NIRSpectrometer │            │  OpticalCamera  │            │  TroughMonitor  │
│ AS7265x / Nano  │            │ ESP32-CAM OV2640│            │  ESP32 + SHT31  │
│ (900 - 1700 nm) │            │ (Macro Texture) │            │  + HX711 Load   │
└─────────────────┘            └─────────────────┘            └─────────────────┘
```

---

## 2. Sensor Module Specifications

### 2.1 Micro-NIR Spectrometer Node
- **Optical Architecture:** MEMS Fabry-Pérot or AMS AS7265x Tri-Chip Spectral Engine (VIS / NIR / NIR-Extended).
- **Wavelength Range:** 900–1700 nm across 26 distinct channels.
- **Illumination:** Integrated broad-spectrum tungsten-halogen bulb with gold-plated reflector cup.
- **Reference Calibration:** 99% diffuse PTFE white reference tile + dark current subtraction.

### 2.2 Macro Optical Camera (Feed Surface & Colorimetry)
- **Sensor:** OV2640 2-Megapixel CMOS with calibrated focal ring.
- **Illumination:** Ring of 6500K high-CRI white LEDs for shadowless macro imaging.
- **Target Analysis:** 
  - Superficial mould mycelium detection (>5% visual coverage flags retest).
  - Rapid p-DMAB urea test strip colorimetry (CIELAB Delta-E calculation).

### 2.3 Smart Feed Zone Node (Barn Trough Monitor)
- **Processor:** ESP32-WROOM-32D (240MHz, 520KB SRAM).
- **Environmental Sensor:** SHT31-DIS (±0.2°C temperature accuracy, ±1.5% RH accuracy).
- **Feed Weight Sensor:** 4× 50kg shear-beam load cells wired to HX711 24-bit differential ADC.
- **Power Management:** 3.7V 2600mAh 18650 Li-ion cell with 1W monocrystalline solar trickle charger.

---

## 3. Bill of Materials (BoM) & Target Cost Breakdown

| Component | Function | Target Cost (INR) | Target Cost (USD) |
|---|---|---|---|
| **ESP32-WROOM-32D** | Edge processing & BLE/Wi-Fi | ₹320 | $3.85 |
| **SHT31-DIS Module** | Temperature & Humidity | ₹210 | $2.50 |
| **HX711 + 4× Load Cells** | Trough Feed Weight (200kg) | ₹680 | $8.15 |
| **18650 Battery + BMS** | Autonomous Barn Power | ₹260 | $3.10 |
| **Weatherproof IP65 Enclosure**| Barn Dust & Water Resistance | ₹350 | $4.20 |
| **Total Smart Feed Zone BoM** | Continuous Barn Monitoring Node | **₹1,820** | **~$21.80** |

*Note: For the handheld portable NIR unit, commercial optical sensors (such as AS7265x) allow total device manufacturing under ₹12,000–15,000 INR (~$150 USD), representing a 90% reduction compared to laboratory benchtop spectrometers.*
