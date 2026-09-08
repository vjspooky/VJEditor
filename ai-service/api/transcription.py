from fastapi import APIRouter
from models.request_models import TranscriptionRequest
from models.response_models import TranscriptionResponse
from services.speech_service import SpeechService

router = APIRouter(prefix="/transcription", tags=["Transcription"])
service = SpeechService()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(request: TranscriptionRequest):
    return await service.transcribe(request)
