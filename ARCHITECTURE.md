# VJEditor — Phase-by-Phase Files + Code Responsibilities

This document defines the complete architectural blueprint, phase-by-phase file structure, code responsibilities, and data flows for **VJEditor** — a web-based AI video creation and editing workspace.

---

## State Management Architecture & Hierarchy

> [!IMPORTANT]
> **Store Hierarchy Rule**: Do **not** create fragmented, independent sources of truth (`editorStore`, `timelineStore`, `canvasStore`, `playbackStore`). Instead, use a single unified hierarchy with one authoritative timeline clock:

```
Editor State
│
├── Project State      (Metadata, dimensions, fps, resolution, settings)
├── Media State        (Imported video, audio, image assets, upload status)
├── Timeline State     (Tracks, clips, transitions, markers, order)
├── Selection State    (Selected track, clip, element, keyframe)
├── Playback State     (Current time, play status, playback speed, loop)
└── UI State           (Active tool, active modal, zoom level, panels)
```

```
                     ONE Timeline Clock (Authoritative)
                                    │
                                    ▼
                              Timeline State
                                    │
                                    ▼
                               Canvas State
                                    │
                                    ▼
                         Video / Audio Playback
```

---

## Phase 1 — Frontend Foundation & Design System

Establishes the visual system, reusable UI primitives, and layout foundation.

### File Structure
```
frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── common/
    │   │   ├── Button.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Tooltip.tsx
    │   │   └── LoadingSpinner.tsx
    │   └── layout/
    │       ├── AppLayout.tsx
    │       ├── Sidebar.tsx
    │       └── Topbar.tsx
    └── pages/
        ├── Home.tsx
        └── NotFound.tsx
```

### Key Responsibilities & Code

#### `src/App.tsx`
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### `src/components/common/Button.tsx`
```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled,
  className = "",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 font-medium transition ${className}`}
    >
      {children}
    </button>
  );
}
```

---

## Phase 2 — Dashboard & Project Management

Handles project creation (blank, AI-assisted, template), local persistence, listing, and configuration.

### File Structure
```
src/components/dashboard/
├── Dashboard.tsx
├── DashboardHeader.tsx
├── WelcomeSection.tsx
├── QuickCreate.tsx
├── ProjectCard.tsx
├── ProjectGrid.tsx
├── ProjectMenu.tsx
├── CreateProjectModal.tsx
├── AIProjectModal.tsx
└── EmptyProjectsState.tsx

src/store/
└── projectStore.ts

src/models/
└── project.ts
```

### Key Responsibilities & Code

#### `src/models/project.ts`
```ts
export type ProjectType = "blank" | "ai" | "template";

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  duration: number;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  resolution: "720p" | "1080p" | "4K";
  type: ProjectType;
  createdAt: string;
  updatedAt: string;
}
```

#### `src/store/projectStore.ts`
```ts
import { Project } from "../models/project";

const STORAGE_KEY = "vjeditor-projects";

