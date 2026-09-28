"""
FeedSure 360 - Chemometrics Spectral Preprocessing Pipeline
============================================================
Mathematical implementations of standard chemometric transforms for
diffuse reflectance Near-Infrared (NIR) spectroscopy:
1. Standard Normal Variate (SNV) - eliminates light scattering from particle size
2. Savitzky-Golay 1st & 2nd derivative filtering - resolves overlapping chemical bands
3. Polynomial Detrending - corrects curvilinear baseline shifts
4. Multiplicative Scatter Correction (MSC)
"""

from typing import Optional, Tuple, Dict, Any, Union
import numpy as np
from scipy.signal import savgol_filter


def apply_snv(spectra: np.ndarray) -> np.ndarray:
    """
    Standard Normal Variate (SNV) transformation.
    Centres and scales each individual spectrum by its own mean and standard deviation:
        SNV(x_i) = (x_i - mean(x_i)) / std(x_i)
    Eliminates additive baseline offsets and multiplicative slope variations
    arising from physical sample particle size differences.
    """
    arr = np.asarray(spectra, dtype=np.float64)
    if arr.ndim == 1:
        mean = np.mean(arr)
        std = np.std(arr)
        return (arr - mean) / (std if std > 1e-9 else 1.0)
    elif arr.ndim == 2:
        mean = np.mean(arr, axis=1, keepdims=True)
        std = np.std(arr, axis=1, keepdims=True)
        std = np.where(std < 1e-9, 1.0, std)
        return (arr - mean) / std
    else:
        raise ValueError("Spectra array must be 1D or 2D.")


def apply_savgol(
    spectra: np.ndarray,
    window_length: int = 5,
    polyorder: int = 2,
    deriv: int = 1,
) -> np.ndarray:
    """
    Savitzky-Golay polynomial smoothing and derivative filter.
    Separates overlapping absorption bands (e.g., O-H at 970nm, C-H/N-H at 910nm-1020nm)
    and removes broad baseline drift while preserving peak positions.
    """
    arr = np.asarray(spectra, dtype=np.float64)
    # Ensure window_length is odd and does not exceed array length
    n_points = arr.shape[-1]
    if window_length >= n_points:
        window_length = n_points if n_points % 2 != 0 else n_points - 1
    if window_length <= polyorder:
        polyorder = max(1, window_length - 1)

    return savgol_filter(arr, window_length=window_length, polyorder=polyorder, deriv=deriv, axis=-1)


def apply_detrend(spectra: np.ndarray, polyorder: int = 2) -> np.ndarray:
    """
    Curvilinear baseline detrending.
    Fits a polynomial curve to each spectrum and subtracts it to eliminate curvature.
    """
    arr = np.asarray(spectra, dtype=np.float64)
    is_1d = arr.ndim == 1
    if is_1d:
        arr = arr.reshape(1, -1)

    n_samples, n_points = arr.shape
    x = np.arange(n_points, dtype=np.float64)
    detrended = np.zeros_like(arr)

    for i in range(n_samples):
        poly_coeff = np.polyfit(x, arr[i], deg=min(polyorder, n_points - 1))
        baseline = np.polyval(poly_coeff, x)
        detrended[i] = arr[i] - baseline

    return detrended[0] if is_1d else detrended


def apply_msc(
    spectra: np.ndarray,
    reference: Optional[np.ndarray] = None,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Multiplicative Scatter Correction (MSC).
    Regresses each sample spectrum against an ideal reference spectrum (mean spectrum).
    Returns (corrected_spectra, reference_spectrum).
    """
    arr = np.asarray(spectra, dtype=np.float64)
    is_1d = arr.ndim == 1
    if is_1d:
        arr = arr.reshape(1, -1)

    if reference is None:
        ref = np.mean(arr, axis=0)
    else:
        ref = np.asarray(reference, dtype=np.float64)

    n_samples = arr.shape[0]
    corrected = np.zeros_like(arr)

    for i in range(n_samples):
        # Linear regression: sample = a + b * ref
        fit = np.polyfit(ref, arr[i], deg=1)
        slope = fit[0] if abs(fit[0]) > 1e-9 else 1.0
        offset = fit[1]
        corrected[i] = (arr[i] - offset) / slope

    res_arr = corrected[0] if is_1d else corrected
    return res_arr, ref


def preprocess_spectrum_suite(spectrum: Union[list, np.ndarray]) -> Dict[str, Any]:
    """
    Executes complete chemometrics transformation suite on a single spectrum.
    Returns clean serialized arrays for both model inference and UI chart overlays.
    """
    raw = np.asarray(spectrum, dtype=np.float64)
    snv_res = apply_snv(raw)
    sg1 = apply_savgol(snv_res, window_length=5, polyorder=2, deriv=1)
    sg2 = apply_savgol(snv_res, window_length=5, polyorder=2, deriv=2)
    detrend_res = apply_detrend(snv_res, polyorder=2)

    # Standard gold-standard chemometric feature vector for forage testing:
    # SNV + 1st Derivative (SG1)
    processed_recommended = sg1.copy()

    return {
        "raw": [round(float(v), 5) for v in raw],
        "snv": [round(float(v), 5) for v in snv_res],
        "savgol_1st_derivative": [round(float(v), 5) for v in sg1],
        "savgol_2nd_derivative": [round(float(v), 5) for v in sg2],
        "detrended": [round(float(v), 5) for v in detrend_res],
        "recommended_processed": [round(float(v), 5) for v in processed_recommended],
        "pipeline_signature": "SNV + Savitzky-Golay(w=5, p=2, d=1)",
    }


def preprocess_spectrum(
    spectrum: Union[list, np.ndarray],
    method: str = "snv_savgol"
) -> np.ndarray:
    """
    Standardizes a 1D or 2D spectral array using standard NIR chemometric pipeline:
    - 'snv_savgol': SNV centering/scaling followed by Savitzky-Golay 1st derivative (w=5, p=2, d=1).
    - 'snv': SNV centering/scaling alone.
    - 'savgol': Savitzky-Golay 1st derivative alone.
    - 'detrend': Polynomial baseline detrending.
    """
    arr = np.asarray(spectrum, dtype=np.float64)
    if method == "snv":
        return apply_snv(arr)
    elif method == "savgol":
        return apply_savgol(arr, window_length=5, polyorder=2, deriv=1)
    elif method == "detrend":
        return apply_detrend(arr, polyorder=2)
    elif method == "snv_savgol":
        snv_res = apply_snv(arr)
        return apply_savgol(snv_res, window_length=5, polyorder=2, deriv=1)
    else:
        return arr
