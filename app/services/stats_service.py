import numpy as np
import pandas as pd


def get_summary_stats(df: pd.DataFrame) -> dict:
    cluster_count = int(df["cluster"].nunique()) if "cluster" in df.columns else 0
    return {
        "total_patients": int(len(df)),
        "num_clusters": cluster_count,
        "avg_bmi": round(float(df["bmi"].mean()), 1),
        "avg_visits": round(float(df["visits_per_year"].mean()), 1),
        "avg_age": round(float(df["age"].mean()), 1),
        "avg_blood_sugar": round(float(df["blood_sugar"].mean()), 1),
        "avg_cholesterol": round(float(df["cholesterol"].mean()), 1),
    }


def get_cluster_summaries(df: pd.DataFrame, labels: np.ndarray, risk_labels: list[str]) -> list[dict]:
    working = df.copy()
    working["cluster"] = labels
    working["risk_label"] = risk_labels
    summaries = []
    for cluster, group in working.groupby("cluster"):
        summaries.append(
            {
                "cluster_id": int(cluster),
                "risk_label": str(group["risk_label"].iloc[0]),
                "patient_count": int(len(group)),
                "avg_age": round(float(group["age"].mean()), 1),
                "avg_bmi": round(float(group["bmi"].mean()), 1),
                "avg_blood_sugar": round(float(group["blood_sugar"].mean()), 1),
                "avg_cholesterol": round(float(group["cholesterol"].mean()), 1),
                "avg_bp_systolic": round(float(group["bp_systolic"].mean()), 1),
                "avg_visits": round(float(group["visits_per_year"].mean()), 1),
                "avg_medications": round(float(group["medication_count"].mean()), 1),
            }
        )
    return sorted(summaries, key=lambda item: item["avg_visits"])


def get_recommendations() -> dict:
    return {
        "Low Risk": "Implement annual wellness checkups and preventive education programs. Encourage healthy lifestyle maintenance.",
        "Moderate Risk": "Schedule quarterly monitoring appointments. Recommend diet and exercise counseling. Track BMI trends.",
        "High Risk": "Assign monthly monitoring schedule. Conduct full medication review. Refer to relevant specialists.",
        "Critical Risk": "Activate intensive care plan. Prioritize appointment slots. Recommend daily home monitoring of BP and blood sugar.",
    }
