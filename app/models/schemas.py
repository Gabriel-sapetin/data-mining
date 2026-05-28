from pydantic import BaseModel


class PatientRecord(BaseModel):
    patient_id: str
    age: int
    weight_kg: float
    height_cm: float
    bp_systolic: int
    bp_diastolic: int
    blood_sugar: float
    cholesterol: float
    visits_per_year: int
    medication_count: int
    bmi: float
    cluster: int | None = None
    risk_label: str | None = None


class StatsResponse(BaseModel):
    total_patients: int
    num_clusters: int
    avg_bmi: float
    avg_visits: float
    avg_age: float
    avg_blood_sugar: float
    avg_cholesterol: float


class ElbowPoint(BaseModel):
    k: int
    inertia: float
    silhouette: float


class ClusterSummary(BaseModel):
    cluster_id: int
    risk_label: str
    patient_count: int
    avg_age: float
    avg_bmi: float
    avg_blood_sugar: float
    avg_cholesterol: float
    avg_bp_systolic: float
    avg_visits: float
    avg_medications: float


class ClusterResult(BaseModel):
    best_k: int
    elbow_data: list[ElbowPoint]
    pca_points: list[dict]
    cluster_summaries: list[ClusterSummary]
    cluster_bar_data: dict
    pie_data: dict
    scatter_data: dict = {}
    feature_arrays: dict = {}
    correlation_matrix: dict = {}
