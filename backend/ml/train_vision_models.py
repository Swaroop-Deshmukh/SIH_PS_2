"""FeedSure 360 - Model Training Pipeline for Computer Vision & Strip Colorimetry.

Trains:
1. feed_classifier.joblib: Random Forest classifying feed types from visual features.
2. anomaly_detector.joblib: Surface mould/spoilage anomaly detection model.
3. urea_colorimeter.joblib: Colorimetric regression & risk classifier for urea strips.
Saves models and metrics to backend/models/vision/.
"""
from __future__ import annotations

import json
from pathlib import Path
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, IsolationForest
from sklearn.metrics import accuracy_score, f1_score, classification_report, r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler

import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ml.dataset_generator import (
    generate_feed_surface_dataset,
    generate_urea_strip_dataset,
    FEATURE_NAMES,
)

MODELS_DIR = Path(__file__).resolve().parent.parent / "models" / "vision"


def train_feed_classifier(df: pd.DataFrame) -> dict:
    """Trains a Random Forest classifier to identify feed types from visual features."""
    X = df[FEATURE_NAMES].values
    y = df["feed_class_idx"].values
    feed_names = ["Maize Silage", "Green Fodder", "Dry Fodder", "Concentrate"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=10,
        min_samples_split=4,
        random_state=42,
    )
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    acc = float(accuracy_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred, average="weighted"))

    # Feature importances
    importances = dict(zip(FEATURE_NAMES, [round(float(v), 4) for v in clf.feature_importances_]))
    top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:6]

    print(f"Feed Classifier Test Accuracy: {acc * 100:.2f}% | F1-Score: {f1 * 100:.2f}%")
    print(f"Top Discriminative Features: {top_features}")

    return {
        "model": clf,
        "scaler": scaler,
        "classes": feed_names,
        "accuracy": round(acc, 4),
        "f1_score": round(f1, 4),
        "top_features": top_features,
    }


def train_anomaly_detector(df_anomaly: pd.DataFrame) -> dict:
    """Trains an anomaly detection model for surface mould and discoloration."""
    X = df_anomaly[FEATURE_NAMES].values
    y = df_anomaly["is_anomaly"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Supervised Random Forest for anomaly probability estimation
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        class_weight="balanced",
    )
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    acc = float(accuracy_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred, average="weighted"))

    print(f"Surface Anomaly Detector Accuracy: {acc * 100:.2f}% | F1: {f1 * 100:.2f}%")

    return {
        "model": clf,
        "scaler": scaler,
        "accuracy": round(acc, 4),
        "f1_score": round(f1, 4),
    }


def train_urea_colorimeter(df_urea: pd.DataFrame) -> dict:
    """Trains regression and classification models for urea test strips."""
    color_features = ["hue_deg", "saturation", "value", "r", "g", "b", "L", "a", "b_cielab"]
    X = df_urea[color_features].values
    y_reg = df_urea["urea_concentration_pct"].values
    y_clf = df_urea["risk_index"].values

    X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(
        X, y_reg, y_clf, test_size=0.25, random_state=42, stratify=y_clf
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Regressor for urea concentration
    reg = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    reg.fit(X_train_scaled, y_reg_train)
    y_reg_pred = reg.predict(X_test_scaled)
    r2 = float(r2_score(y_reg_test, y_reg_pred))
    rmse = float(np.sqrt(mean_squared_error(y_reg_test, y_reg_pred)))

    # 2. Classifier for risk status
    clf = RandomForestClassifier(n_estimators=80, max_depth=6, random_state=42)
    clf.fit(X_train_scaled, y_clf_train)
    y_clf_pred = clf.predict(X_test_scaled)
    acc = float(accuracy_score(y_clf_test, y_clf_pred))

    print(f"Urea Colorimeter Regression R²: {r2:.4f} | RMSE: {rmse:.3f}%")
    print(f"Urea Risk Classification Accuracy: {acc * 100:.2f}%")

    return {
        "regressor": reg,
        "classifier": clf,
        "scaler": scaler,
        "feature_names": color_features,
        "r2_score": round(r2, 4),
        "rmse": round(rmse, 4),
        "classification_accuracy": round(acc, 4),
    }


def run_full_training():
    """Executes full dataset generation, model training, and artifact persistence."""
    print("==================================================")
    print("FeedSure 360 Computer Vision Training Pipeline")
    print("==================================================")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Generate Datasets
    print("\n[Step 1/3] Generating Reference Datasets (Datasets D & E)...")
    df_feed, df_anomaly = generate_feed_surface_dataset(samples_per_class=200, seed=42)
    df_urea = generate_urea_strip_dataset(num_samples=600, seed=42)
    print(f"  - Feed surface dataset: {len(df_feed)} clean samples, {len(df_anomaly)} total samples.")
    print(f"  - Urea test strip dataset: {len(df_urea)} calibrated colorimetry samples.")

    # 2. Train Models
    print("\n[Step 2/3] Training Machine Learning Models...")
    res_feed = train_feed_classifier(df_feed)
    res_anomaly = train_anomaly_detector(df_anomaly)
    res_urea = train_urea_colorimeter(df_urea)

    # 3. Save Model Artifacts
    print("\n[Step 3/3] Saving Trained Model Artifacts to disk...")
    joblib.dump(
        {"model": res_feed["model"], "scaler": res_feed["scaler"], "classes": res_feed["classes"]},
        MODELS_DIR / "feed_classifier.joblib"
    )
    joblib.dump(
        {"model": res_anomaly["model"], "scaler": res_anomaly["scaler"]},
        MODELS_DIR / "anomaly_detector.joblib"
    )
    joblib.dump(
        {
            "regressor": res_urea["regressor"],
            "classifier": res_urea["classifier"],
            "scaler": res_urea["scaler"],
            "features": res_urea["feature_names"],
        },
        MODELS_DIR / "urea_colorimeter.joblib"
    )

    # Save metrics JSON
    metrics = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "framework": "scikit-learn 1.9.1",
        "models": {
            "feed_classifier": {
                "algorithm": "RandomForestClassifier",
                "n_estimators": 120,
                "classes": res_feed["classes"],
                "accuracy": res_feed["accuracy"],
                "f1_score": res_feed["f1_score"],
                "top_discriminative_features": res_feed["top_features"],
            },
            "anomaly_detector": {
                "algorithm": "RandomForestClassifier (Balanced)",
                "target": "Surface Mould & Spoilage Anomaly",
                "accuracy": res_anomaly["accuracy"],
                "f1_score": res_anomaly["f1_score"],
            },
            "urea_colorimeter": {
                "algorithm": "RandomForestRegressor + Classifier",
                "chemical_assay": "Urease + Bromothymol Blue Paper Strip",
                "r2_score": res_urea["r2_score"],
                "rmse_pct": res_urea["rmse"],
                "classification_accuracy": res_urea["classification_accuracy"],
            },
        },
        "scientific_boundary": (
            "Models provide rapid screening and triage. They do not substitute for "
            "standard wet-chemistry Kjeldahl or HPLC/ELISA aflatoxin assays."
        ),
    }

    metrics_path = MODELS_DIR / "model_metrics.json"
    metrics_path.write_text(json.dumps(metrics, indent=2))
    print(f"Model artifacts saved successfully in: {MODELS_DIR}")
    print(f"Metrics written to: {metrics_path}")
    print("Training Pipeline Complete!")


if __name__ == "__main__":
    run_full_training()
