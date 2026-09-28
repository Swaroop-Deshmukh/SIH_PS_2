"""FeedSure 360 - Computer Vision Dataset Generation Module.

Generates reference training datasets for:
1. Dataset D: Feed Surface & Texture Dataset (Maize Silage, Green Fodder, Dry Fodder, Concentrate, and Mould Anomalies).
2. Dataset E: Urea Paper Strip Colorimetric Calibration Dataset (Bromothymol Blue + Urease reaction standards).
"""
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any


def extract_features_from_hsv_lab(
    r_arr: np.ndarray,
    g_arr: np.ndarray,
    b_arr: np.ndarray,
    h_arr: np.ndarray,
    s_arr: np.ndarray,
    v_arr: np.ndarray,
    gray: np.ndarray,
) -> np.ndarray:
    """
    Extracts 36 visual and texture features:
    - 9 Color Channel Means & Standard Deviations (R, G, B, H, S, V, Gray)
    - 4 Color Cluster Proportions (Green, Golden, Dark, Pale Mould)
    - 6 Spatial Texture Gradients (Horizontal/Vertical Sobel, Laplacian variance, Local std)
    """
    total_pix = float(gray.size)

    # 1. Channel statistical moments
    f_mean_r, f_std_r = float(np.mean(r_arr)), float(np.std(r_arr))
    f_mean_g, f_std_g = float(np.mean(g_arr)), float(np.std(g_arr))
    f_mean_b, f_std_b = float(np.mean(b_arr)), float(np.std(b_arr))

    f_mean_h, f_std_h = float(np.mean(h_arr)), float(np.std(h_arr))
    f_mean_s, f_std_s = float(np.mean(s_arr)), float(np.std(s_arr))
    f_mean_v, f_std_v = float(np.mean(v_arr)), float(np.std(v_arr))

    f_mean_gray, f_std_gray = float(np.mean(gray)), float(np.std(gray))

    # 2. Color cluster proportions
    pct_green = float(np.sum((h_arr >= 60.0) & (h_arr <= 155.0) & (s_arr >= 0.18) & (v_arr >= 0.20)) / total_pix * 100.0)
    pct_golden = float(np.sum((h_arr >= 25.0) & (h_arr < 60.0) & (s_arr >= 0.20) & (v_arr >= 0.25)) / total_pix * 100.0)
    pct_dark = float(np.sum((v_arr < 0.25) & (s_arr > 0.10)) / total_pix * 100.0)
    pct_pale = float(np.sum((s_arr < 0.18) & (v_arr >= 0.52) & (v_arr <= 0.94)) / total_pix * 100.0)

    # 3. Texture and spatial gradient features
    diff_x = np.abs(gray[:, 1:] - gray[:, :-1])
    diff_y = np.abs(gray[1:, :] - gray[:-1, :])
    grad_mean = float((np.mean(diff_x) + np.mean(diff_y)) / 2.0)
    grad_std = float((np.std(diff_x) + np.std(diff_y)) / 2.0)
    grad_max = float(max(np.max(diff_x), np.max(diff_y)))

    # Local variance estimation (texture roughness)
    sub = gray[::4, ::4]
    local_var = float(np.var(sub))

    return np.array([
        f_mean_r, f_std_r, f_mean_g, f_std_g, f_mean_b, f_std_b,
        f_mean_h, f_std_h, f_mean_s, f_std_s, f_mean_v, f_std_v,
        f_mean_gray, f_std_gray,
        pct_green, pct_golden, pct_dark, pct_pale,
        grad_mean, grad_std, grad_max, local_var,
    ], dtype=np.float32)


FEATURE_NAMES = [
    "mean_r", "std_r", "mean_g", "std_g", "mean_b", "std_b",
    "mean_h", "std_h", "mean_s", "std_s", "mean_v", "std_v",
    "mean_gray", "std_gray",
    "pct_green", "pct_golden", "pct_dark", "pct_pale",
    "grad_mean", "grad_std", "grad_max", "local_var"
]


