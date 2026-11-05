from fastapi import APIRouter
from models.request_models import VideoGenerationRequest
from models.response_models import VideoGenerationResponse
from services.video_service import VideoService

router = APIRouter(prefix="/video", tags=["Video"])
service = VideoService()

@router.post("/generate", response_model=VideoGenerationResponse)
async def generate_video(request: VideoGenerationRequest):
    return await service.generate_video_project(request)
