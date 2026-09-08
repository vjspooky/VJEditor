import { readJson, writeJson } from '@/services/storage';
import type { AspectRatio } from '@/types';
import type { CanvasElement, CanvasSettings, StoredCanvasState } from '@/features/editor/canvasTypes';

const EDITOR_STATE_KEY = 'editor-canvas';

const CANVAS_SIZES: Record<AspectRatio, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
};

export function canvasSize(aspectRatio: AspectRatio) {
  return CANVAS_SIZES[aspectRatio];
}

export function createCanvasSettings(aspectRatio: AspectRatio): CanvasSettings {
  return { ...canvasSize(aspectRatio), aspectRatio, background: '#08090c', zoom: 100 };
}

export const editorService = {
  get(projectId: string, aspectRatio: AspectRatio): StoredCanvasState {
    const all = readJson<Record<string, StoredCanvasState>>(EDITOR_STATE_KEY, {});
    const stored = all[projectId];
    if (!stored || !Array.isArray(stored.elements) || !stored.canvas) {
      return { projectId, canvas: createCanvasSettings(aspectRatio), elements: [], updatedAt: new Date().toISOString() };
    }
    const settings = createCanvasSettings(stored.canvas.aspectRatio ?? aspectRatio);
    return { ...stored, canvas: { ...settings, ...stored.canvas }, projectId };
  },

  save(state: Omit<StoredCanvasState, 'updatedAt'>): void {
    const all = readJson<Record<string, StoredCanvasState>>(EDITOR_STATE_KEY, {});
    all[state.projectId] = { ...state, updatedAt: new Date().toISOString() };
    writeJson(EDITOR_STATE_KEY, all);
  },

  remove(projectId: string): void {
    const all = readJson<Record<string, StoredCanvasState>>(EDITOR_STATE_KEY, {});
    delete all[projectId];
    writeJson(EDITOR_STATE_KEY, all);
  },
};

export function defaultElement(mediaId: string, type: CanvasElement['type'], canvas: CanvasSettings, index: number): CanvasElement {
  const isPortrait = canvas.height > canvas.width;
  const width = type === 'video' ? (isPortrait ? canvas.width * 0.86 : canvas.width * 0.72) : canvas.width * 0.42;
  const height = type === 'video' ? width * (isPortrait ? 16 / 9 : 9 / 16) : width;
  return {
    id: crypto.randomUUID(),
    mediaId,
    type,
    x: Math.max(0, (canvas.width - width) / 2 + index * 24),
    y: Math.max(0, (canvas.height - height) / 2 + index * 24),
    width,
    height,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 100,
    visible: true,
  };
}
