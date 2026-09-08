import queue
from typing import Optional
from jobs.render_job import RenderJob

class JobQueue:
    def __init__(self):
        self._q = queue.Queue()

    def enqueue(self, job: RenderJob) -> None:
        self._q.put(job)

    def dequeue(self, timeout: Optional[float] = None) -> Optional[RenderJob]:
        try:
            return self._q.get(timeout=timeout)
        except queue.Empty:
            return None

    def empty(self) -> bool:
        return self._q.empty()
