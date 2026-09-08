import type { AspectRatio, MediaType } from '@/types';

export interface CanvasSettings {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  background: string;
  zoom: number;
}

export interface CanvasElement {
  id: string;
  mediaId: string;
  type: Extract<MediaType, 'video' | 'image'>;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
}

export interface EditorCanvasState {
  projectId: string;
  canvas: CanvasSettings;
  elements: CanvasElement[];
  selectedElementId: string | null;
}

export interface StoredCanvasState extends Omit<EditorCanvasState, 'selectedElementId'> {
  updatedAt: string;
}
