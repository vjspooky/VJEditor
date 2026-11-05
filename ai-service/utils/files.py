import os
import tempfile

def create_temp_file(suffix: str = ".tmp") -> str:
    fd, path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    return path

def cleanup_file(path: str) -> None:
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass
