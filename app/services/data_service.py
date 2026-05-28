from io import BytesIO

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


FEATURE_COLS = [
    "age",
    "bmi",
    "blood_sugar",
    "cholesterol",
    "bp_systolic",
    "visits_per_year",
    "medication_count",
]

REQUIRED_COLS = [
    "patient_id",
    "age",
    "weight_kg",
    "height_cm",
    "bp_systolic",
    "bp_diastolic",
    "blood_sugar",
    "cholesterol",
    "visits_per_year",
    "medication_count",
]

COLUMN_ALIASES = {
    "PatientID": "patient_id",
    "Age": "age",
    "Weight_kg": "weight_kg",
    "WeightKg": "weight_kg",
    "Height_cm": "height_cm",
    "HeightCm": "height_cm",
    "BloodPressure_Systolic": "bp_systolic",
    "BloodPressure_Diastolic": "bp_diastolic",
    "BloodSugar_mg_dL": "blood_sugar",
    "CholesterolLevel": "cholesterol",
    "VisitsPerYear": "visits_per_year",
    "MedicationCount": "medication_count",
    "BMI": "bmi",
    "Cluster": "cluster",
    "ClusterLabel": "risk_label",
}

_df: pd.DataFrame | None = None
_cluster_result: dict | None = None


def load_csv(file_path: str) -> pd.DataFrame:
    return pd.read_csv(file_path)


def load_from_upload(file_bytes: bytes) -> pd.DataFrame:
    return pd.read_csv(BytesIO(file_bytes))


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.rename(columns=COLUMN_ALIASES).copy()
    cleaned.columns = [_to_snake_case(col) for col in cleaned.columns]
    cleaned = cleaned.drop_duplicates().dropna()
    if "bmi" not in cleaned.columns:
        cleaned["bmi"] = cleaned["weight_kg"] / ((cleaned["height_cm"] / 100) ** 2)
    if "cluster_label" in cleaned.columns and "risk_label" not in cleaned.columns:
        cleaned = cleaned.rename(columns={"cluster_label": "risk_label"})
    missing = [col for col in REQUIRED_COLS if col not in cleaned.columns]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")
    return cleaned.reset_index(drop=True)


def get_features(df: pd.DataFrame) -> np.ndarray:
    return df[FEATURE_COLS].to_numpy(dtype=float)


def normalize_features(x: np.ndarray) -> np.ndarray:
    return StandardScaler().fit_transform(x)


def get_dataframe() -> pd.DataFrame:
    if _df is None:
        raise ValueError("No patient data loaded. Upload a CSV first.")
    return _df


def set_dataframe(df: pd.DataFrame) -> None:
    global _df, _cluster_result
    _df = df.copy()
    _cluster_result = None


def get_cluster_result() -> dict | None:
    return _cluster_result


def set_cluster_result(result: dict) -> None:
    global _cluster_result
    _cluster_result = result


def _to_snake_case(value: str) -> str:
    if value in COLUMN_ALIASES.values():
        return value
    replacements = {
        "PatientID": "patient_id",
        "BloodPressure_Systolic": "bp_systolic",
        "BloodPressure_Diastolic": "bp_diastolic",
        "BloodSugar_mg_dL": "blood_sugar",
        "CholesterolLevel": "cholesterol",
        "VisitsPerYear": "visits_per_year",
        "MedicationCount": "medication_count",
        "ClusterLabel": "risk_label",
    }
    if value in replacements:
        return replacements[value]
    chars = []
    for char in value.strip():
        chars.append(f"_{char.lower()}" if char.isupper() and chars else char.lower())
    return "".join(chars).replace(" ", "_").replace("__", "_")
