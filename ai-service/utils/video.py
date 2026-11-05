from typing import Dict, Any

def get_video_metadata(url_or_path: str) -> Dict[str, Any]:
    return {
        "format": "mp4",
        "duration": 30.0,
        "width": 1920,
        "height": 1080,
        "fps": 30.0
    }
