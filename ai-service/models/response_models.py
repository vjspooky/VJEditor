from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class ScriptScene(BaseModel):
    scene_number: int
    narration: str
    visual_description: str
    duration: float

class ScriptResponse(BaseModel):
    title: str
    estimated_duration: float
    scenes: List[ScriptScene]

class WordTimestamp(BaseModel):
    word: str
    start: float
    end: float

class CaptionSegment(BaseModel):
    id: str
    text: str
    start_time: float
    end_time: float
    words: Optional[List[WordTimestamp]] = None

class TranscriptionResponse(BaseModel):
    language: str
    duration: float
    captions: List[CaptionSegment]

class VoiceResponse(BaseModel):
    audio_url: str
    duration: float
    voice_id: str

class VideoSceneResult(BaseModel):
    scene_id: str
    video_url: str
    duration: float
    prompt: str

class VideoGenerationResponse(BaseModel):
    project_title: str
    scenes: List[VideoSceneResult]
    timeline_json: Dict[str, Any]

class AutoEditResponse(BaseModel):
    operations: List[Dict[str, Any]]
    silence_segments_found: int
    duration_saved: float
