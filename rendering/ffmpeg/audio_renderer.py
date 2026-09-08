from typing import Dict, Any, List

class AudioRenderer:
    def build_audio_filter(self, clips: List[Dict[str, Any]]) -> str:
        """
        Builds amix / volume filters for timeline audio clips.
        """
        if not clips:
            return "anullsrc=r=44100:cl=stereo[a_out]"
        return "[0:a]volume=1.0[a_out]"
