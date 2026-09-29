"""FeedSure 360 - Chemometrics NIR Inference & Calibration Domain Engine.

Implements research-grade diffuse reflectance NIR chemometrics (ISO 12099 / ASTM E1655):
1. Preprocessing (SNV + Savitzky-Golay 1st derivative).
2. Real PLSR model inference for DM %, Moisture %, CP %, NDF %, ADF %.
3. Real Mahalanobis Distance (D_M) in calibration PCA score space:
       D_M = sqrt( 1/k * (z - mu)^T Sigma^-1 (z - mu) )
   If D_M > 2.5 -> "OUT OF CALIBRATION DOMAIN — QUANTITATIVE PREDICTION NOT TRUSTED"
4. Dynamic 95% Confidence Intervals (+- 1.96 * sigma).
5. Multi-point spatial heterogeneity and Coefficient of Variation (CV).
"""
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Union

import joblib
import numpy as np

from services.preprocessing import preprocess_spectrum, preprocess_spectrum_suite

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "chemometrics" / "chemometrics_engine.joblib"
METRICS_PATH = BASE_DIR / "models" / "chemometrics" / "chemometrics_metrics.json"

TARGET_WAVELENGTHS = list(range(800, 1060, 10))  # 26 wavelengths


class ChemometricsEngine:
    _instance: Optional["ChemometricsEngine"] = None

    def __init__(self):
        self.model_bundle: Optional[Dict[str, Any]] = None
        self.metrics: Optional[Dict[str, Any]] = None
        self._load_models()

    @classmethod
    def get_instance(cls) -> "ChemometricsEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_models(self) -> None:
        if MODEL_PATH.is_file():
            try:
                self.model_bundle = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"[ChemometricsEngine] Warning: failed loading {MODEL_PATH}: {e}")
                self.model_bundle = None

        if METRICS_PATH.is_file():
            try:
                with open(METRICS_PATH, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)
            except Exception as e:
                print(f"[ChemometricsEngine] Warning: failed loading {METRICS_PATH}: {e}")
                self.metrics = None

    def _standardize_spectrum(self, spectrum: Union[List[float], np.ndarray]) -> np.ndarray:
        """Ensures spectrum matches the 26 bands (800nm - 1050nm in 10nm steps)."""
        raw = np.asarray(spectrum, dtype=np.float64)
        if len(raw) == len(TARGET_WAVELENGTHS):
            return raw
        elif len(raw) == 21:
            # Interpolate from 800-1000 nm to 800-1050 nm
            old_wls = list(range(800, 1010, 10))
            return np.interp(TARGET_WAVELENGTHS, old_wls, raw, left=raw[0], right=raw[-1])
        else:
            # Arbitrary wavelength vector - interpolate to target grid
            curr_x = np.linspace(800, 1050, len(raw))
            return np.interp(TARGET_WAVELENGTHS, curr_x, raw)

    def calculate_mahalanobis_distance(
        self,
        spectrum: Union[List[float], np.ndarray],
        feed_type: str = "Maize Silage"
    ) -> Dict[str, Any]:
        """
        Computes PCA score projection and real Mahalanobis distance D_M:
            D_M = sqrt( 1/k * (z - mu)^T Sigma^-1 (z - mu) )
        Evaluates whether the sample is inside the validated calibration domain.
        """
        spec_26 = self._standardize_spectrum(spectrum)
        prep = preprocess_spectrum(spec_26)

        if not self.model_bundle:
            return {
                "mahalanobis_distance": 1.0,
                "is_ood": False,
                "domain_status": "IN_DOMAIN",
                "calibration_fit_pct": 95.0,
                "message": "Model bundle not loaded; fallback default."
            }

        commodities = self.model_bundle.get("commodities", {})
        comm = commodities.get(feed_type) or self.model_bundle.get("global")

        pca = comm["pca"]
        mu_z = comm["mu_z"]
        cov_inv = comm["cov_inv"]
        k = comm.get("k_components", 4)

        z = pca.transform(prep.reshape(1, -1))[0]
        diff = z - mu_z
        # Normalized Mahalanobis distance (scaled by sqrt(k))
        dm = float(np.sqrt(np.clip(diff.T @ cov_inv @ diff, 0.0, None) / float(k)))

        # Calibration domain decision logic (Threshold = 2.50)
        if dm <= 2.0:
            domain_status = "IN_DOMAIN"
            calibration_fit_pct = float(np.clip(100.0 - (dm * 12.0), 75.0, 100.0))
            is_ood = False
            warning = None
        elif dm <= 2.5:
            domain_status = "MARGINAL"
            calibration_fit_pct = float(np.clip(100.0 - (dm * 18.0), 55.0, 75.0))
            is_ood = False
            warning = "MARGINAL CALIBRATION DOMAIN — ELEVATED PREDICTION UNCERTAINTY"
        else:
            domain_status = "OUT_OF_DOMAIN"
            calibration_fit_pct = float(np.clip(100.0 - (dm * 6.5), 10.0, 50.0))
            is_ood = True
            warning = "OUT OF CALIBRATION DOMAIN — QUANTITATIVE PREDICTION NOT TRUSTED"

        return {
            "mahalanobis_distance": round(dm, 3),
            "is_ood": is_ood,
            "domain_status": domain_status,
            "calibration_fit_pct": round(calibration_fit_pct, 1),
            "threshold": 2.50,
            "pca_scores": [round(float(v), 4) for v in z],
            "warning": warning
        }

    def calculate_acid_insoluble_ash(
        self,
        spectrum: Union[List[float], np.ndarray],
        feed_type: str = "Maize Silage"
    ) -> Dict[str, Any]:
        """
        Estimates Acid-Insoluble Ash (AIA % / Sand & Silica Contamination)
        from NIR diffuse reflectance baseline scattering tilt between 850 nm and 1050 nm.
        Particulate mineral scattering (silica/sand) induces a positive baseline tilt and elevated offset.
        - AIA < 2.5%: LOW_CLEAN (Natural clean forage)
        - AIA 2.5% - 5.0%: MODERATE_SOIL_DUST (Dust/soil contamination from harvesting)
        - AIA > 5.0%: HIGH_SILICA_RISK (Sand/silica adulteration or sweepings; risk of abomasal impaction)
        """
        spec = self._standardize_spectrum(spectrum)
        r_850 = float(spec[5])
        r_1050 = float(spec[25])
        baseline_tilt = r_1050 - r_850
        baseline_mean = float(np.mean(spec))

        base_aia = {
            "Maize Silage": 1.4,
            "Green Fodder": 1.8,
            "Dry Fodder": 2.2,
            "Concentrate": 1.1
        }.get(feed_type, 1.5)

        tilt_factor = max(0.0, baseline_tilt - 0.02) * 28.0
        offset_factor = max(0.0, baseline_mean - 0.50) * 8.0
        estimated_aia = round(float(np.clip(base_aia + tilt_factor + offset_factor, 0.4, 12.0)), 2)

        if estimated_aia < 2.5:
            risk = "LOW_CLEAN"
            risk_label = "Clean Forage (<2.5% AIA)"
            badge_color = "EMERALD"
            advisory = "Low sand/silica content (<2.5% AIA). Safe for rumen digestion without impaction risk."
        elif estimated_aia <= 5.0:
            risk = "MODERATE_DUST"
            risk_label = "Moderate Soil/Dust (2.5 - 5.0% AIA)"
            badge_color = "AMBER"
            advisory = "Moderate soil/dust residue detected. Recommend checking harvesting cutter bar height and storage sweepings."
        else:
            risk = "HIGH_SILICA_RISK"
            risk_label = "High Silica / Sand Adulteration Risk (>5.0% AIA)"
            badge_color = "RED"
            advisory = "Elevated Acid-Insoluble Ash indicates significant sand/soil sweepings or mineral adulteration. High risk of abomasal impaction and tooth wear. Perform water-sediment test before feeding."

        return {
            "estimated_aia_pct": estimated_aia,
            "baseline_tilt_delta_r": round(baseline_tilt, 4),
            "baseline_mean_r": round(baseline_mean, 4),
            "risk_level": risk,
            "risk_label": risk_label,
            "badge_color": badge_color,
            "advisory": advisory
        }

    def estimate_mineral_balance(
        self,
        feed_type: str = "Maize Silage",
        cp_pct: float = 8.8,
        aia_pct: float = 1.5
    ) -> Dict[str, Any]:
        """
        Estimates Calcium (Ca %) and Phosphorus (P %) to compute the critical Ca:P mineral ratio.
        Under NRC / ICAR dairy standards:
        - Optimal Ca:P ratio: 1.5:1 to 2.0:1
        - Acceptable: 1.2:1 to 2.5:1
        - Inverted (< 1.1:1): High risk of Hypocalcemia / Milk Fever in transition cows
        - Excessive (> 3.0:1): Antagonizes zinc, magnesium and phosphorus absorption
        """
        if feed_type == "Green Fodder":
            est_ca = round(0.55 + 0.02 * max(0.0, cp_pct - 8.0), 2)
            est_p = round(0.28 + 0.01 * max(0.0, cp_pct - 8.0), 2)
        elif feed_type == "Dry Fodder":
            est_ca = 0.32
            est_p = 0.12
        elif feed_type == "Concentrate":
            est_ca = 0.65
            est_p = 0.45
        else:  # Maize Silage
            est_ca = 0.28
            est_p = 0.20

        ratio = round(est_ca / max(0.05, est_p), 2)

        if 1.4 <= ratio <= 2.2:
            status = "OPTIMAL"
            status_label = f"Optimal Mineral Ratio ({ratio}:1)"
            badge_color = "EMERALD"
            advisory = "Calcium to phosphorus ratio is well balanced for dairy cow metabolism."
        elif (1.1 <= ratio < 1.4) or (2.2 < ratio <= 2.8):
            status = "ACCEPTABLE"
            status_label = f"Acceptable Mineral Balance ({ratio}:1)"
            badge_color = "BLUE"
            advisory = "Mineral ratio is within physiological tolerance. Supplement with balanced chelated mineral mixture."
        elif ratio < 1.1:
            status = "INVERTED_DEFICIENT_CALCIUM"
            status_label = f"Inverted Ca:P Ratio ({ratio}:1) — Hypocalcemia Risk"
            badge_color = "RED"
            advisory = "Phosphorus exceeds or equals calcium. Inverted ratio risks milk fever (hypocalcemia) in transition cows. Supplement with calcite powder or high-calcium mineral mixture."
        else:
            status = "HIGH_CALCIUM_IMBALANCE"
            status_label = f"Excessive Calcium Ratio ({ratio}:1)"
            badge_color = "AMBER"
            advisory = "High calcium relative to phosphorus. Check dicalcium phosphate (DCP) supplementation."

        return {
            "estimated_ca_pct": est_ca,
            "estimated_p_pct": est_p,
            "ca_to_p_ratio": ratio,
            "status": status,
            "status_label": status_label,
            "badge_color": badge_color,
            "ideal_range": "1.5 : 1 — 2.0 : 1",
            "advisory": advisory
        }

    def predict_spectrum(
        self,
        spectrum: Union[List[float], np.ndarray],
        feed_type: str = "Maize Silage"
    ) -> Dict[str, Any]:
        """
        Executes genuine chemometrics pipeline:
        1. Preprocessing (SNV + Savitzky-Golay 1st derivative)
        2. Real PLSR inference for DM %, CP %, NDF %, ADF %
        3. Real Mahalanobis distance D_M
        4. Dynamic 95% Confidence Intervals (+- 1.96 * sigma)
        5. Acid-Insoluble Ash (AIA %) sand/silica screening & Ca:P mineral ratio
        """
        spec_26 = self._standardize_spectrum(spectrum)
        prep = preprocess_spectrum(spec_26)
        prep_suite = preprocess_spectrum_suite(spec_26)

        ood_info = self.calculate_mahalanobis_distance(spec_26, feed_type=feed_type)
        dm = ood_info["mahalanobis_distance"]
        is_ood = ood_info["is_ood"]

        aia_info = self.calculate_acid_insoluble_ash(spec_26, feed_type=feed_type)

        if not self.model_bundle:
            base_dm = 34.5 if feed_type == "Maize Silage" else 22.0
            mineral_info = self.estimate_mineral_balance(feed_type=feed_type, cp_pct=8.8, aia_pct=aia_info["estimated_aia_pct"])
            return {
                "dry_matter_pct": base_dm,
                "moisture_pct": round(100.0 - base_dm, 2),
                "crude_protein_pct": 8.8,
                "ndf_pct": 46.2,
                "adf_pct": 26.1,
                "is_simulated_data": True,
                "data_badge": "SIMULATED DEMO REFERENCE",
                "mahalanobis_distance": dm,
                "is_ood": is_ood,
                "domain_status": ood_info["domain_status"],
                "confidence_intervals": {},
                "sand_silica_screening": aia_info,
                "mineral_balance": mineral_info,
                "preprocessing": prep_suite
            }

        commodities = self.model_bundle.get("commodities", {})
        comm = commodities.get(feed_type) or self.model_bundle.get("global")

        plsr = comm["plsr"]
        sep_dict = comm.get("sep", {"dry_matter_pct": 0.5, "crude_protein_pct": 0.35, "ndf_pct": 0.7, "adf_pct": 0.6})

        raw_pred = plsr.predict(prep.reshape(1, -1))[0]
        dm_pred = float(np.clip(raw_pred[0], 5.0, 98.0))
        cp_pred = float(np.clip(raw_pred[1], 1.0, 45.0))
        ndf_pred = float(np.clip(raw_pred[2], 10.0, 90.0))
        adf_pred = float(np.clip(raw_pred[3], 5.0, 75.0))
        moisture_pred = float(np.clip(100.0 - dm_pred, 2.0, 95.0))

        mineral_info = self.estimate_mineral_balance(feed_type=feed_type, cp_pct=cp_pred, aia_pct=aia_info["estimated_aia_pct"])

        uncertainty_expansion = 1.0 + (0.35 * max(0.0, dm - 1.5))
        sigmas = {
            "dry_matter": round(sep_dict.get("dry_matter_pct", 0.5) * uncertainty_expansion, 3),
            "moisture": round(sep_dict.get("dry_matter_pct", 0.5) * uncertainty_expansion, 3),
            "crude_protein": round(sep_dict.get("crude_protein_pct", 0.35) * uncertainty_expansion, 3),
            "ndf": round(sep_dict.get("ndf_pct", 0.7) * uncertainty_expansion, 3),
            "adf": round(sep_dict.get("adf_pct", 0.6) * uncertainty_expansion, 3),
        }

        confidence_intervals = {
            "dry_matter_pct": [round(dm_pred - 1.96 * sigmas["dry_matter"], 2), round(dm_pred + 1.96 * sigmas["dry_matter"], 2)],
            "moisture_pct": [round(moisture_pred - 1.96 * sigmas["moisture"], 2), round(moisture_pred + 1.96 * sigmas["moisture"], 2)],
            "crude_protein_pct": [round(cp_pred - 1.96 * sigmas["crude_protein"], 2), round(cp_pred + 1.96 * sigmas["crude_protein"], 2)],
            "ndf_pct": [round(ndf_pred - 1.96 * sigmas["ndf"], 2), round(ndf_pred + 1.96 * sigmas["ndf"], 2)],
            "adf_pct": [round(adf_pred - 1.96 * sigmas["adf"], 2), round(adf_pred + 1.96 * sigmas["adf"], 2)],
        }

        if is_ood:
            badge = "OUT OF CALIBRATION DOMAIN — QUANTITATIVE PREDICTION NOT TRUSTED"
        elif ood_info["domain_status"] == "MARGINAL":
            badge = "CHEMOMETRICS PLSR MODEL (MARGINAL CALIBRATION DOMAIN)"
        else:
            badge = "CHEMOMETRICS PLSR MODEL PREDICTION (ISO 12099 / ASTM E1655)"

        return {
            "dry_matter_pct": round(dm_pred, 2),
            "moisture_pct": round(moisture_pred, 2),
            "crude_protein_pct": round(cp_pred, 2),
            "ndf_pct": round(ndf_pred, 2),
            "adf_pct": round(adf_pred, 2),
            "is_simulated_data": False,
            "data_badge": badge,
            "mahalanobis_distance": dm,
            "is_ood": is_ood,
            "domain_status": ood_info["domain_status"],
            "calibration_fit_pct": ood_info["calibration_fit_pct"],
            "uncertainty_sigma": sigmas,
            "confidence_intervals": confidence_intervals,
            "sand_silica_screening": aia_info,
            "mineral_balance": mineral_info,
            "warning": ood_info["warning"],
            "preprocessing": prep_suite
        }

    def predict_multi_point(
        self,
        nir_data: Dict[str, Any],
        feed_type: str = "Maize Silage"
    ) -> Dict[str, Any]:
        """
        Processes 5-point sampling grid:
        - Point-by-point PLSR prediction
        - Spatial mean and standard deviation
        - Coefficient of Variation (CV = sigma / mu * 100%)
        - Spatial heterogeneity flag (CV > 12%)
        - Average Mahalanobis distance D_M
        """
        points = nir_data.get("points", [])
        if not points:
            return self.predict_spectrum([0.45] * 26, feed_type=feed_type)

        point_results = []
        dms = []
        dm_list = []
        cp_list = []
        ndf_list = []
        adf_list = []
        moist_list = []

        for p in points:
            res = self.predict_spectrum(p["reflectance"], feed_type=feed_type)
            point_results.append({
                "point_id": p.get("point_id", "Point"),
                **res
            })
            dms.append(res["mahalanobis_distance"])
            dm_list.append(res["dry_matter_pct"])
            cp_list.append(res["crude_protein_pct"])
            ndf_list.append(res["ndf_pct"])
            adf_list.append(res["adf_pct"])
            moist_list.append(res["moisture_pct"])

        mean_dm = float(np.mean(dm_list))
        mean_cp = float(np.mean(cp_list))
        mean_ndf = float(np.mean(ndf_list))
        mean_adf = float(np.mean(adf_list))
        mean_moist = float(np.mean(moist_list))
        mean_dist = float(np.mean(dms))

        # Spatial Coefficient of Variation across the 5 points (ISO 12099 / Forage Sampling)
        # Evaluates physical point-to-point reflectance heterogeneity across the 5 core sampling locations
        all_reflectances = [np.asarray(p["reflectance"], dtype=np.float64) for p in points]
        pt_means = [float(np.mean(r)) for r in all_reflectances]
        overall_mean_ref = float(np.mean(pt_means))
        ref_std = float(np.std(pt_means))
        spectral_cv = float((ref_std / (overall_mean_ref if overall_mean_ref > 1e-4 else 1.0)) * 100.0)

        # Identify anomalous/most deviant sampling point in the 3x3 grid
        deviations = [abs(m - overall_mean_ref) for m in pt_means]
        max_dev_idx = int(np.argmax(deviations))
        anomalous_point_id = points[max_dev_idx].get("point_id", f"Sampling Point {max_dev_idx + 1}")

        is_heterogeneous = spectral_cv > 12.0
        is_ood = (mean_dist > 2.50 and not is_heterogeneous) or (any(p["is_ood"] for p in point_results) and not is_heterogeneous)

        if is_heterogeneous:
            badge = "CHEMOMETRICS PREDICTION — HETEROGENEOUS BATCH (RETEST RECOMMENDED)"
            domain_status = "HETEROGENEOUS"
        elif is_ood:
            badge = "OUT OF CALIBRATION DOMAIN — QUANTITATIVE PREDICTION NOT TRUSTED"
            domain_status = "OUT_OF_DOMAIN"
        elif mean_dist > 2.0:
            badge = "CHEMOMETRICS PLSR MODEL (MARGINAL CALIBRATION DOMAIN)"
            domain_status = "MARGINAL"
        else:
            badge = "CHEMOMETRICS PLSR MODEL PREDICTION (ISO 12099 / ASTM E1655)"
            domain_status = "IN_DOMAIN"

        # Dynamic uncertainty bounds for batch average
        avg_uncertainty = point_results[0]["uncertainty_sigma"]
        confidence_intervals = {
            "dry_matter_pct": [round(mean_dm - 1.96 * avg_uncertainty["dry_matter"], 2), round(mean_dm + 1.96 * avg_uncertainty["dry_matter"], 2)],
            "moisture_pct": [round(mean_moist - 1.96 * avg_uncertainty["moisture"], 2), round(mean_moist + 1.96 * avg_uncertainty["moisture"], 2)],
            "crude_protein_pct": [round(mean_cp - 1.96 * avg_uncertainty["crude_protein"], 2), round(mean_cp + 1.96 * avg_uncertainty["crude_protein"], 2)],
            "ndf_pct": [round(mean_ndf - 1.96 * avg_uncertainty["ndf"], 2), round(mean_ndf + 1.96 * avg_uncertainty["ndf"], 2)],
            "adf_pct": [round(mean_adf - 1.96 * avg_uncertainty["adf"], 2), round(mean_adf + 1.96 * avg_uncertainty["adf"], 2)],
        }

        calibration_fit_pct = float(np.mean([p["calibration_fit_pct"] for p in point_results]))

        # Aggregate Acid-Insoluble Ash (AIA %) across the 5 spatial sampling points
        avg_aia = float(np.mean([p["sand_silica_screening"]["estimated_aia_pct"] for p in point_results]))
        if avg_aia < 2.5:
            aia_risk = "LOW_CLEAN"
            aia_label = "Clean Forage (<2.5% AIA)"
            aia_badge = "EMERALD"
            aia_adv = "Low sand/silica content (<2.5% AIA). Safe for rumen digestion without impaction risk."
        elif avg_aia <= 5.0:
            aia_risk = "MODERATE_DUST"
            aia_label = "Moderate Soil/Dust (2.5 - 5.0% AIA)"
            aia_badge = "AMBER"
            aia_adv = "Moderate soil/dust residue detected across spatial core. Recommend checking harvesting cutter bar height."
        else:
            aia_risk = "HIGH_SILICA_RISK"
            aia_label = "High Silica / Sand Adulteration Risk (>5.0% AIA)"
            aia_badge = "RED"
            aia_adv = "Elevated Acid-Insoluble Ash across multi-point grid indicates sand sweepings or mineral adulteration. Water-sediment test recommended."

        overall_aia_info = {
            "estimated_aia_pct": round(avg_aia, 2),
            "baseline_tilt_delta_r": round(float(np.mean([p["sand_silica_screening"]["baseline_tilt_delta_r"] for p in point_results])), 4),
            "baseline_mean_r": round(float(np.mean([p["sand_silica_screening"]["baseline_mean_r"] for p in point_results])), 4),
            "risk_level": aia_risk,
            "risk_label": aia_label,
            "badge_color": aia_badge,
            "advisory": aia_adv
        }

        overall_mineral_info = self.estimate_mineral_balance(feed_type=feed_type, cp_pct=mean_cp, aia_pct=avg_aia)

        return {
            "dry_matter_pct": round(mean_dm, 2),
            "moisture_pct": round(mean_moist, 2),
            "crude_protein_pct": round(mean_cp, 2),
            "ndf_pct": round(mean_ndf, 2),
            "adf_pct": round(mean_adf, 2),
            "is_simulated_data": False,
            "data_badge": badge,
            "mahalanobis_distance": round(mean_dist, 3),
            "is_ood": is_ood,
            "domain_status": domain_status,
            "calibration_fit_pct": round(calibration_fit_pct, 1),
            "uncertainty_sigma": avg_uncertainty,
            "confidence_intervals": confidence_intervals,
            "sand_silica_screening": overall_aia_info,
            "mineral_balance": overall_mineral_info,
            "spatial_metrics": {
                "sample_points_count": len(points),
                "spectral_cv_pct": round(spectral_cv, 2),
                "is_heterogeneous": is_heterogeneous,
                "anomalous_point_id": anomalous_point_id if is_heterogeneous else None,
                "cv_threshold_pct": 12.0
            },
            "point_predictions": point_results,
            "preprocessing": point_results[0]["preprocessing"] if point_results else None
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Returns ISO 12099 audit metrics report."""
        if self.metrics:
            return self.metrics
        return {
            "status": "UNAVAILABLE",
            "message": "Chemometrics engine metrics not yet generated. Run train_chemometrics_models.py."
        }


# Global singleton access
def get_chemometrics_engine() -> ChemometricsEngine:
    return ChemometricsEngine.get_instance()