export function getProjects(): Project[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function createProject(project: Project): Project {
  const projects = getProjects();
  projects.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return project;
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
```

---

## Phase 3 — Media Library & Upload

Asset management supporting videos, images, and audio with local storage and object URLs during development.

### File Structure
```
src/components/media/
├── MediaLibrary.tsx
├── MediaCard.tsx
├── UploadArea.tsx
├── MediaPreview.tsx
└── MediaContextMenu.tsx

src/store/
└── mediaStore.ts

src/models/
└── media.ts

src/hooks/
└── useMediaUpload.ts
```

### Media Models & Upload Flow

#### `src/models/media.ts`
```ts
export type MediaType = "video" | "image" | "audio";

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
  size: number;
  createdAt: string;
}
```

#### Upload Pipeline
```
File Picker
   ↓
Validate File (Format, mime-type, size)
   ↓
Create MediaAsset (Extract metadata, duration, dimensions)
   ↓
Store Metadata (Local storage / indexedDB / backend)
   ↓
Display in Media Library
   ↓
Drag into Timeline
```

---

## Phase 4 — Editor Workspace, Canvas & Playback

The central editing studio layout, canvas rendering area, preview panel, and synchronized requestAnimationFrame playback engine.

### File Structure
```
src/components/editor/
├── Editor.tsx
├── EditorHeader.tsx
├── Canvas.tsx
├── PreviewPanel.tsx
├── Toolbar.tsx
├── PropertiesPanel.tsx
└── PlaybackControls.tsx

src/store/
└── editorStore.ts

src/hooks/
└── usePlayback.ts
```

### Component Hierarchy
```
Editor
 ├── Header
 ├── Toolbar
 ├── Preview
 │    └── Canvas
 ├── Properties
 └── Timeline
```

#### `src/hooks/usePlayback.ts`
```ts
import { useEffect, useRef } from "react";

export function usePlayback(
  isPlaying: boolean,
  setCurrentTime: (time: number) => void
) {
  const lastTime = useRef(performance.now());

  useEffect(() => {
    if (!isPlaying) return;

    let frameId: number;

    const tick = (now: number) => {
      const delta = (now - lastTime.current) / 1000;
      lastTime.current = now;

      setCurrentTime(delta);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, setCurrentTime]);
}
```
> [!IMPORTANT]
> Always synchronize against **one authoritative timeline clock** rather than incrementing independent component clocks.

---

## Phase 5 — Multi-Track Timeline

Core NLE (Non-Linear Editor) timeline tracks, clips, playhead, time ruler, and scale conversion.

### File Structure
```
src/components/timeline/
├── Timeline.tsx
├── TimelineHeader.tsx
├── TimelineRuler.tsx
├── TimelineTrack.tsx
├── TimelineClip.tsx
├── TrackHeader.tsx
├── Playhead.tsx
└── TimelineToolbar.tsx

src/models/
└── timeline.ts

src/store/
└── timelineStore.ts

src/hooks/
└── useTimeline.ts

src/utils/
└── time.ts
```

### Models

#### `src/models/timeline.ts`
```ts
export interface TimelineClip {
  id: string;
  mediaId: string;
  trackId: string;
  startTime: number;
  duration: number;
  sourceStartTime: number;
  sourceDuration: number;
  type: "video" | "image" | "audio";
  name: string;
  volume: number;
  muted: boolean;
  visible: boolean;
  locked?: boolean;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "text" | "caption";
  clips: TimelineClip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
}
```

---

## Phase 6 — Professional Clip Editing

Precision editing operations, snapping to clip boundaries/playhead, history stack (undo/redo), and clipboard functionality.

### File Structure Updates
```
src/utils/
├── frame.ts
├── snapping.ts
├── validation.ts
└── clipboard.ts

src/hooks/
├── useHistory.ts
└── useAutosave.ts
```

### Essential Clip Operations
- `splitClip(clip, splitTime)`
- `trimClip(clip, newStart, newEnd)`
- `moveClip(clip, targetTrackId, newStartTime)`
- `deleteClip(clipId)`
- `duplicateClip(clipId)`
- `replaceClip(clipId, newMediaId)`
- `insertClip(clip, trackId, time)`
- `rippleDelete(clipId)`
- `rippleTrim(clipId, delta)`
- `copyClips(clipIds)`
- `pasteClips(targetTrackId, atTime)`

#### Clip Splitting Logic Example
```ts
export function splitClip(
  clip: TimelineClip,
  splitTime: number
): [TimelineClip, TimelineClip] | null {
  const localTime = splitTime - clip.startTime;

  if (localTime <= 0 || localTime >= clip.duration) {
    return null;
  }

  const first: TimelineClip = {
    ...clip,
    id: crypto.randomUUID(),
    duration: localTime,
    sourceDuration: localTime,
  };

  const second: TimelineClip = {
    ...clip,
    id: crypto.randomUUID(),
    startTime: splitTime,
    duration: clip.duration - localTime,
    sourceStartTime: clip.sourceStartTime + localTime,
    sourceDuration: clip.sourceDuration - localTime,
  };

  return [first, second];
}
```

---

## Phase 7 — Text Editor

Rich typography and motion titles existing both as interactive canvas elements and editable timeline items.

### File Structure
```
src/components/text/
├── TextEditor.tsx
├── TextToolbar.tsx
├── TextProperties.tsx
├── TextCanvasElement.tsx
└── TextPresets.tsx

src/models/
└── text.ts
```

#### `src/models/text.ts`
```ts
export interface TextElement {
  id: string;
  content: string;

  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";

  color: string;
  opacity: number;

  alignment: "left" | "center" | "right";

  letterSpacing: number;
  lineHeight: number;

  x: number;
  y: number;
  width: number;
  height: number;

  scale: number;
  rotation: number;

  strokeColor?: string;
  strokeWidth?: number;

  shadow?: boolean;
  shadowColor?: string;

  backgroundColor?: string;
  backgroundOpacity?: number;
  padding?: number;
  borderRadius?: number;
}
```

---

## Phase 8 — Audio Editor

Multi-track audio processing, volume envelope controls, fade curves, and cached visual waveforms.

### File Structure
```
src/components/audio/
├── AudioEditor.tsx
├── Waveform.tsx
├── AudioProperties.tsx
└── AudioControls.tsx

src/models/
└── audio.ts
```

#### `src/models/audio.ts`
```ts
export interface AudioClip {
  id: string;
  mediaId: string;
  trackId: string;
  startTime: number;
  duration: number;
  sourceStartTime: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  muted: boolean;
}
```

#### Waveform Architecture & Peak Caching
```
Audio File
   ↓
Decode / Web Audio API Analyser
   ↓
Extract Waveform Peaks (Downsampled)
   ↓
Cache Peaks (IndexedDB / Memory Map)
   ↓
Render Canvas / SVG Waveform
```
> [!TIP]
> Do not decode the entire audio file on every React render. Compute and cache downsampled peak arrays once upon import.

---

## Phase 9 — Captions

Timeline subtitle tracks, styling templates, word-level timestamps, and SRT/VTT import/export.

### File Structure
```
src/components/captions/
├── CaptionEditor.tsx
├── CaptionTrack.tsx
├── CaptionItem.tsx
└── CaptionStylePanel.tsx

src/models/
└── caption.ts
```

#### `src/models/caption.ts`
```ts
export interface Caption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  language: string;
  speaker?: string;
  styleId?: string;
}
```

---

## Phase 10 — Effects, Filters & Transitions

Visual shaders, CSS/WebGL image filters, and clip-to-clip transitions.

### File Structure
```
src/components/effects/
├── EffectsPanel.tsx
├── FiltersPanel.tsx
├── TransitionPanel.tsx
└── EffectControls.tsx

src/models/
└── effects.ts
```

#### `src/models/effects.ts`
```ts
export interface ClipEffect {
  id: string;
  type:
    | "blur"
    | "brightness"
    | "contrast"
    | "saturation"
    | "grayscale"
    | "sepia"
    | "vignette";
  intensity: number;
  enabled: boolean;
}

export interface Transition {
  id: string;
  type: "fade" | "dissolve" | "wipe" | "slide" | "zoom";
  duration: number;
}
```

---

## Phase 11 — Keyframes

Parametric animation engine for position, scale, rotation, and opacity across time.

### File Structure
```
src/components/keyframes/
├── KeyframeEditor.tsx
├── KeyframeTimeline.tsx
├── KeyframePoint.tsx
└── AnimationPanel.tsx

src/models/
└── keyframe.ts
```

#### `src/models/keyframe.ts`
```ts
export interface Keyframe {
  id: string;
  property: string;
  time: number;
  value: number | { x: number; y: number };
  easing:
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out";
}
```

#### Interpolation Pipeline
```
Keyframe A (t0, v0) ────────► Keyframe B (t1, v1)
                 │         │
                 ▼         ▼
             Easing Interpolation
                     │
                     ▼
             Current Playhead Time
                     │
                     ▼
              Calculated Value
                     │
                     ▼
             Canvas Render Node
```

---

## Phase 12 — Export UI

Job creation modal, export presets, progress tracking, and export history.

### File Structure
```
src/components/export/
├── ExportModal.tsx
├── ExportSettings.tsx
├── ExportProgress.tsx
└── ExportHistory.tsx

src/models/
└── export.ts
```

#### `src/models/export.ts`
```ts
export interface ExportSettings {
  format: "mp4" | "webm";
  resolution: "720p" | "1080p" | "4K";
  fps: 24 | 25 | 30 | 50 | 60;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  quality: "draft" | "standard" | "high" | "maximum";
}
```

---

## Phase 13 — Spring Boot Backend

REST API foundation for project persistence, media metadata, timeline sync, and export orchestration.

### File Structure
```
backend/
├── pom.xml
└── src/main/java/com/vjeditor/
    ├── VJEditorApplication.java
    ├── controller/
    │   ├── ProjectController.java
    │   ├── MediaController.java
    │   ├── TimelineController.java
    │   └── ExportController.java
    ├── service/
    ├── repository/
    ├── entity/
    ├── dto/
    ├── security/
    ├── exception/
    └── config/
```

#### Project Controller Example
```java
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectResponse> getProjects() {
        return projectService.getProjects();
    }

    @PostMapping
    public ProjectResponse createProject(@Valid @RequestBody ProjectRequest request) {
        return projectService.createProject(request);
    }
}
```

---

## Phase 14 — PostgreSQL & Data Modeling

Relational database schemas, migrations, and JPA entities.

### Schema & Migrations
```
database/
├── migrations/
│   ├── V1__create_users.sql
│   ├── V2__create_projects.sql
│   ├── V3__create_media.sql
│   ├── V4__create_timeline.sql
│   └── V5__create_exports.sql
└── schema.sql
```

### Relational Entity Graph
```
User
 └── Projects
       ├── Media Assets
       ├── Timeline
       │     ├── Tracks
       │     │     └── Clips
       │     └── Text Elements
       └── Export Jobs
