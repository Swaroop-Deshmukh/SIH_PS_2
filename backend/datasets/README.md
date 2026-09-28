# FeedSure 360 — Computer Vision & Chemical Strip Datasets

This directory contains the structured datasets and sample reference images generated for the **FeedSure 360 Computer Vision & Rapid Chemical Test Modules** (addressing **SIH 2026 PS 26111**, Sections 37 & 38).

---

## 📁 Directory Structure

```
backend/datasets/
├── README.md                                      # Dataset documentation (this file)
├── dataset_d_feed_surface_clean.csv               # 800 clean samples across 4 feed classes
├── dataset_d_feed_surface_with_anomalies.csv      # 1,080 samples including mould & heat anomalies
├── dataset_e_urea_strip_calibration.csv           # 600 calibrated urea paper-strip reaction points
└── sample_images/
    ├── feed_surface/
    │   ├── maize_silage_normal.jpg                # Typical golden/olive fermented maize silage
    │   ├── maize_silage_mould_anomaly.jpg         # Silage with localized pale mould cluster
    │   ├── green_fodder_normal.jpg                # Fresh green leafy fodder
    │   ├── dry_fodder_normal.jpg                  # Golden/tan dry straw
    │   └── concentrate_normal.jpg                 # Fine uniform pellet/grain meal
    └── urea_strips/
        ├── urea_strip_negative_0.1pct.jpg         # Yellow reaction (<0.4% urea equivalent)
        ├── urea_strip_suspected_0.8pct.jpg        # Olive-green reaction (0.5% - 1.2% urea)
        └── urea_strip_high_risk_2.2pct.jpg        # Deep cyan/blue reaction (>1.3% urea adulteration)
```

---

## 📊 Dataset D: Feed Surface & Texture Dataset

- **Files**:
  - `dataset_d_feed_surface_clean.csv` (800 rows × 24 columns)
  - `dataset_d_feed_surface_with_anomalies.csv` (1,080 rows × 24 columns)
- **Classes**:
  1. `Maize Silage` (class index 0)
  2. `Green Fodder` (class index 1)
  3. `Dry Fodder` (class index 2)
  4. `Concentrate` (class index 3)
- **Target Condition**:
  - `is_anomaly`: 0 = Normal / Healthy feed, 1 = Surface Mould or Spoilage Anomaly.

### Extracted Features (22 Numerical Columns):
| Feature Name | Description |
| :--- | :--- |
| `mean_r`, `std_r` | Red channel mean and standard deviation |
| `mean_g`, `std_g` | Green channel mean and standard deviation |
| `mean_b`, `std_b` | Blue channel mean and standard deviation |
| `mean_h`, `std_h` | Hue angle mean ($0^\circ - 360^\circ$) and variation |
| `mean_s`, `std_s` | Saturation mean ($0.0 - 1.0$) and variation |
| `mean_v`, `std_v` | Value/Brightness mean ($0.0 - 1.0$) and variation |
| `mean_gray`, `std_gray` | Grayscale luminance moments ($0 - 255$) |
| `pct_green` | % of pixels matching green foliage signature |
| `pct_golden` | % of pixels matching cured golden/amber signature |
| `pct_dark` | % of pixels matching blackened/charred anaerobic spoilage |
| `pct_pale` | % of pixels matching whitish/greyish mycelium/mould clusters |
| `grad_mean`, `grad_std`, `grad_max` | Directional Sobel edge gradients (particle texture roughness) |
| `local_var` | Spatial texture variance (particle chop-length uniformity) |

---

## 🧪 Dataset E: Urea Paper Strip Colorimetric Dataset

- **File**: `dataset_e_urea_strip_calibration.csv` (600 rows × 13 columns)
- **Chemical Assay**: Bromothymol Blue indicator + Urease enzyme reaction on paper test strip.
- **Concentration Range**: $0.00\%$ to $3.20\%$ added urea ($w/w$).

### Column Definitions:
| Column | Description |
| :--- | :--- |
| `urea_concentration_pct` | Continuous ground-truth urea concentration ($w/w \%$) |
| `status` | 3-Tier Risk Category: `NEGATIVE`, `SUSPECTED_ADULTERATION`, `HIGH_RISK_ADULTERATION` |
| `risk_index` | 0 = Negative, 1 = Suspected, 2 = High Risk |
| `hue_deg` | Measured Bromothymol Blue hue angle ($35^\circ$ to $240^\circ$) |
| `saturation`, `value` | HSV color saturation and brightness |
| `r`, `g`, `b` | Extracted mean sRGB color values of the reactive test pad |
| `L`, `a`, `b_cielab` | CIE $L^*a^*b^*$ coordinates under standard D65 illuminant |
| `hex_color` | Exact hex color code for visualization (e.g., `#EBCD2D`, `#235FD2`) |

---

## 🔬 Scientific Boundaries (Crucial Requirement)

> **Important**: This dataset and the models trained on it serve as a **rapid triage screening tool**. Computer vision does NOT directly measure molecular aflatoxins or mycotoxins. A flagged visual or colorimetric anomaly provides evidence for physical inspection and confirmatory wet-chemistry laboratory testing.