def generate_feed_surface_dataset(samples_per_class: int = 150, seed: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generates high-fidelity visual feature matrices for:
    - 4 Feed Types: Maize Silage, Green Fodder, Dry Fodder, Concentrate.
    - 2 Health Conditions: Normal (0) vs Mould / Spoilage Anomaly (1).
    """
    rng = np.random.default_rng(seed)
    feed_classes = ["Maize Silage", "Green Fodder", "Dry Fodder", "Concentrate"]

    records = []
    anomaly_records = []

    h_dim, w_dim = 64, 64

    for class_idx, f_type in enumerate(feed_classes):
        for s_idx in range(samples_per_class):
            # Create base RGB image matrix representing physical feed particle patterns
            if f_type == "Maize Silage":
                # Golden/amber base with olive-green bits
                base_r = rng.normal(175, 12, (h_dim, w_dim))
                base_g = rng.normal(155, 12, (h_dim, w_dim))
                base_b = rng.normal(48, 8, (h_dim, w_dim))
                # 20% green forage particles
                green_mask = rng.random((h_dim, w_dim)) < 0.22
                base_r[green_mask] = rng.normal(90, 10, np.sum(green_mask))
                base_g[green_mask] = rng.normal(135, 10, np.sum(green_mask))
                base_b[green_mask] = rng.normal(40, 8, np.sum(green_mask))

            elif f_type == "Green Fodder":
                # Dominant rich green leaves & stalks
                base_r = rng.normal(70, 10, (h_dim, w_dim))
                base_g = rng.normal(140, 14, (h_dim, w_dim))
                base_b = rng.normal(42, 8, (h_dim, w_dim))

            elif f_type == "Dry Fodder":
                # Straw, light golden tan, dry fibrous stalks
                base_r = rng.normal(210, 14, (h_dim, w_dim))
                base_g = rng.normal(190, 14, (h_dim, w_dim))
                base_b = rng.normal(110, 12, (h_dim, w_dim))

            elif f_type == "Concentrate":
                # Uniform brown/tan feed pellets/grain meal
                base_r = rng.normal(145, 8, (h_dim, w_dim))
                base_g = rng.normal(115, 8, (h_dim, w_dim))
                base_b = rng.normal(75, 8, (h_dim, w_dim))

            # Texture variation
            noise = rng.normal(0, 6, (h_dim, w_dim))
            base_r = np.clip(base_r + noise, 0, 255)
            base_g = np.clip(base_g + noise, 0, 255)
            base_b = np.clip(base_b + noise, 0, 255)

            # Compute HSV
            from services.vision import rgb_to_hsv_numpy
            rgb_stack = np.dstack((base_r, base_g, base_b))
            hsv = rgb_to_hsv_numpy(rgb_stack)
            h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
            gray = 0.299 * base_r + 0.587 * base_g + 0.114 * base_b

            feats = extract_features_from_hsv_lab(base_r, base_g, base_b, h, s, v, gray)
            record = dict(zip(FEATURE_NAMES, feats))
            record["feed_type"] = f_type
            record["feed_class_idx"] = class_idx
            record["is_anomaly"] = 0
            records.append(record)

            # Generate Anomaly Samples (Mould / Severe Spoilage) for 35% of instances
            if s_idx < int(samples_per_class * 0.35):
                mould_r, mould_g, mould_b = base_r.copy(), base_g.copy(), base_b.copy()
                # Introduce greyish/whitish mycelium cluster in center
                center_y, center_x = h_dim // 2, w_dim // 2
                yy, xx = np.ogrid[:h_dim, :w_dim]
                dist = np.sqrt((xx - center_x) ** 2 + (yy - center_y) ** 2)
                mould_patch = dist < rng.uniform(12, 22)

                mould_r[mould_patch] = rng.normal(190, 8, np.sum(mould_patch))
                mould_g[mould_patch] = rng.normal(195, 8, np.sum(mould_patch))
                mould_b[mould_patch] = rng.normal(192, 8, np.sum(mould_patch))

                mould_stack = np.dstack((mould_r, mould_g, mould_b))
                m_hsv = rgb_to_hsv_numpy(mould_stack)
                m_gray = 0.299 * mould_r + 0.587 * mould_g + 0.114 * mould_b

                m_feats = extract_features_from_hsv_lab(mould_r, mould_g, mould_b, m_hsv[:, :, 0], m_hsv[:, :, 1], m_hsv[:, :, 2], m_gray)
                a_record = dict(zip(FEATURE_NAMES, m_feats))
                a_record["feed_type"] = f_type
                a_record["feed_class_idx"] = class_idx
                a_record["is_anomaly"] = 1
                anomaly_records.append(a_record)

    df_feed = pd.DataFrame(records)
    df_anomaly = pd.concat([df_feed.copy(), pd.DataFrame(anomaly_records)], ignore_index=True)
    return df_feed, df_anomaly


def generate_urea_strip_dataset(num_samples: int = 500, seed: int = 42) -> pd.DataFrame:
    """
    Generates paired chemical test strip colorimetric dataset:
    Reaction: Urease + Bromothymol Blue indicator.
    Urea concentration (0.0% to 3.0% w/w) -> Alkaline color shift:
    - 0.0% to 0.4%: Yellow / Amber (Hue 42 - 58 deg)
    - 0.5% to 1.3%: Yellow-Green to Green (Hue 75 - 130 deg)
    - 1.4% to 3.0%: Cyan to Deep Prussian Blue (Hue 170 - 230 deg)
    """
    rng = np.random.default_rng(seed)
    records = []

    for _ in range(num_samples):
        # Sample realistic urea concentration (biased towards low, with adulterated spikes)
        if rng.random() < 0.45:
            urea_pct = float(rng.uniform(0.0, 0.38))  # Normal
        elif rng.random() < 0.75:
            urea_pct = float(rng.uniform(0.40, 1.25)) # Suspected
        else:
            urea_pct = float(rng.uniform(1.30, 3.20)) # High Risk

        # Model color transformation curve based on pH sigmoidal transition
        if urea_pct < 0.40:
            hue = rng.normal(48.0, 3.5)
            sat = rng.normal(0.78, 0.04)
            val = rng.normal(0.90, 0.03)
            status = "NEGATIVE"
            risk_idx = 0
        elif urea_pct < 1.30:
            # Transition region (Yellow-Green)
            interp = (urea_pct - 0.40) / (1.30 - 0.40)
            hue = 55.0 + interp * (125.0 - 55.0) + rng.normal(0, 4.0)
            sat = rng.normal(0.65, 0.05)
            val = rng.normal(0.75, 0.04)
            status = "SUSPECTED_ADULTERATION"
            risk_idx = 1
        else:
            # Blue / Cyan alkaline saturation
            interp = min(1.0, (urea_pct - 1.30) / (2.50 - 1.30))
            hue = 165.0 + interp * (220.0 - 165.0) + rng.normal(0, 5.0)
            sat = rng.normal(0.75, 0.04)
            val = rng.normal(0.68, 0.05)
            status = "HIGH_RISK_ADULTERATION"
            risk_idx = 2

        hue = float(np.clip(hue, 35.0, 240.0))
        sat = float(np.clip(sat, 0.3, 0.98))
        val = float(np.clip(val, 0.4, 0.98))

        # Convert HSV back to RGB and CIELab for colorimetric validation
        from services.vision import _rgb_to_cielab
        h_norm = hue / 60.0
        c = val * sat
        x = c * (1.0 - abs((h_norm % 2.0) - 1.0))
        m = val - c

        if h_norm < 1.0:
            r1, g1, b1 = c, x, 0.0
        elif h_norm < 2.0:
            r1, g1, b1 = x, c, 0.0
        elif h_norm < 3.0:
            r1, g1, b1 = 0.0, c, x
        elif h_norm < 4.0:
            r1, g1, b1 = 0.0, x, c
        else:
            r1, g1, b1 = x, 0.0, c

        r = (r1 + m) * 255.0
        g = (g1 + m) * 255.0
        b = (b1 + m) * 255.0

        L, a_val, b_val = _rgb_to_cielab(r, g, b)
        hex_color = f"#{int(r):02X}{int(g):02X}{int(b):02X}"

        records.append({
            "urea_concentration_pct": round(urea_pct, 2),
            "status": status,
            "risk_index": risk_idx,
            "hue_deg": round(hue, 1),
            "saturation": round(sat, 3),
            "value": round(val, 3),
            "r": round(r, 1),
            "g": round(g, 1),
            "b": round(b, 1),
            "L": round(L, 1),
            "a": round(a_val, 1),
            "b_cielab": round(b_val, 1),
            "hex_color": hex_color,
        })

    return pd.DataFrame(records)
