"""
FeedSure 360 - Automated Training Pipeline for Real-World Image Datasets
========================================================================
This script scans user-provided real images from:
  backend/datasets/real_images/feed_surface/
  backend/datasets/real_images/urea_strips/
extracts quantitative computer vision and colorimetric features,
trains scikit-learn models, and saves the weights to backend/models/vision/.
"""

import os
import sys
from pathlib import Path
import numpy as np
import pandas as pd
from PIL import Image
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, r2_score

# Ensure root is in path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.services.vision import (
    _extract_feature_vector,
    analyze_urea_strip,
)

FEATURE_NAMES = [
    "mean_r", "std_r", "mean_g", "std_g", "mean_b", "std_b",
    "mean_h", "std_h", "mean_s", "std_s", "mean_v", "std_v",
    "mean_gray", "std_gray",
    "pct_green", "pct_golden", "pct_dark", "pct_pale",
    "grad_mean", "grad_std", "grad_max", "local_var"
]

MODELS_DIR = ROOT_DIR / "backend" / "models" / "vision"
REAL_DATA_DIR = ROOT_DIR / "backend" / "datasets" / "real_images"


def extract_from_pil(img: Image.Image) -> np.ndarray:
    resized = img.resize((400, 400), Image.Resampling.BILINEAR)
    arr = np.asarray(resized, dtype=np.float32)
    return _extract_feature_vector(arr)


def augment_and_extract(img_path: Path) -> list[np.ndarray]:
    """Extracts features from the original image and augmented variations (flips/crops/rotations)."""
    features_list = []
    try:
        base_img = Image.open(img_path).convert("RGB")
        features_list.append(extract_from_pil(base_img))

        # Aug 1: Horizontal Flip
        h_flip = base_img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        features_list.append(extract_from_pil(h_flip))

        # Aug 2: Vertical Flip
        v_flip = base_img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        features_list.append(extract_from_pil(v_flip))

        # Aug 3 & 4: Rotations (90, 270 deg)
        rot90 = base_img.transpose(Image.Transpose.ROTATE_90)
        features_list.append(extract_from_pil(rot90))
        rot270 = base_img.transpose(Image.Transpose.ROTATE_270)
        features_list.append(extract_from_pil(rot270))

        # Aug 5: Center 80% Crop
        w, h = base_img.size
        crop_center = (int(w * 0.10), int(h * 0.10), int(w * 0.90), int(h * 0.90))
        features_list.append(extract_from_pil(base_img.crop(crop_center)))

        # Aug 6: Top-Left Crop
        crop_tl = (0, 0, int(w * 0.85), int(h * 0.85))
        features_list.append(extract_from_pil(base_img.crop(crop_tl)))

        # Aug 7: Bottom-Right Crop
        crop_br = (int(w * 0.15), int(h * 0.15), w, h)
        features_list.append(extract_from_pil(base_img.crop(crop_br)))

    except Exception as e:
        print(f"  [Warning] Error processing {img_path.name}: {e}")

    return features_list


def train_feed_models_from_real_images():
    """Trains feed classifier and anomaly detector from real images."""
    feed_dir = REAL_DATA_DIR / "feed_surface"
    classes = ["maize_silage", "green_fodder", "dry_fodder", "concentrate"]
    class_labels = {
        "maize_silage": 0,
        "green_fodder": 1,
        "dry_fodder": 2,
        "concentrate": 3,
    }
    feed_display_names = ["Maize Silage", "Green Fodder", "Dry Fodder", "Concentrate"]

    X_clean = []
    y_clean = []
    X_anomaly = []
    y_anomaly = []

    print("\n--- Scanning Real Feed Surface Images ---")
    valid_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

    # 1. Clean feed classes
    for c_name in classes:
        c_folder = feed_dir / c_name
        if not c_folder.exists():
            continue
        img_files = [f for f in c_folder.iterdir() if f.suffix.lower() in valid_exts]
        print(f"  Found {len(img_files)} images in '{c_name}'")
        for img_f in img_files:
            feats_aug = augment_and_extract(img_f)
            for f_vec in feats_aug:
                X_clean.append(f_vec)
                y_clean.append(class_labels[c_name])
                X_anomaly.append(f_vec)
                y_anomaly.append(0)  # Not anomaly

    # 2. Mouldy feed class
    mould_folder = feed_dir / "mouldy_feed"
    if mould_folder.exists():
        mould_files = [f for f in mould_folder.iterdir() if f.suffix.lower() in valid_exts]
        print(f"  Found {len(mould_files)} images in 'mouldy_feed'")
        for img_f in mould_files:
            feats_aug = augment_and_extract(img_f)
            for f_vec in feats_aug:
                X_anomaly.append(f_vec)
                y_anomaly.append(1)  # Anomaly!

    if len(X_clean) < 10:
        print("[!] Not enough real images found to train feed classifier (need at least 3-5 images per folder).")
        return False

    # Train Feed Classifier
    X_clean = np.array(X_clean)
    y_clean = np.array(y_clean)
    scaler_feed = StandardScaler()
    X_clean_scaled = scaler_feed.fit_transform(X_clean)

    clf_feed = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf_feed.fit(X_clean_scaled, y_clean)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump({
        "model": clf_feed,
        "scaler": scaler_feed,
        "classes": feed_display_names,
        "feature_names": FEATURE_NAMES,
    }, MODELS_DIR / "feed_classifier.joblib")
    print(f"  [+] Saved feed_classifier.joblib (trained on {len(X_clean)} samples with augmentation)")

    # Train Anomaly Detector
    if len(X_anomaly) >= 15:
        X_anomaly = np.array(X_anomaly)
        y_anomaly = np.array(y_anomaly)
        scaler_anom = StandardScaler()
        X_anom_scaled = scaler_anom.fit_transform(X_anomaly)

        clf_anom = RandomForestClassifier(
            n_estimators=100, max_depth=8, random_state=42, class_weight="balanced"
        )
        clf_anom.fit(X_anom_scaled, y_anomaly)

        joblib.dump({
            "model": clf_anom,
            "scaler": scaler_anom,
            "feature_names": FEATURE_NAMES,
        }, MODELS_DIR / "anomaly_detector.joblib")
        print(f"  [+] Saved anomaly_detector.joblib (trained on {len(X_anomaly)} samples with augmentation)")

    return True


