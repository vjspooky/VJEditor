export type FrameRate = 24 | 25 | 30 | 50 | 60;
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type ProjectSource = 'blank' | 'ai' | 'import' | 'template';
export type ProjectResolution = '720p' | '1080p' | '4K';
export type MediaType = 'video' | 'image' | 'audio';
export type MediaStatus = 'uploading' | 'ready' | 'error';
export type TrackKind = 'video' | 'audio' | 'text' | 'caption';
export type TextAlign = 'left' | 'center' | 'right';
export type TextAnimation =
  | 'none'
  | 'fade'
  | 'fade-in'
  | 'fade-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'pop'
  | 'typewriter';

export type UserPlan = 'free' | 'pro' | 'studio';
export type EditingMode = 'select' | 'split' | 'cut' | 'trim' | 'slip' | 'ripple';

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
  resolution?: ProjectResolution;
  thumbnailColor: string;
  thumbnail?: string;
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
  status?: MediaStatus;
  durationMs?: number;
  width?: number;
  height?: number;
  thumbnailColor: string;
  thumbnail?: string;
  src?: string;
  url?: string;
  size?: number;
  mimeType?: string;
  projectIds?: string[];
  createdAt: string;
  updatedAt?: string;
}



export type AnimatableProperty =
  | 'positionX'
  | 'positionY'
  | 'scale'
  | 'rotation'
  | 'opacity'
  | 'volume'
  | 'blur'
  | 'brightness'
  | 'saturation';

export type KeyframeEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface Keyframe {
  id: string;
  property: AnimatableProperty;
  timeMs: number;
  value: number;
  easing: KeyframeEasing;
}

export type EffectType =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'grayscale'
  | 'sepia'
  | 'vignette'
  | 'hue-rotate'
  | 'invert';

export interface ClipEffect {
  id: string;
  type: EffectType;
  name: string;
  intensity: number;
  enabled: boolean;
}

export type TransitionType = 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'blur' | 'push';

export interface TrackTransition {
  id: string;
  type: TransitionType;
  durationMs: number;
  afterClipId: string;
  beforeClipId: string;
}

export interface TimelineItemBase {
  id: string;
  trackId: string;
  name: string;
  startMs: number;
  durationMs: number;
  mediaId?: string;
  sourceStartMs?: number;
  sourceDurationMs?: number;
  locked?: boolean;
  muted?: boolean;
  hidden?: boolean;
  volume?: number;
  effects?: ClipEffect[];
  keyframes?: Keyframe[];
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
  gain?: number;
  fadeInMs: number;
  fadeOutMs: number;
  speed: number;
  waveformData?: number[];
}

export interface TextLayer extends TimelineItemBase {
  kind: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  align: TextAlign;
  color: string;
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  padding?: number;
  borderRadius?: number;
  animation: TextAnimation;
}

export interface Caption extends TimelineItemBase {
  kind: 'caption';
  text: string;
  style: 'default' | 'boxed' | 'outline' | 'karaoke' | 'minimal' | 'social';
  position?: 'top' | 'center' | 'bottom';
  speaker?: string;
  language?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  outlineColor?: string;
}

export type TimelineItem = VideoClip | AudioClip | TextLayer | Caption;

export interface TimelineTrack {
  id: string;
  kind: TrackKind;
  name: string;
  locked: boolean;
  muted: boolean;
  solo?: boolean;
  volume?: number;
  hidden: boolean;
  items: TimelineItem[];
  transitions?: TrackTransition[];
}

export type ExportStatus = 'preparing' | 'rendering' | 'processing' | 'finalizing' | 'complete' | 'failed';
export type ExportQuality = 'draft' | 'standard' | 'high' | 'maximum';

export interface ExportJob {
  id: string;
  projectId: string;
  projectName: string;
  format: 'mp4' | 'webm';
  resolution: ProjectResolution;
  fps: FrameRate;
  quality: ExportQuality;
  aspectRatio: AspectRatio;
  range: 'all' | 'selection';
  status: ExportStatus;
  progress: number;
  estimatedSizeBytes?: number;
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
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
  resolution?: ProjectResolution;
  prompt?: string;
  language?: string;
  voice?: string;
  style?: string;
  templateId?: string;
}
