from models.request_models import AutoEditRequest
from models.response_models import AutoEditResponse
from utils.audio import detect_silence_segments

class AutoEditService:
    async def analyze_and_suggest(self, request: AutoEditRequest) -> AutoEditResponse:
        silence_intervals = detect_silence_segments(30.0)
        operations = []
        duration_saved = 0.0

        for idx, (start, end) in enumerate(silence_intervals):
            operations.append({
                "type": "CUT",
                "clipId": f"clip-{idx + 1}",
                "start": round(start, 2),
                "end": round(end, 2),
                "reason": "SILENCE_REMOVAL"
            })
            duration_saved += (end - start)

        return AutoEditResponse(
            operations=operations,
            silence_segments_found=len(silence_intervals),
            duration_saved=round(duration_saved, 2)
        )
