from fastapi import APIRouter, HTTPException

from app.models.schemas import ClusterResult
from app.services import data_service
from app.services.cluster_pipeline import run_cluster_pipeline

router = APIRouter(prefix="/api", tags=["cluster"])


@router.post("/cluster", response_model=ClusterResult)
def cluster_patients() -> dict:
    try:
        cached = data_service.get_cluster_result()
        if cached is not None:
            return cached
        df = data_service.get_dataframe().copy()
        result = run_cluster_pipeline(df)
        data_service.set_cluster_result(result)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/cluster/cached", response_model=ClusterResult)
def get_cached_cluster() -> dict:
    cached = data_service.get_cluster_result()
    if cached is None:
        raise HTTPException(status_code=404, detail="No cached cluster results. Run analysis first.")
    return cached
