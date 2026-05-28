from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes import cluster, patients, stats, upload
from app.services import data_service


BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"
DATASET_PATH = BASE_DIR / "clinic_patients.csv"

app = FastAPI(title="ClinicCluster API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")

app.include_router(upload.router)
app.include_router(cluster.router)
app.include_router(patients.router)
app.include_router(stats.router)


@app.on_event("startup")
def load_seed_data() -> None:
    if DATASET_PATH.exists():
        df = data_service.clean_data(data_service.load_csv(str(DATASET_PATH)))
        data_service.set_dataframe(df)
        # Pre-run clustering so dashboard loads instantly
        try:
            from app.services.cluster_pipeline import run_cluster_pipeline
            result = run_cluster_pipeline(df.copy())
            data_service.set_cluster_result(result)
        except Exception:
            pass


@app.get("/")
def root() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "html" / "index.html")


@app.get("/{page_name}.html")
def html_page(page_name: str) -> FileResponse:
    page = FRONTEND_DIR / "html" / f"{page_name}.html"
    if page.exists():
        return FileResponse(page)
    return FileResponse(FRONTEND_DIR / "html" / "index.html")
