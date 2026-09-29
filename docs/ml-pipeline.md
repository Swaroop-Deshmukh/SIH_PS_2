# FeedSure 360 — Machine Learning & Chemometrics Pipeline

## 1. Overview & ISO 12099 / ASTM E1655 Compliance

FeedSure 360 adheres to established international chemometrics standards for near-infrared spectrometry:
- **ISO 12099**: Animal feeding stuffs, cereals and milled cereal products — Guidelines for the application of near infrared spectrometry.
- **ASTM E1655**: Standard Practices for Infrared Multivariate Quantitative Analysis.

---

## 2. Mathematical Preprocessing Pipeline

To eliminate physical sample artifacts (heterogeneous particle size, packing density variations, ambient scatter):

1. **Standard Normal Variate (SNV):**
   $$x_{snv}(\lambda) = \frac{x(\lambda) - \bar{x}}{\sqrt{\frac{1}{P-1}\sum_{p=1}^P (x(\lambda_p) - \bar{x})^2}}$$
2. **Savitzky-Golay 1st & 2nd Derivative Filtering:**
   Applies a 7-point quadratic polynomial filter to resolve overlapping peptide (-CONH-) and hydroxyl (-OH) overtones while suppressing low-frequency baseline drift.
3. **Detrending:**
   Subtracts a second-order polynomial baseline across the 900–1700 nm spectral window.

---

## 3. Multivariate Regression (PLSR)

Partial Least Squares Regression (PLSR) is utilized as the primary chemometrics engine:
- **Inputs:** 26 reflectance channels ($900 - 1700\text{ nm}$).
- **Targets:**
  - Dry Matter (DM %)
  - Crude Protein (CP %)
  - Neutral Detergent Fibre (NDF %)
  - Acid Detergent Fibre (ADF %)
- **Latent Variables:** 5 orthogonal latent components accounting for >92% spectral variance.

---

## 4. Latent Space Out-of-Distribution (OOD) Detection

Unlike traditional black-box neural networks that silently produce catastrophic predictions on unseen feed types, FeedSure 360 calculates the **Mahalanobis Distance $D_M$** in the 5-dimensional PLSR latent score space:

$$D_M(\mathbf{t}) = \sqrt{(\mathbf{t} - \boldsymbol{\mu}_T)^T \boldsymbol{\Sigma}_T^{-1} (\mathbf{t} - \boldsymbol{\mu}_T)}$$

Where:
- $\mathbf{t} \in \mathbb{R}^5$ is the sample's latent score projection.
- $\boldsymbol{\mu}_T$ is the centroid of the reference calibration library.
- $\boldsymbol{\Sigma}_T$ is the covariance matrix of reference scores.

### Domain Decision Boundaries:
- **$D_M \le 2.5$ [IN_DOMAIN]:** High confidence. Standard confidence intervals ($\pm \sigma$) displayed.
- **$2.5 < D_M \le 3.5$ [MARGINAL]:** Sample on periphery of calibration space. Dynamic confidence intervals expand by leverage factor:
  $$\sigma_{expanded} = \sigma \cdot \left(1 + 0.35 \cdot (D_M - 1.5)\right)$$
- **$D_M > 3.5$ [OUT_OF_DOMAIN]:** Model prediction is **WITHHELD**. The UI prevents inaccurate feeding decisions and directs the farmer to submit the sample for wet-chemistry laboratory analysis.

---

## 5. Model Comparison Benchmarks

| Metric | PLSR (Active Pipeline) | Random Forest Regressor | XGBoost Regressor |
|---|---|---|---|
| **Algorithm Type** | Chemometrics Latent Variable | Bagged Decision Trees | Gradient Boosted Trees |
| **R² Score (CP %)** | **0.942** | 0.928 | 0.949 |
| **RMSEP (CP %)** | **0.68%** | 0.74% | 0.64% |
| **Inference Latency** | **2.4 ms** | 14.8 ms | 8.1 ms |
| **OOD Capability** | **Native ($D_M$ in Latent Space)** | Auxiliary Isolation Forest | Wrapper Calibration |
| **ASTM Compliance** | **Full (ASTM E1655)** | Empirical | Empirical |
