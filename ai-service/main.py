from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.script import router as script_router
from api.transcription import router as transcription_router
from api.voice import router as voice_router
from api.video import router as video_router
from api.auto_edit import router as auto_edit_router

app = FastAPI(
    title="VJEditor AI Service",
    description="Python microservice powering transcription, AI voice, generative scenes, and auto-editing.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "vjeditor-ai-service"}

app.include_router(script_router, prefix="/api")
app.include_router(transcription_router, prefix="/api")
app.include_router(voice_router, prefix="/api")
app.include_router(video_router, prefix="/api")
app.include_router(auto_edit_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
