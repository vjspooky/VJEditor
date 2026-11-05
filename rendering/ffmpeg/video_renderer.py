from typing import Dict, Any, List

class VideoRenderer:
    def build_video_filter(self, clips: List[Dict[str, Any]]) -> str:
        """
        Builds concat and overlay filter chains for video clips.
        """
        if not clips:
            return "color=c=black:s=1920x1080:d=1[v_out]"
        return "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2[v_out]"
