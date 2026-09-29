# FeedSure 360 — Dairy Nutrition & Advisory Decision Rules

## 1. Indian Dairy Nutrition Guidelines (ICAR / NDRI)

FeedSure 360 translates raw chemical percentages (DM, CP, NDF, ADF) into actionable herd-level feeding recommendations using standard Indian Council of Agricultural Research (ICAR) and National Dairy Research Institute (NDRI) dairy cattle standards.

---

## 2. Herd Nutritional Calculations

### 2.1 Dry Matter Intake (DMI) Calculation
Total herd dry matter is computed by summing the dry matter contributions across all feed basket components:
$$\text{Total DM (kg)} = \sum_{i=1}^N \text{Quantity}_i \times \frac{\text{DM}\%_i}{100}$$

### 2.2 Basket Weighted Crude Protein
$$\text{Weighted CP}\% = \frac{\sum_{i=1}^N (\text{Quantity}_i \times \frac{\text{DM}\%_i}{100} \times \text{CP}\%_i)}{\text{Total DM (kg)}}$$

### 2.3 Reference Group CP Targets
- **Lactating Dairy Cows (12–15 L/day average yield):** 14.5% CP (DM basis)
- **High-Yielding Crossbreds (>20 L/day yield):** 16.0% CP (DM basis)
- **Dry / Non-Lactating Pregnant Cows:** 11.5% CP (DM basis)

---

## 3. Severity-Tiered Advisory Rules

| Advisory ID | Severity | Condition Trigger | Recommended Action |
|---|---|---|---|
| **ADV-NUT-001** | **WARNING** | Basket CP < Target CP by >1.5% | Increase protein concentrate (mustard/cottonseed cake) by 0.5–1.0 kg/animal. |
| **ADV-NUT-002** | **INFO** | Basket CP > Target CP by >2.0% | Excess protein increases nitrogen excretion; review concentrate inclusion rate. |
| **ADV-NUT-003** | **CAUTION** | Tested NDF > 40% (DM basis) | Coarse roughage limits intake; balance with digestible green fodder or chop size reduction. |
| **ADV-NUT-004** | **WARNING** | Tested NDF < 32% (DM basis) | Low effective fiber increases Subacute Rumen Acidosis (SARA) risk; add chopped straw. |
| **ADV-STOR-002** | **CRITICAL** | Silage Temp > 32°C & pH > 4.2 | Aerobic spoilage active; discard visibly heated silage face before feeding. |
| **ADV-ESC-001** | **CRITICAL** | Mahalanobis $D_M > 3.5$ (OOD) | Prediction withheld; submit representative sample to regional dairy union wet lab. |
| **ADV-ESC-003** | **CRITICAL** | p-DMAB Urea Strip flagged | Suspected non-protein nitrogen adulteration; quarantine batch immediately. |
