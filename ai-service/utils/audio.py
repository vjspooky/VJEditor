import math
from typing import List, Tuple

def detect_silence_segments(duration: float, min_silence_len: float = 0.5) -> List[Tuple[float, float]]:
    """
    Placeholder analyzer returning detectable low-amplitude intervals.
    In production connects to ffmpeg silencedetect or librosa.
    """
    silences = []
    if duration > 10.0:
        silences.append((3.2, 4.8))
        silences.append((8.5, 9.7))
    return silences
