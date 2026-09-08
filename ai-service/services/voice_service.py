from models.request_models import VoiceRequest
from models.response_models import VoiceResponse

class VoiceService:
    async def synthesize(self, request: VoiceRequest) -> VoiceResponse:
        word_count = len(request.text.split())
        estimated_duration = max(1.0, (word_count / 2.5) / request.speed)
        return VoiceResponse(
            audio_url="/storage/audio/generated_voice.mp3",
            duration=round(estimated_duration, 2),
            voice_id=request.voice_id
        )
