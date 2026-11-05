from fastapi import APIRouter
from models.request_models import AutoEditRequest
from models.response_models import AutoEditResponse
from services.auto_edit_service import AutoEditService

router = APIRouter(prefix="/auto-edit", tags=["AutoEdit"])
service = AutoEditService()

@router.post("/suggest", response_model=AutoEditResponse)
async def suggest_edits(request: AutoEditRequest):
    return await service.analyze_and_suggest(request)
