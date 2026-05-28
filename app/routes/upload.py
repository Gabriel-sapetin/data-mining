from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services import data_service

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload")
async def upload_csv(csv_file: UploadFile = File(...)) -> dict:
    try:
        contents = await csv_file.read()
        df = data_service.clean_data(data_service.load_from_upload(contents))
        data_service.set_dataframe(df)
        return {
            "message": "Upload successful",
            "rows": int(len(df)),
            "columns": list(df.columns),
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
