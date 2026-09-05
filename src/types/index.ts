export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type ProjectSource = 'blank' | 'ai' | 'import' | 'template';
export type MediaType = 'video' | 'image' | 'audio';
export type TrackKind = 'video' | 'audio' | 'text' | 'caption';
export type TextAlign = 'left' | 'center' | 'right';
export type TextAnimation = 'none' | 'fade' | 'slide-up' | 'typewriter';
export type UserPlan = 'free' | 'pro' | 'studio';
export type AIJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';
export type AIJobType =
  | 'video-generate'
  | 'script'
  | 'voice'
  | 'captions'
  | 'auto-edit'
  | 'background-removal'
  | 'translate'
  | 'highlights';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  plan: UserPlan;
}

export interface Project {
  id: string;
  name: string;
  duration: number;
  aspectRatio: AspectRatio;
  thumbnailColor: string;
  createdAt: string;
  updatedAt: string;
  prompt?: string;
  source: ProjectSource;
  language?: string;
  voice?: string;
  style?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  durationMs?: number;
  width?: number;
  height?: number;
  thumbnailColor: string;
  src?: string;
  createdAt: string;
}

interface TimelineItemBase {
  id: string;
  trackId: string;
  name: string;
  startMs: number;
  durationMs: number;
}

export interface VideoClip extends TimelineItemBase {
  kind: 'video';
  mediaId?: string;
  thumbnailColor: string;
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  opacity: number;
  speed: number;
}

export interface AudioClip extends TimelineItemBase {
  kind: 'audio';
  mediaId?: string;
  volume: number;
  fadeInMs: number;
  fadeOutMs: number;
  speed: number;
}

export interface TextLayer extends TimelineItemBase {
  kind: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  align: TextAlign;
  color: string;
  positionX: number;
  positionY: number;
  animation: TextAnimation;
}

export interface Caption extends TimelineItemBase {
  kind: 'caption';
  text: string;
  style: 'default' | 'boxed' | 'outline';
}

export type TimelineItem = VideoClip | AudioClip | TextLayer | Caption;

export interface TimelineTrack {
  id: string;
  kind: TrackKind;
  name: string;
  locked: boolean;
  muted: boolean;
  hidden: boolean;
  items: TimelineItem[];
}

export interface Effect {
  id: string;
  name: string;
  category: 'blur' | 'color' | 'stylize' | 'motion';
  intensity: number;
  targetItemId: string;
}

export interface Transition {
  id: string;
  name: string;
  type: 'cut' | 'dissolve' | 'slide' | 'wipe';
  durationMs: number;
  fromItemId: string;
  toItemId: string;
}

export interface AIJob {
  id: string;
  type: AIJobType;
  status: AIJobStatus;
  projectId: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface StoredProject {
  project: Project;
  tracks: TimelineTrack[];
  media: MediaAsset[];
}

export interface CreateProjectInput {
  name: string;
  source: ProjectSource;
  duration: number;
  aspectRatio: AspectRatio;
  prompt?: string;
  language?: string;
  voice?: string;
  style?: string;
  templateId?: string;
}
