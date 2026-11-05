import shlex
from typing import List, Dict, Any

class FFmpegCommandBuilder:
    def __init__(self, output_path: str, resolution: str = "1080p", fps: int = 30, format: str = "mp4"):
        self.output_path = output_path
        self.fps = min(max(fps, 24), 60)
        self.format = "mp4" if format not in ["mp4", "webm"] else format
        self.inputs: List[str] = []
        self.filter_complex: List[str] = []

        res_map = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "4K": (3840, 2160)
        }
        self.width, self.height = res_map.get(resolution, (1920, 1080))

    def add_input(self, file_path: str) -> int:
        self.inputs.append(file_path)
        return len(self.inputs) - 1

    def add_filter(self, filter_str: str) -> None:
        self.filter_complex.append(filter_str)

    def build_command(self) -> List[str]:
        cmd = ["ffmpeg", "-y"]
        for inp in self.inputs:
            cmd.extend(["-i", inp])

        if self.filter_complex:
            cmd.extend(["-filter_complex", ";".join(self.filter_complex)])

        cmd.extend([
            "-r", str(self.fps),
            "-s", f"{self.width}x{self.height}",
            "-c:v", "libx264" if self.format == "mp4" else "libvpx-vp9",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            self.output_path
        ])
        return cmd
