# Raw Data Directory (`data/raw/`)

This directory houses unprocessed, primary measurement datasets collected from field sensors, wet-chemistry laboratory assays, and raw camera imagery.

## Contents & Format Specifications

- **`wet_chemistry_benchmarks.csv`**: Reference chemical testing data (Kjeldahl total nitrogen, Van Soest sequential detergent fibre extraction for NDF/ADF, dry matter oven drying at 105°C).
- **`sensor_captures/`**: Raw detector ADC counts from AS7265x / DLP NIRScan Nano spectral sensors (uncalibrated dark/white reference signals).
- **`feed_surface_images/`**: Uncompressed JPEG/PNG camera captures of feed piles, silage pit faces, and visual adulteration test cases.
- **`urea_colorimetric_strips/`**: Raw macroscopic photos of p-DMAB urea screening test strips before color space conversion.

> **Data Provenance Notice:** In this SIH 2026 prototype, datasets are procedurally synthesized and calibrated against published literature standards (ICAR / NDRI nutritional tables and ISO 12099 NIR guidelines).