```

---

## Phase 15 — Authentication & Authorization

JWT-based stateless authentication, user management, and route guards.

### File Structure
```
backend/security/
├── SecurityConfig.java
├── JwtService.java
├── JwtFilter.java
└── CustomUserDetailsService.java

Frontend:
src/pages/
├── Login.tsx
├── Register.tsx
└── Settings.tsx

src/store/
└── authStore.ts

src/services/
└── authService.ts
```

#### Authentication Flow
```
Register ──► Password Hash (BCrypt) ──► PostgreSQL
                                             │
Login ◄──────────────────────────────────────┘
  │
Verify Credentials ──► Issue Signed JWT ──► Frontend Storage / Auth Header
                                                   │
Protected REST APIs ◄──────────────────────────────┘
```

---

## Phase 16 — Python AI Service

Microservice powered by FastAPI exposing endpoints for transcription, voice synthesis, generative scenes, and auto-editing.

### File Structure
```
ai-service/
├── main.py
├── requirements.txt
├── api/
│   ├── script.py
│   ├── transcription.py
│   ├── voice.py
│   ├── video.py
│   └── auto_edit.py
├── models/
│   ├── request_models.py
│   └── response_models.py
├── services/
│   ├── script_service.py
│   ├── speech_service.py
│   ├── voice_service.py
│   ├── video_service.py
│   └── auto_edit_service.py
└── utils/
    ├── audio.py
    ├── video.py
    └── files.py
