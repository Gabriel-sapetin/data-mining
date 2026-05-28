import numpy as np
import pandas as pd

from app.services import data_service, kmeans_service, stats_service
from app.services.data_service import FEATURE_COLS


def run_cluster_pipeline(df: pd.DataFrame) -> dict:
    x = data_service.get_features(df)
    x_scaled = data_service.normalize_features(x)
    best = kmeans_service.find_best_k(x_scaled)
    model = kmeans_service.run_kmeans(x_scaled, best["best_k"])
    labels = model["labels"]
    risk_labels = kmeans_service.assign_risk_labels(df, labels)
    df["cluster"] = labels
    df["risk_label"] = risk_labels
    data_service.set_dataframe(df)
    summaries = stats_service.get_cluster_summaries(df, labels, risk_labels)
    pie_labels = [item["risk_label"] for item in summaries]
    pie_counts = [item["patient_count"] for item in summaries]

    # Build scatter data for Age vs BMI and Blood Sugar vs Cholesterol
    scatter_data = {
        "age_vs_bmi": [
            {"x": round(float(row["age"]), 1), "y": round(float(row["bmi"]), 1), "cluster": int(row["cluster"])}
            for _, row in df.iterrows()
        ],
        "sugar_vs_cholesterol": [
            {"x": round(float(row["blood_sugar"]), 1), "y": round(float(row["cholesterol"]), 1), "cluster": int(row["cluster"])}
            for _, row in df.iterrows()
        ],
    }

    # Build raw feature arrays for histograms
    display_names = {
        "age": "Age", "bmi": "BMI", "blood_sugar": "BloodSugar_mg_dL",
        "cholesterol": "CholesterolLevel", "bp_systolic": "BloodPressure_Systolic",
        "visits_per_year": "VisitsPerYear", "medication_count": "MedicationCount",
    }
    feature_arrays = {}
    for col in FEATURE_COLS:
        feature_arrays[display_names.get(col, col)] = [round(float(v), 2) for v in df[col].tolist()]

    # Compute correlation matrix
    corr = df[FEATURE_COLS].corr().round(3)
    correlation_matrix = {
        "labels": [display_names.get(c, c) for c in FEATURE_COLS],
        "values": corr.values.tolist(),
    }

    return {
        "best_k": best["best_k"],
        "elbow_data": best["elbow_data"],
        "pca_points": kmeans_service.run_pca(x_scaled, labels, df["patient_id"].tolist()),
        "cluster_summaries": summaries,
        "cluster_bar_data": kmeans_service.get_cluster_bar_data(df, labels),
        "pie_data": {"labels": pie_labels, "counts": pie_counts},
        "scatter_data": scatter_data,
        "feature_arrays": feature_arrays,
        "correlation_matrix": correlation_matrix,
    }
