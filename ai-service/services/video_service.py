import uuid
from models.request_models import VideoGenerationRequest
from models.response_models import VideoGenerationResponse, VideoSceneResult

class VideoService:
    async def generate_video_project(self, request: VideoGenerationRequest) -> VideoGenerationResponse:
        scenes = [
            VideoSceneResult(
                scene_id=str(uuid.uuid4()),
                video_url="/storage/video/scene1.mp4",
                duration=5.0,
                prompt=f"Cinematic opening: {request.prompt}"
            ),
            VideoSceneResult(
                scene_id=str(uuid.uuid4()),
                video_url="/storage/video/scene2.mp4",
                duration=5.0,
                prompt=f"Dynamic central action: {request.prompt}"
            )
        ]
        timeline_json = {
            "version": "1.0",
            "aspectRatio": request.aspect_ratio,
            "duration": 10.0,
            "tracks": [
                {
                    "id": "track-v1",
                    "name": "Video Track 1",
                    "type": "video",
                    "clips": [
                        {
                            "id": "clip-v1",
                            "mediaId": scenes[0].scene_id,
                            "startTime": 0.0,
                            "duration": 5.0,
                            "name": "Scene 1"
                        },
                        {
                            "id": "clip-v2",
                            "mediaId": scenes[1].scene_id,
                            "startTime": 5.0,
                            "duration": 5.0,
                            "name": "Scene 2"
                        }
                    ]
                }
            ]
        }
        return VideoGenerationResponse(
            project_title=f"AI Generated: {request.prompt[:30]}",
            scenes=scenes,
            timeline_json=timeline_json
        )
