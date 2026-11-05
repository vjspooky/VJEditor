import os

class SubtitleRenderer:
    def build_subtitles_filter(self, srt_file_path: str) -> str:
        # Escape Windows backslashes and colons for ffmpeg subtitles filter
        escaped_path = srt_file_path.replace("\\", "/").replace(":", "\\:")
        return f"subtitles='{escaped_path}'"
