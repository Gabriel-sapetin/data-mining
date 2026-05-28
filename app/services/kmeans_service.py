import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

from app.services.data_service import FEATURE_COLS


RISK_ORDER = ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"]


def find_best_k(x_scaled: np.ndarray, k_min: int = 2, k_max: int = 8) -> dict:
    max_k = min(k_max, len(x_scaled) - 1)
    elbow_data = []
    for k in range(k_min, max_k + 1):
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(x_scaled)
        elbow_data.append(
            {
                "k": k,
                "inertia": round(float(model.inertia_), 2),
                "silhouette": round(float(silhouette_score(x_scaled, labels)), 3),
            }
        )
    best = max(elbow_data, key=lambda point: point["silhouette"])
    return {"best_k": best["k"], "elbow_data": elbow_data}


def run_kmeans(x_scaled: np.ndarray, k: int) -> dict:
    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = model.fit_predict(x_scaled)
    return {"labels": labels, "centroids": model.cluster_centers_, "inertia": model.inertia_}


def run_pca(x_scaled: np.ndarray, labels: np.ndarray, patient_ids: list[str]) -> list[dict]:
    pca = PCA(n_components=2, random_state=42)
    points = pca.fit_transform(x_scaled)
    rows = [
        {
            "x": round(float(point[0]), 3),
            "y": round(float(point[1]), 3),
            "cluster": int(labels[index]),
            "patient_id": patient_ids[index],
            "is_centroid": False,
        }
        for index, point in enumerate(points)
    ]
    for cluster in sorted(set(labels)):
        centroid = points[labels == cluster].mean(axis=0)
        rows.append(
            {
                "x": round(float(centroid[0]), 3),
                "y": round(float(centroid[1]), 3),
                "cluster": int(cluster),
                "patient_id": f"Cluster {cluster} centroid",
                "is_centroid": True,
            }
        )
    return rows


def assign_risk_labels(df: pd.DataFrame, labels: np.ndarray) -> list[str]:
    grouped = (
        pd.DataFrame({"cluster": labels, "visits": df["visits_per_year"]})
        .groupby("cluster")["visits"]
        .mean()
        .sort_values()
    )
    risk_map = {
        int(cluster): RISK_ORDER[min(index, len(RISK_ORDER) - 1)]
        for index, cluster in enumerate(grouped.index)
    }
    return [risk_map[int(label)] for label in labels]


def get_cluster_bar_data(df: pd.DataFrame, labels: np.ndarray) -> dict:
    working = df.copy()
    working["cluster"] = labels
    data = {}
    for feature in FEATURE_COLS:
        data[_feature_label(feature)] = [
            round(float(value), 2)
            for value in working.groupby("cluster")[feature].mean().sort_index().tolist()
        ]
    return data


def _feature_label(feature: str) -> str:
    labels = {
        "age": "Age",
        "bmi": "BMI",
        "blood_sugar": "Blood Sugar",
        "cholesterol": "Cholesterol",
        "bp_systolic": "Systolic BP",
        "visits_per_year": "Visits/Year",
        "medication_count": "Medications",
    }
    return labels[feature]
