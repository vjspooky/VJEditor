from typing import Optional, List
from pydantic import BaseModel, Field

class ScriptRequest(BaseModel):
    topic: str = Field(..., description="Topic or prompt for video script")
    target_duration: int = Field(30, description="Target duration in seconds")
    tone: Optional[str] = Field("engaging", description="Tone of voice")
    target_platform: Optional[str] = Field("youtube", description="Target platform")

class TranscriptionRequest(BaseModel):
    media_url: str = Field(..., description="URL of the video or audio file")
    language: Optional[str] = Field("auto", description="Spoken language")

class VoiceRequest(BaseModel):
    text: str = Field(..., description="Script text to synthesize")
    voice_id: Optional[str] = Field("aura-asteria-en", description="Target voice persona")
    speed: Optional[float] = Field(1.0, description="Speech rate multiplier")

class VideoGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Video concept prompt")
    aspect_ratio: Optional[str] = Field("16:9", description="Aspect ratio")
    style: Optional[str] = Field("cinematic", description="Visual style preset")
    target_duration: Optional[int] = Field(15, description="Target duration")

class AutoEditOperation(BaseModel):
    type: str = Field(..., description="CUT | REMOVE_SILENCE | SPEED_UP | CROP")
    clip_id: str = Field(..., description="Target clip ID")
    start: Optional[float] = None
    end: Optional[float] = None

class AutoEditRequest(BaseModel):
    project_id: str
    media_url: str
    remove_silence: bool = True
    remove_filler_words: bool = True
