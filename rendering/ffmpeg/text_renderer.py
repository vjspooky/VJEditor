import re
from typing import Dict, Any

class TextRenderer:
    def build_drawtext_filter(self, text_element: Dict[str, Any]) -> str:
        raw_text = text_element.get("content", "")
        # Sanitize single quotes and colons to prevent FFmpeg filter injection
        safe_text = re.sub(r"[':\\]", "", raw_text)
        font_size = int(text_element.get("fontSize", 32))
        color = text_element.get("color", "white")

        return f"drawtext=text='{safe_text}':fontsize={font_size}:fontcolor={color}:x=(w-text_w)/2:y=(h-text_h)/2"
