export type EditMode = 'select' | 'blade' | 'ripple' | 'roll' | 'slip' | 'slide';

export interface Keyframe<T = number> {
  id: string;
  time: number; // Seconds relative to clip start
  value: T;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bezier';
}

export interface ClipTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
}

export interface AdvancedClip {
  id: string;
  trackId: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'image' | 'compound' | 'adjustment';

  // Timeline Placement
  startTime: number; // Seconds on the main timeline
  duration: number; // Visible duration on timeline

  // Media In/Out bounds
  sourceStartTime: number; // Trim in-point inside source file
  sourceDuration: number; // Max playable length of source asset

  // Speed & Ramping
  playbackRate: number; // 0.1x to 10x

  // Linking & Parenting
  linkedClipIds?: string[]; // E.g., Audio paired with this video
  parentId?: string; // Follows transforms of another clip

  // Compound / Nested sequence payloads
  nestedTracks?: AdvancedTrack[];

  // Effects & Adjustments (applied down the stack)
  effects?: Array<{
    id: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Record<string, any>;
    enabled: boolean;
  }>;

  // Keyframes
  keyframes?: Record<string, Keyframe[]>;
  transform: ClipTransform;

  muted?: boolean;
  locked?: boolean;
  visible?: boolean;
}

export interface AdvancedTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'overlay' | 'adjustment';
  order: number;
  muted: boolean;
  locked: boolean;
  visible: boolean;
  clips: AdvancedClip[];
}

export interface TimelineState {
  tracks: AdvancedTrack[];
  currentTime: number;
  totalDuration: number;
  zoom: number;
  snapEnabled: boolean;
  activeMode: EditMode;
  selectedClipIds: string[];
}
