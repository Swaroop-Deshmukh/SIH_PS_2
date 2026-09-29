# Near-Infrared Spectral Library (`data/spectra/`)

This directory contains NIR reflectance and absorbance spectral files across the 900–1700 nm region (26 spectral channels).

## Feed Categories Represented

- **Maize Silage (*Zea mays*):** Fermented whole-crop maize with dry matter range (28–36%), crude protein (7.5–9.5%), NDF (38–48%).
- **Green Fodder (Hybrid Napier / Lucerne):** Fresh forage with high moisture (>75%), crude protein (10–18%), NDF (40–55%).
- **Dry Roughage (Wheat Straw / Paddy Straw):** High fibre (>65% NDF), low crude protein (3–5%), dry matter (>88%).
- **Compound Feed Concentrate:** High protein pellets (>18% CP), high dry matter (>90%).

## Calibration Domain Definition

The Mahalanobis Distance $D_M$ threshold is established in the 5-component latent score space:
- $D_M \le 2.5$: **In-Domain** (High confidence prediction)
- $2.5 < D_M \le 3.5$: **Marginal** (Confidence intervals expanded by leverage factor)
- $D_M > 3.5$: **Out-of-Domain** (Prediction withheld; escalation to wet-lab required)
