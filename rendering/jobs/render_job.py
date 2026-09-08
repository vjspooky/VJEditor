from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class RenderJob(BaseModel):
    id: str
    project_id: str
    format: str = "mp4"
    resolution: str = "1080p"
    fps: int = 30
    quality: str = "standard"
    status: str = "queued"
    progress: float = 0.0
    output_path: Optional[str] = None
    error: Optional[str] = None
    timeline_json: Optional[Dict[str, Any]] = None
