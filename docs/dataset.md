# FeedSure 360 — Dataset Provenance & Calibration Boundaries

## 1. Transparency & Scientific Boundary Notice

In compliance with SIH 2026 hackathon ethics and scientific rigor, FeedSure 360 provides full transparency regarding the origins and boundaries of its calibration data:

1. **Current Calibration Data:** In this software prototype, all spectral readings, camera textures, and trough telemetry are generated via high-fidelity, deterministic mathematical simulation models calibrated against published ICAR/NDRI nutritional ranges.
2. **No False Claims:** The software explicitly displays `SIMULATED DEMO DATA` badges across every screen and API endpoint.
3. **Architecture Readiness:** The data ingestion layer, chemometrics preprocessor, and database tables are 100% prepared to ingest real benchtop and portable NIR spectral libraries without code rewrites.

---

## 2. Reference Wet-Chemistry Benchmark Standards

To calibrate and validate the chemometrics models against physical feed samples in field deployment, FeedSure 360 specifies the following standard analytical chemistry methods:

- **Dry Matter (DM):** Hot-air convection oven drying at 105°C ± 2°C to constant weight (AOAC 930.15).
- **Crude Protein (CP):** Kjeldahl total nitrogen digestion with copper catalyst multiplied by 6.25 nitrogen factor (ISO 5983-2 / AOAC 2001.11).
- **Neutral Detergent Fibre (NDF):** Van Soest sequential detergent method with heat-stable alpha-amylase and sodium sulfite (ISO 16472).
- **Acid Detergent Fibre (ADF):** Van Soest cetyltrimethylammonium bromide (CTAB) extraction (ISO 13906).
- **Silage pH:** Direct potentiometric glass electrode measurement in 1:5 silage-to-distilled-water extract.

---

## 3. Synthetic Calibration Generation Methodology

The synthetic spectral generator (`backend/services/simulator.py` and `backend/datasets/train_nir_calibration.py`) models diffuse reflectance over 26 wavelength bands (900–1700 nm):
- **Base absorption peaks:**
  - Water / Hydroxyl ($O-H$): 970 nm, 1190 nm, 1450 nm
  - Protein / Peptide ($N-H$): 1020 nm, 1510 nm
  - Starch & Cellulose ($C-H$): 1200 nm, 1680 nm
- **Simulated variance:**
  - Gaussian instrumental detector noise ($\mathrm{SNR} \approx 45\text{ dB}$).
  - Multiplicative baseline shifts modeling sample particle size variations (0.8–1.2×).
  - Spatial heterogeneity across 5 sampling points (within-batch CV: 1.5% for uniform, >6.0% for heterogeneous).
