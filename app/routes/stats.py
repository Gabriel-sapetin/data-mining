from fastapi import APIRouter, HTTPException

from app.models.schemas import StatsResponse
from app.services import data_service, stats_service

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", response_model=StatsResponse)
def get_stats() -> dict:
    try:
        return stats_service.get_summary_stats(data_service.get_dataframe())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/recommendations")
def get_recommendations() -> dict:
    return stats_service.get_recommendations()
