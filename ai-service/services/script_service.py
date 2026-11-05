import uuid
from models.request_models import ScriptRequest
from models.response_models import ScriptResponse, ScriptScene

class ScriptService:
    async def generate_script(self, request: ScriptRequest) -> ScriptResponse:
        scenes = [
            ScriptScene(
                scene_number=1,
                narration=f"Welcome to this dynamic breakdown on {request.topic}!",
                visual_description=f"High energy intro showing cinematic graphics related to {request.topic}",
                duration=5.0
            ),
            ScriptScene(
                scene_number=2,
                narration="Here are the top 3 principles you need to know today.",
                visual_description="Split screen animations displaying highlighted bullet points",
                duration=12.0
            ),
            ScriptScene(
                scene_number=3,
                narration="Subscribe and follow for more cutting-edge insights.",
                visual_description="Outro motion graphic with call to action badges",
                duration=4.0
            )
        ]
        return ScriptResponse(
            title=f"The Ultimate Guide to {request.topic}",
            estimated_duration=21.0,
            scenes=scenes
        )
