from fastapi import APIRouter
from models.request_models import VoiceRequest
from models.response_models import VoiceResponse
from services.voice_service import VoiceService

router = APIRouter(prefix="/voice", tags=["Voice"])
service = VoiceService()

@router.post("/synthesize", response_model=VoiceResponse)
async def synthesize_voice(request: VoiceRequest):
    return await service.synthesize(request)
