# Processed Data Directory (`data/processed/`)

This directory contains standardized, preprocessed datasets prepared for machine learning model training, cross-validation, and evidence calibration.

## Chemometric Preprocessing Transformations

1. **Standard Normal Variate (SNV):** Eliminates particle-size scattering variations and baseline shifts across heterogeneous fodder samples.
2. **Savitzky-Golay 1st & 2nd Derivatives:** Resolves overlapping overtone absorption bands (e.g. C-H, N-H, O-H bonds corresponding to starch, protein, and moisture).
3. **Detrending:** Fits a second-order polynomial baseline subtraction to correct wavelength-dependent curvature.
4. **Multiplicative Scatter Correction (MSC):** Normalizes individual spectra against the mean calibration spectrum.

## Image Processing & Computer Vision Feature Extraction

- **HSV / CIELAB Color Space Transformation:** Colorimetric delta-E extraction for urea strip detection.
- **Gray-Level Co-occurrence Matrix (GLCM):** Haralick texture features (contrast, dissimilarity, homogeneity, energy, correlation) for surface mould and silica dust anomaly detection.
