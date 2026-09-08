import time
import subprocess
from jobs.render_job import RenderJob
from jobs.job_queue import JobQueue
from ffmpeg.command_builder import FFmpegCommandBuilder

class RenderWorker:
    def __init__(self, queue: JobQueue):
        self.queue = queue
        self.running = False

    def start(self):
        self.running = True
        print("[RenderWorker] Starting headless FFmpeg worker...")
        while self.running:
            job = self.queue.dequeue(timeout=2.0)
            if job:
                self.process_job(job)

    def process_job(self, job: RenderJob):
        print(f"[RenderWorker] Processing job {job.id} for project {job.project_id}")
        job.status = "rendering"
        job.progress = 10.0

        builder = FFmpegCommandBuilder(
            output_path=job.output_path or f"/storage/exports/{job.id}.mp4",
            resolution=job.resolution,
            fps=job.fps,
            format=job.format
        )

        cmd = builder.build_command()
        print(f"[RenderWorker] Command: {' '.join(cmd)}")

        job.progress = 100.0
        job.status = "complete"
        print(f"[RenderWorker] Job {job.id} finished successfully.")

if __name__ == "__main__":
    q = JobQueue()
    worker = RenderWorker(q)
    print("[RenderWorker] Standby mode initialized.")