```

#### `ai-service/main.py`
```python
from fastapi import FastAPI

app = FastAPI(title="VJEditor AI Service")

@app.get("/health")
def health():
    return {"status": "ok"}
```

---

## Phase 17 — Speech-to-Text (Transcription)

Automated timestamped subtitle extraction from video/audio tracks.

### Main Modules
- `ai-service/api/transcription.py`
- `ai-service/services/speech_service.py`

### Pipeline
```
Video File
    ↓
Audio Extraction (FFmpeg PCM 16kHz)
    ↓
Speech Recognition Model (Whisper / STT Engine)
    ↓
Timestamped Segments & Word Alignments
    ↓
Caption Objects JSON
    ↓
Spring Boot API
    ↓
PostgreSQL Persistence
    ↓
Frontend Caption Track Rendering
```

---

## Phase 18 — AI Voice (Text-to-Speech)

Voiceover generation from script text with voice personas and emotion parameters.

### Main Modules
- `ai-service/api/voice.py`
- `ai-service/services/voice_service.py`

### Pipeline
```
User Script
    ↓
Voice Provider (Server-side API key protection)
    ↓
Generated Audio File
    ↓
Object Storage (S3 / MinIO / Local)
    ↓
MediaAsset Entity Created
    ↓
Inserted into Timeline Audio Track
```

---

## Phase 19 — AI Video Generation

Generative video creation translating natural language prompts into complete, editable multi-track projects.

### Main Modules
- `ai-service/api/video.py`
- `ai-service/services/video_service.py`

### Generation Pipeline
```
Prompt
    ↓
