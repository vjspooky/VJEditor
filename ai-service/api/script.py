from fastapi import APIRouter
from models.request_models import ScriptRequest
from models.response_models import ScriptResponse
from services.script_service import ScriptService

router = APIRouter(prefix="/script", tags=["Script"])
service = ScriptService()

@router.post("/generate", response_model=ScriptResponse)
async def generate_script(request: ScriptRequest):
    return await service.generate_script(request)