def train_urea_models_from_real_images():
    """Extracts pad color from real test strip images and fits colorimeter model."""
    urea_dir = REAL_DATA_DIR / "urea_strips"
    valid_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

    categories = [
        ("negative_yellow", 0.15, 0),
        ("suspected_green", 0.85, 1),
        ("high_risk_blue", 2.20, 2),
    ]

    X_color = []
    y_reg = []
    y_clf = []

    print("\n--- Scanning Real Urea Strip Images ---")
    total_strips = 0

    for folder_name, target_urea_pct, risk_idx in categories:
        folder = urea_dir / folder_name
        if not folder.exists():
            continue
        strip_files = [f for f in folder.iterdir() if f.suffix.lower() in valid_exts]
        print(f"  Found {len(strip_files)} strip images in '{folder_name}'")
        total_strips += len(strip_files)

        for s_file in strip_files:
            try:
                # Use our vision service's auto ROI locator
                res = analyze_urea_strip(s_file)
                c_data = res["colorimetric_data"]
                r, g, b = c_data["rgb"]
                hsv = c_data["hsv"]
                cielab = c_data["cielab"]

                # Extract features: [hue, sat, val, r, g, b, L, a, b]
                vec = [
                    hsv["hue_deg"],
                    hsv["saturation"],
                    hsv["value"],
                    r, g, b,
                    cielab["L"],
                    cielab["a"],
                    cielab["b"],
                ]
                # Small data jitter (+- 5%) to simulate lighting variation
                for jitter in [-0.03, 0.0, 0.03]:
                    j_vec = [v * (1.0 + jitter) if i >= 3 else v for i, v in enumerate(vec)]
                    X_color.append(j_vec)
                    y_reg.append(target_urea_pct * (1.0 + jitter * 0.5))
                    y_clf.append(risk_idx)
            except Exception as e:
                print(f"  [Warning] Error on {s_file.name}: {e}")

    if len(X_color) < 6:
        print("[!] Not enough real urea strip images found (need at least 2-3 images per category).")
        return False

    X_color = np.array(X_color)
    y_reg = np.array(y_reg)
    y_clf = np.array(y_clf)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_color)

    reg = RandomForestRegressor(n_estimators=80, max_depth=6, random_state=42)
    reg.fit(X_scaled, y_reg)

    clf = RandomForestClassifier(n_estimators=80, max_depth=6, random_state=42)
    clf.fit(X_scaled, y_clf)

    joblib.dump({
        "regressor": reg,
        "classifier": clf,
        "scaler": scaler,
        "feature_names": ["hue_deg", "saturation", "value", "r", "g", "b", "L", "a", "b_cielab"],
    }, MODELS_DIR / "urea_colorimeter.joblib")
    print(f"  [+] Saved urea_colorimeter.joblib (trained on {total_strips} real photos)")
    return True


if __name__ == "__main__":
    print("==================================================")
    print("FeedSure 360 Real-Image Model Retraining Pipeline")
    print("==================================================")
    feed_success = train_feed_models_from_real_images()
    urea_success = train_urea_models_from_real_images()

    print("\n--------------------------------------------------")
    if feed_success or urea_success:
        print("Training complete! The models in backend/models/vision/ have been updated with your real images.")
    else:
        print("Waiting for real images. Add them to backend/datasets/real_images/ and run this script again.")
    print("==================================================")