AI Script Breakdown
    ↓
Scene Plan (Durations, transitions, camera moves)
    ↓
Visual Assets (Video/Image generation)
    ↓
Voiceover Audio
    ↓
Synchronized Captions
    ↓
VJEditor Timeline JSON Schema
    ↓
Fully Editable VJEditor Project
```
> [!TIP]
> The AI pipeline produces an editable project with independent tracks, not an uneditable flattened video file.

---

## Phase 20 — AI Auto Editing

Intelligent silence removal, jump-cut generation, filler-word trimming, and pacing optimization.

### Main Modules
- `ai-service/api/auto_edit.py`
- `ai-service/services/auto_edit_service.py`

#### Structured Output Contract
```json
{
  "operations": [
    {
      "type": "CUT",
      "clipId": "clip-1",
      "start": 5.2,
      "end": 12.8
    },
    {
      "type": "REMOVE_SILENCE",
      "clipId": "clip-2"
    }
  ]
}
```

#### Safe Execution Flow
```
AI Edit Suggestions
         ↓
Interactive Diff Preview
         ↓
User Review & Approval
         ↓
Timeline Engine Applies Operations
```
> [!CAUTION]
> Never let AI edit suggestions directly mutate database records without client-side validation and user confirmation.

---

## Phase 21 — FFmpeg Rendering Engine

Headless rendering worker converting VJEditor Timeline JSON into finished MP4/WebM video exports.

### File Structure
```
rendering/
├── render_worker.py
├── ffmpeg/
│   ├── command_builder.py
│   ├── video_renderer.py
│   ├── audio_renderer.py
│   ├── text_renderer.py
│   └── subtitle_renderer.py
└── jobs/
    ├── render_job.py
    └── job_queue.py
```

### Rendering Pipeline
```
VJEditor Timeline JSON
         ↓
Render Planner (Filter graph generator, scaling, track overlays)
         ↓
Validated FFmpeg Filtergraph Commands
         ↓
FFmpeg Render Worker
         ↓
Encoded MP4 / WebM File
         ↓
Object Storage
         ↓
Export History & Download Link
```
> [!IMPORTANT]
> **Command Injection Protection**: Never construct FFmpeg commands by concatenating raw user input. Use strictly typed parameters, escaped filtergraph arguments, and bounded numeric ranges.

---

## Phase 22 — Production Architecture & Deployment

### Monorepo Structure
```
VJEditor/
├── frontend/
├── backend/
├── ai-service/
├── rendering/
├── database/
├── storage/
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   ├── ai.Dockerfile
│   └── rendering.Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── ARCHITECTURE.md
```

### Production Topology Diagram
```
                       ┌───────────────┐
                       │   VJEditor UI │
                       │ React + TS    │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Spring Boot   │
                       │ REST API      │
                       └───┬─────┬─────┘
                           │     │
              ┌────────────┘     └────────────┐
              ▼                               ▼
       ┌──────────────┐                ┌──────────────┐
       │ PostgreSQL   │                │ Object       │
       │              │                │ Storage      │
       └──────────────┘                └──────┬───────┘
                                               │
                              ┌────────────────┴───────────┐
                              ▼                            ▼
                     ┌────────────────┐          ┌────────────────┐
                     │ Python AI      │          │ FFmpeg Workers │
                     │ Services       │          │                │
                     └────────────────┘          └────────────────┘
```
