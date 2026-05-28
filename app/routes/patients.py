from fastapi import APIRouter, HTTPException, Query

from app.services import data_service

router = APIRouter(prefix="/api", tags=["patients"])


@router.get("/patients")
def get_patients(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    cluster_filter: str | None = None,
) -> dict:
    try:
        df = data_service.get_dataframe().copy()
        if search:
            df = df[df["patient_id"].astype(str).str.contains(search, case=False, na=False)]
        if cluster_filter and "risk_label" in df.columns:
            df = df[df["risk_label"].astype(str) == cluster_filter]
        total = int(len(df))
        start = (page - 1) * page_size
        records = [_record(row) for row in df.iloc[start : start + page_size].to_dict("records")]
        return {"total": total, "page": page, "page_size": page_size, "data": records}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _record(row: dict) -> dict:
    return {
        "patient_id": str(row["patient_id"]),
        "age": int(row["age"]),
        "weight_kg": round(float(row["weight_kg"]), 1),
        "height_cm": round(float(row["height_cm"]), 1),
        "bp_systolic": int(row["bp_systolic"]),
        "bp_diastolic": int(row["bp_diastolic"]),
        "blood_sugar": round(float(row["blood_sugar"]), 1),
        "cholesterol": round(float(row["cholesterol"]), 1),
        "visits_per_year": int(row["visits_per_year"]),
        "medication_count": int(row["medication_count"]),
        "bmi": round(float(row["bmi"]), 1),
        "cluster": None if "cluster" not in row else int(row["cluster"]),
        "risk_label": None if "risk_label" not in row else str(row["risk_label"]),
    }
