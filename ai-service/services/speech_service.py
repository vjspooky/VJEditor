import uuid
from models.request_models import TranscriptionRequest
from models.response_models import TranscriptionResponse, CaptionSegment, WordTimestamp

class SpeechService:
    async def transcribe(self, request: TranscriptionRequest) -> TranscriptionResponse:
        captions = [
            CaptionSegment(
                id=str(uuid.uuid4()),
                text="Welcome back to VJEditor.",
                start_time=0.5,
                end_time=2.8,
                words=[
                    WordTimestamp(word="Welcome", start=0.5, end=1.0),
                    WordTimestamp(word="back", start=1.0, end=1.4),
                    WordTimestamp(word="to", start=1.4, end=1.7),
                    WordTimestamp(word="VJEditor.", start=1.7, end=2.8)
                ]
            ),
            CaptionSegment(
                id=str(uuid.uuid4()),
                text="Transform your ideas into cinematic video in seconds.",
                start_time=3.1,
                end_time=6.4,
                words=[
                    WordTimestamp(word="Transform", start=3.1, end=3.8),
                    WordTimestamp(word="your", start=3.8, end=4.1),
                    WordTimestamp(word="ideas", start=4.1, end=4.7),
                    WordTimestamp(word="into", start=4.7, end=5.0),
                    WordTimestamp(word="cinematic", start=5.0, end=5.8),
                    WordTimestamp(word="video", start=5.8, end=6.4)
                ]
            )
        ]
        return TranscriptionResponse(
            language="en",
            duration=6.5,
            captions=captions
        )
