import type {
  AudioClip,
  Caption,
  ClipEffect,
  EditingMode,
  ExportJob,
  FrameRate,
  Keyframe,
  MediaAsset,
  TextLayer,
  TimelineItem,
  TimelineTrack,
  TrackTransition,
  VideoClip,
} from '@/types';
import { createId } from '@/utils/id';
import { cloneTracks, findItem, isCompatibleTrack, projectDurationMs, rippleShiftItems } from '@/utils/timeline';
import { snapMsToFrame } from '@/utils/frame';

export type LeftPanelId =
  | 'media'
  | 'audio'
  | 'text'
  | 'captions'
  | 'transitions'
  | 'effects'
  | 'filters'
  | 'ai'
  | 'templates';

export interface EditorSnapshot {
  name: string;
  duration: number;
  tracks: TimelineTrack[];
  media: MediaAsset[];
}

export interface EditorUiState {
  selectedItemId: string | null;
  selectedItemIds: string[];
  playheadMs: number;
  isPlaying: boolean;
  volume: number;
  zoom: number;
  activeLeftPanel: LeftPanelId;
  isSaved: boolean;
  editingMode: EditingMode;
  rippleEnabled: boolean;
  frameSnapEnabled: boolean;
  splitAllTracks: boolean;
  fps: FrameRate;
}

export interface EditorState {
  projectId: string;
  aspectRatio: string;
  snapshot: EditorSnapshot;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  clipboard: TimelineItem[];
  exportJobs: ExportJob[];
  ui: EditorUiState;
}

export type EditorAction =
  | { type: 'load'; projectId: string; aspectRatio: string; snapshot: EditorSnapshot }
  | { type: 'select'; itemId: string | null }
  | { type: 'toggle-select'; itemId: string }
  | { type: 'select-multiple'; itemIds: string[] }
  | { type: 'clear-selection' }
  | { type: 'set-playhead'; ms: number }
  | { type: 'toggle-play' }
  | { type: 'set-playing'; playing: boolean }
  | { type: 'set-volume'; volume: number }
  | { type: 'set-zoom'; zoom: number }
  | { type: 'set-editing-mode'; mode: EditingMode }
  | { type: 'toggle-ripple' }
  | { type: 'toggle-frame-snap' }
  | { type: 'toggle-split-all' }
  | { type: 'set-fps'; fps: FrameRate }
  | { type: 'step-playhead'; direction: -1 | 1; large?: boolean }
  | { type: 'nudge-selected'; deltaMs: number }
  | { type: 'copy-selected' }
  | { type: 'cut-selected' }
  | { type: 'paste-clips' }
  | { type: 'duplicate-selected' }
  | { type: 'split-selected' }
  | { type: 'split-clip-at-time'; itemId: string; splitTimeMs: number }
  | { type: 'split-all-at-playhead' }
  | { type: 'delete-selected' }
  | { type: 'ripple-delete-selected' }
  | { type: 'set-panel'; panel: LeftPanelId }
  | { type: 'rename'; name: string }
  | { type: 'move-item'; itemId: string; startMs: number; targetTrackId?: string }
  | { type: 'move-items'; updates: Array<{ itemId: string; startMs: number; targetTrackId?: string }> }
  | { type: 'trim-item'; itemId: string; edge: 'start' | 'end'; deltaMs: number }
  | { type: 'replace-media'; itemId: string; asset: MediaAsset }
  | { type: 'update-item'; itemId: string; patch: Partial<TimelineItem> }
  | {
      type: 'add-text';
      preset?: Partial<TextLayer>;
    }
  | { type: 'add-caption'; caption?: Partial<Caption> }
  | { type: 'import-captions'; captions: Caption[] }
  | { type: 'add-media'; asset: MediaAsset }
  | { type: 'add-track'; kind: TimelineTrack['kind'] }
  | { type: 'update-track'; trackId: string; patch: Partial<TimelineTrack> }
  | { type: 'toggle-track-solo'; trackId: string }
  | { type: 'set-track-volume'; trackId: string; volume: number }
  | { type: 'delete-track'; trackId: string }
  | { type: 'add-effect'; itemId: string; effect: ClipEffect }
  | { type: 'update-effect'; itemId: string; effectId: string; patch: Partial<ClipEffect> }
  | { type: 'remove-effect'; itemId: string; effectId: string }
  | { type: 'reset-effects'; itemId: string }
  | { type: 'apply-filter-preset'; itemId: string; preset: 'cinematic' | 'warm' | 'cool' | 'vintage' | 'noir' | 'cyberpunk' | 'soft' }
  | { type: 'add-keyframe'; itemId: string; keyframe: Keyframe }
  | { type: 'update-keyframe'; itemId: string; keyframeId: string; patch: Partial<Keyframe> }
  | { type: 'remove-keyframe'; itemId: string; keyframeId: string }
  | { type: 'add-transition'; trackId: string; transition: TrackTransition }
  | { type: 'remove-transition'; trackId: string; transitionId: string }
  | { type: 'start-export'; job: ExportJob }
  | { type: 'update-export-job'; jobId: string; patch: Partial<ExportJob> }
  | { type: 'cancel-export'; jobId: string }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'mark-saved' };

const MAX_HISTORY = 50;
const MIN_CLIP_DURATION_MS = 100;

function pushHistory(state: EditorState, nextSnapshot: EditorSnapshot): EditorState {
  return {
    ...state,
    snapshot: nextSnapshot,
    past: [...state.past.slice(-(MAX_HISTORY - 1)), cloneSnapshot(state.snapshot)],
    future: [],
    ui: { ...state.ui, isSaved: false },
  };
}

function cloneSnapshot(snapshot: EditorSnapshot): EditorSnapshot {
  return {
    name: snapshot.name,
    duration: snapshot.duration,
    tracks: cloneTracks(snapshot.tracks),
    media: structuredClone(snapshot.media),
  };
}

function selectedItems(state: EditorState): TimelineItem[] {
  const ids = state.ui.selectedItemIds.length
    ? state.ui.selectedItemIds
    : state.ui.selectedItemId
      ? [state.ui.selectedItemId]
      : [];
  return state.snapshot.tracks.flatMap((track) => track.items).filter((item) => ids.includes(item.id));
}

function firstItemId(tracks: TimelineTrack[]): string | null {
  return tracks.find((t) => t.items.length > 0)?.items[0]?.id ?? null;
}

function getFilterEffects(preset: string): ClipEffect[] {
  switch (preset) {
    case 'cinematic':
      return [
        { id: createId('eff'), type: 'contrast', name: 'Contrast', intensity: 120, enabled: true },
        { id: createId('eff'), type: 'saturation', name: 'Saturation', intensity: 110, enabled: true },
        { id: createId('eff'), type: 'brightness', name: 'Brightness', intensity: 95, enabled: true },
      ];
    case 'warm':
      return [
        { id: createId('eff'), type: 'sepia', name: 'Warmth', intensity: 30, enabled: true },
        { id: createId('eff'), type: 'brightness', name: 'Brightness', intensity: 105, enabled: true },
      ];
    case 'cool':
      return [
        { id: createId('eff'), type: 'hue-rotate', name: 'Cool Tone', intensity: 180, enabled: true },
        { id: createId('eff'), type: 'contrast', name: 'Contrast', intensity: 110, enabled: true },
      ];
    case 'vintage':
      return [
        { id: createId('eff'), type: 'sepia', name: 'Sepia', intensity: 50, enabled: true },
        { id: createId('eff'), type: 'contrast', name: 'Contrast', intensity: 85, enabled: true },
        { id: createId('eff'), type: 'vignette', name: 'Vignette', intensity: 40, enabled: true },
      ];
    case 'noir':
      return [
        { id: createId('eff'), type: 'grayscale', name: 'Grayscale', intensity: 100, enabled: true },
        { id: createId('eff'), type: 'contrast', name: 'Contrast', intensity: 130, enabled: true },
      ];
    case 'cyberpunk':
      return [
        { id: createId('eff'), type: 'saturation', name: 'Saturation', intensity: 160, enabled: true },
        { id: createId('eff'), type: 'contrast', name: 'Contrast', intensity: 125, enabled: true },
        { id: createId('eff'), type: 'hue-rotate', name: 'Neon Hue', intensity: 45, enabled: true },
      ];
    case 'soft':
      return [
        { id: createId('eff'), type: 'blur', name: 'Soft Focus', intensity: 2, enabled: true },
        { id: createId('eff'), type: 'brightness', name: 'Brightness', intensity: 105, enabled: true },
      ];
    default:
      return [];
  }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'load':
      return {
        projectId: action.projectId,
        aspectRatio: action.aspectRatio,
        snapshot: action.snapshot,
        past: [],
        future: [],
        clipboard: [],
        exportJobs: [],
        ui: {
          selectedItemId: firstItemId(action.snapshot.tracks),
          selectedItemIds: firstItemId(action.snapshot.tracks) ? [firstItemId(action.snapshot.tracks)!] : [],
          playheadMs: 0,
          isPlaying: false,
          volume: 80,
          zoom: 48,
          activeLeftPanel: 'media',
          isSaved: true,
          editingMode: 'select',
          rippleEnabled: false,
          frameSnapEnabled: true,
          splitAllTracks: false,
          fps: 30,
        },
      };

    case 'select':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItemId: action.itemId,
          selectedItemIds: action.itemId ? [action.itemId] : [],
        },
      };

    case 'toggle-select': {
      const selectedItemIds = state.ui.selectedItemIds.includes(action.itemId)
        ? state.ui.selectedItemIds.filter((id) => id !== action.itemId)
        : [...state.ui.selectedItemIds, action.itemId];
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItemIds,
          selectedItemId: selectedItemIds.at(-1) ?? null,
        },
      };
    }

    case 'select-multiple': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItemIds: action.itemIds,
          selectedItemId: action.itemIds.at(-1) ?? null,
        },
      };
    }

    case 'clear-selection':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItemId: null,
          selectedItemIds: [],
        },
      };

    case 'set-playhead': {
      const raw = Math.max(0, action.ms);
      const playheadMs = state.ui.frameSnapEnabled ? snapMsToFrame(raw, state.ui.fps) : raw;
      return {
        ...state,
        ui: {
          ...state.ui,
          playheadMs,
        },
      };
    }

    case 'toggle-play':
      return { ...state, ui: { ...state.ui, isPlaying: !state.ui.isPlaying } };

    case 'set-playing':
      return { ...state, ui: { ...state.ui, isPlaying: action.playing } };

    case 'set-volume':
      return { ...state, ui: { ...state.ui, volume: action.volume } };

    case 'set-zoom':
      return { ...state, ui: { ...state.ui, zoom: Math.min(160, Math.max(20, action.zoom)) } };

    case 'set-editing-mode':
      return { ...state, ui: { ...state.ui, editingMode: action.mode } };

    case 'toggle-ripple':
      return { ...state, ui: { ...state.ui, rippleEnabled: !state.ui.rippleEnabled } };

    case 'toggle-frame-snap':
      return { ...state, ui: { ...state.ui, frameSnapEnabled: !state.ui.frameSnapEnabled } };

    case 'toggle-split-all':
      return { ...state, ui: { ...state.ui, splitAllTracks: !state.ui.splitAllTracks } };

    case 'set-fps':
      return { ...state, ui: { ...state.ui, fps: action.fps } };

    case 'step-playhead': {
      const frameMs = (1000 / state.ui.fps) * (action.large ? 5 : 1);
      const totalDuration = projectDurationMs(state.snapshot.tracks, state.snapshot.duration);
      const next = Math.max(0, Math.min(totalDuration, state.ui.playheadMs + action.direction * frameMs));
      return { ...state, ui: { ...state.ui, playheadMs: Math.round(next) } };
    }

    case 'nudge-selected': {
      const selected = selectedItems(state);
      if (!selected.length) return state;
      const ids = selected.map((i) => i.id);

      const minStart = Math.min(...selected.map((i) => i.startMs));
      const safeDelta = minStart + action.deltaMs < 0 ? -minStart : action.deltaMs;
      if (safeDelta === 0) return state;

      const tracks = state.snapshot.tracks.map((track) => {
        if (track.locked) return track;
        return {
          ...track,
          items: track.items.map((item) => {
            if (!ids.includes(item.id) || item.locked) return item;
            return {
              ...item,
              startMs: Math.max(0, Math.round(item.startMs + safeDelta)),
            };
          }),
        };
      });

      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'copy-selected':
      return {
        ...state,
        clipboard: selectedItems(state).map((item) => structuredClone(item)),
      };

    case 'cut-selected': {
      const selected = selectedItems(state);
      if (!selected.length) return state;
      const ids = selected.map((i) => i.id);
      const clipboard = selected.map((item) => structuredClone(item));

      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.filter((item) => !ids.includes(item.id) || track.locked || item.locked),
      }));

      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        clipboard,
        ui: { ...state.ui, selectedItemId: null, selectedItemIds: [], isSaved: false },
      };
    }

    case 'paste-clips': {
      if (!state.clipboard.length) return state;
      const baseStartMs = Math.min(...state.clipboard.map((item) => item.startMs));
      const targetBaseMs = state.ui.playheadMs;
      const newItems: TimelineItem[] = [];

      const tracks = state.snapshot.tracks.map((track) => {
        const matchingClips = state.clipboard.filter(
          (c) => c.trackId === track.id || (!state.snapshot.tracks.some((t) => t.id === c.trackId) && isCompatibleTrack(track.kind, c.kind)),
        );

        if (!matchingClips.length || track.locked) return track;

        const pastedForTrack = matchingClips.map((clip) => {
          const relativeOffset = clip.startMs - baseStartMs;
          const newItem: TimelineItem = {
            ...clip,
            id: createId(clip.kind),
            trackId: track.id,
            startMs: Math.max(0, Math.round(targetBaseMs + relativeOffset)),
          };
          newItems.push(newItem);
          return newItem;
        });

        return {
          ...track,
          items: [...track.items, ...pastedForTrack],
        };
      });

      if (!newItems.length) return state;

      const newIds = newItems.map((item) => item.id);
      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: {
          ...state.ui,
          selectedItemIds: newIds,
          selectedItemId: newIds.at(-1) ?? null,
        },
      };
    }

    case 'duplicate-selected': {
      const selected = selectedItems(state);
      if (!selected.length) return state;

      const maxEndMs = Math.max(...selected.map((item) => item.startMs + item.durationMs));
      const minStartMs = Math.min(...selected.map((item) => item.startMs));
      const spanMs = Math.max(100, maxEndMs - minStartMs);

      const duplicatedItems: TimelineItem[] = [];
      const tracks = state.snapshot.tracks.map((track) => {
        if (track.locked) return track;
        const trackSelected = selected.filter((item) => item.trackId === track.id && !item.locked);
        if (!trackSelected.length) return track;

        const trackDuplicates = trackSelected.map((item) => {
          const duplicate: TimelineItem = {
            ...item,
            id: createId(item.kind),
            startMs: Math.round(item.startMs + spanMs),
          };
          duplicatedItems.push(duplicate);
          return duplicate;
        });

        return {
          ...track,
          items: [...track.items, ...trackDuplicates],
        };
      });

      if (!duplicatedItems.length) return state;

      const newIds = duplicatedItems.map((item) => item.id);
      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: {
          ...state.ui,
          selectedItemIds: newIds,
          selectedItemId: newIds.at(-1) ?? null,
        },
      };
    }

    case 'split-selected': {
      const splitTimeMs = state.ui.playheadMs;
      const targetIds = state.ui.splitAllTracks ? null : state.ui.selectedItemIds;
      let didSplit = false;

      const tracks = state.snapshot.tracks.map((track) => {
        if (track.locked) return track;
        const nextItems: TimelineItem[] = [];

        for (const item of track.items) {
          if (item.locked) {
            nextItems.push(item);
            continue;
          }
          if (targetIds && !targetIds.includes(item.id)) {
            nextItems.push(item);
            continue;
          }
          if (splitTimeMs <= item.startMs || splitTimeMs >= item.startMs + item.durationMs) {
            nextItems.push(item);
            continue;
          }

          const firstDurationMs = Math.round(splitTimeMs - item.startMs);
          const secondDurationMs = Math.round(item.durationMs - firstDurationMs);
          if (firstDurationMs < MIN_CLIP_DURATION_MS || secondDurationMs < MIN_CLIP_DURATION_MS) {
            nextItems.push(item);
            continue;
          }

          const originalSourceStart = item.sourceStartMs ?? 0;
          const first: TimelineItem = {
            ...item,
            durationMs: firstDurationMs,
            sourceDurationMs: firstDurationMs,
          };

          const second: TimelineItem = {
            ...item,
            id: createId(item.kind),
            startMs: Math.round(splitTimeMs),
            durationMs: secondDurationMs,
            sourceStartMs: originalSourceStart + firstDurationMs,
            sourceDurationMs: secondDurationMs,
          };

          nextItems.push(first, second);
          didSplit = true;
        }

        return { ...track, items: nextItems };
      });

      if (!didSplit) return state;
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'split-clip-at-time': {
      const { itemId, splitTimeMs } = action;
      let didSplit = false;

      const tracks = state.snapshot.tracks.map((track) => {
        if (track.locked) return track;
        const nextItems: TimelineItem[] = [];

        for (const item of track.items) {
          if (item.id !== itemId || item.locked) {
            nextItems.push(item);
            continue;
          }
          if (splitTimeMs <= item.startMs || splitTimeMs >= item.startMs + item.durationMs) {
            nextItems.push(item);
            continue;
          }

          const firstDurationMs = Math.round(splitTimeMs - item.startMs);
          const secondDurationMs = Math.round(item.durationMs - firstDurationMs);
          if (firstDurationMs < MIN_CLIP_DURATION_MS || secondDurationMs < MIN_CLIP_DURATION_MS) {
            nextItems.push(item);
            continue;
          }

          const originalSourceStart = item.sourceStartMs ?? 0;
          const first: TimelineItem = {
            ...item,
            durationMs: firstDurationMs,
            sourceDurationMs: firstDurationMs,
          };

          const second: TimelineItem = {
            ...item,
            id: createId(item.kind),
            startMs: Math.round(splitTimeMs),
            durationMs: secondDurationMs,
            sourceStartMs: originalSourceStart + firstDurationMs,
            sourceDurationMs: secondDurationMs,
          };

          nextItems.push(first, second);
          didSplit = true;
        }

        return { ...track, items: nextItems };
      });

      if (!didSplit) return state;
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'split-all-at-playhead': {
      const splitTimeMs = state.ui.playheadMs;
      let didSplit = false;

      const tracks = state.snapshot.tracks.map((track) => {
        if (track.locked) return track;
        const nextItems: TimelineItem[] = [];

        for (const item of track.items) {
          if (item.locked || splitTimeMs <= item.startMs || splitTimeMs >= item.startMs + item.durationMs) {
            nextItems.push(item);
            continue;
          }

          const firstDurationMs = Math.round(splitTimeMs - item.startMs);
          const secondDurationMs = Math.round(item.durationMs - firstDurationMs);
          if (firstDurationMs < MIN_CLIP_DURATION_MS || secondDurationMs < MIN_CLIP_DURATION_MS) {
            nextItems.push(item);
            continue;
          }

          const originalSourceStart = item.sourceStartMs ?? 0;
          const first: TimelineItem = {
            ...item,
            durationMs: firstDurationMs,
            sourceDurationMs: firstDurationMs,
          };

          const second: TimelineItem = {
            ...item,
            id: createId(item.kind),
            startMs: Math.round(splitTimeMs),
            durationMs: secondDurationMs,
            sourceStartMs: originalSourceStart + firstDurationMs,
            sourceDurationMs: secondDurationMs,
          };

          nextItems.push(first, second);
          didSplit = true;
        }

        return { ...track, items: nextItems };
      });

      if (!didSplit) return state;
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'delete-selected': {
      const ids = state.ui.selectedItemIds.length ? state.ui.selectedItemIds : (state.ui.selectedItemId ? [state.ui.selectedItemId] : []);
      if (!ids.length) return state;

      let deletedCount = 0;
      const tracks = state.snapshot.tracks.map((track) => {
        if (track.locked) return track;
        const filtered = track.items.filter((item) => {
          if (ids.includes(item.id) && !item.locked) {
            deletedCount++;
            return false;
          }
          return true;
        });
        return {
          ...track,
          items: filtered,
        };
      });

      if (deletedCount === 0) return state;

      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: { ...state.ui, selectedItemId: null, selectedItemIds: [], isSaved: false },
      };
    }

    case 'ripple-delete-selected': {
      const ids = state.ui.selectedItemIds.length ? state.ui.selectedItemIds : (state.ui.selectedItemId ? [state.ui.selectedItemId] : []);
      if (!ids.length) return state;

      let deletedCount = 0;
      const tracks = state.snapshot.tracks.map((track) => {
        if (track.locked) return track;
        const toDelete = track.items.filter((item) => ids.includes(item.id) && !item.locked);
        if (!toDelete.length) return track;
        deletedCount += toDelete.length;

        const sortedToDelete = [...toDelete].sort((a, b) => a.startMs - b.startMs);
        let remainingItems = track.items.filter((item) => !ids.includes(item.id) || item.locked);

        for (const deleted of sortedToDelete) {
          remainingItems = rippleShiftItems(remainingItems, deleted.startMs, -deleted.durationMs);
        }

        return {
          ...track,
          items: remainingItems,
        };
      });

      if (deletedCount === 0) return state;

      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: { ...state.ui, selectedItemId: null, selectedItemIds: [], isSaved: false },
      };
    }

    case 'move-item': {
      const current = findItem(state.snapshot.tracks, action.itemId);
      if (!current || current.locked) return state;

      const targetTrackId = action.targetTrackId ?? current.trackId;
      const targetTrack = state.snapshot.tracks.find((t) => t.id === targetTrackId);
      if (!targetTrack || targetTrack.locked) return state;

      if (!isCompatibleTrack(targetTrack.kind, current.kind)) return state;

      const safeStartMs = Math.max(0, Math.round(action.startMs));

      const tracks = state.snapshot.tracks.map((track) => {
        if (track.id === current.trackId && current.trackId === targetTrackId) {
          return {
            ...track,
            items: track.items.map((item) => (item.id === action.itemId ? { ...item, startMs: safeStartMs } : item)),
          };
        }
        if (track.id === current.trackId) {
          return {
            ...track,
            items: track.items.filter((item) => item.id !== action.itemId),
          };
        }
        if (track.id === targetTrackId) {
          const moved: TimelineItem = { ...current, trackId: targetTrackId, startMs: safeStartMs };
          return {
            ...track,
            items: [...track.items, moved],
          };
        }
        return track;
      });

      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'move-items': {
      if (!action.updates.length) return state;
      const updateMap = new Map<string, { startMs: number; targetTrackId?: string }>();
      action.updates.forEach((u) => updateMap.set(u.itemId, { startMs: Math.max(0, Math.round(u.startMs)), targetTrackId: u.targetTrackId }));

      const allItems = state.snapshot.tracks.flatMap((t) => t.items);
      const itemsToMove = allItems.filter((i) => updateMap.has(i.id) && !i.locked);
      if (!itemsToMove.length) return state;

      const tracks = state.snapshot.tracks.map((track) => {
        const stayingItems = track.items
          .filter((item) => {
            const upd = updateMap.get(item.id);
            if (!upd) return true;
            const targetTrackId = upd.targetTrackId ?? item.trackId;
            return targetTrackId === track.id;
          })
          .map((item) => {
            const upd = updateMap.get(item.id);
            if (!upd || item.locked) return item;
            return { ...item, startMs: upd.startMs };
          });

        const incomingItems: TimelineItem[] = [];
        for (const item of itemsToMove) {
          if (item.trackId === track.id) continue;
          const upd = updateMap.get(item.id);
          if (upd && upd.targetTrackId === track.id && isCompatibleTrack(track.kind, item.kind)) {
            incomingItems.push({
              ...item,
              trackId: track.id,
              startMs: upd.startMs,
            });
          }
        }

        return {
          ...track,
          items: [...stayingItems, ...incomingItems],
        };
      });

      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'trim-item': {
      const current = findItem(state.snapshot.tracks, action.itemId);
      if (!current || current.locked) return state;
      const track = state.snapshot.tracks.find((t) => t.id === current.trackId);
      if (!track || track.locked) return state;

      const mediaAsset = current.mediaId
        ? state.snapshot.media.find((m) => m.id === current.mediaId)
        : undefined;
      const mediaMaxDurationMs = mediaAsset?.durationMs;

      let nextStartMs = current.startMs;
      let nextDurationMs = current.durationMs;
      let nextSourceStartMs = current.sourceStartMs ?? 0;
      let nextSourceDurationMs = current.sourceDurationMs ?? current.durationMs;
      let durationChangeMs = 0;

      if (action.edge === 'start') {
        let clampedDelta = action.deltaMs;
        if (nextSourceStartMs + clampedDelta < 0) {
          clampedDelta = -nextSourceStartMs;
        }
        if (current.durationMs - clampedDelta < MIN_CLIP_DURATION_MS) {
          clampedDelta = current.durationMs - MIN_CLIP_DURATION_MS;
        }
        if (current.startMs + clampedDelta < 0) {
          clampedDelta = -current.startMs;
        }

        nextStartMs = Math.round(current.startMs + clampedDelta);
        nextDurationMs = Math.round(current.durationMs - clampedDelta);
        nextSourceStartMs = Math.round(nextSourceStartMs + clampedDelta);
        nextSourceDurationMs = nextDurationMs;
        durationChangeMs = -clampedDelta;
      } else {
        let clampedDelta = action.deltaMs;
        if (current.durationMs + clampedDelta < MIN_CLIP_DURATION_MS) {
          clampedDelta = MIN_CLIP_DURATION_MS - current.durationMs;
        }
        if (mediaMaxDurationMs && nextSourceStartMs + current.durationMs + clampedDelta > mediaMaxDurationMs) {
          clampedDelta = mediaMaxDurationMs - (nextSourceStartMs + current.durationMs);
        }

        nextDurationMs = Math.max(MIN_CLIP_DURATION_MS, Math.round(current.durationMs + clampedDelta));
        nextSourceDurationMs = nextDurationMs;
        durationChangeMs = nextDurationMs - current.durationMs;
      }

      const tracks = state.snapshot.tracks.map((t) => {
        if (t.id !== current.trackId) return t;

        let items = t.items.map((item) => {
          if (item.id !== action.itemId) return item;
          return {
            ...item,
            startMs: nextStartMs,
            durationMs: nextDurationMs,
            sourceStartMs: nextSourceStartMs,
            sourceDurationMs: nextSourceDurationMs,
          };
        });

        if (state.ui.rippleEnabled && durationChangeMs !== 0) {
          const cutoff = action.edge === 'start' ? current.startMs : current.startMs + current.durationMs;
          items = rippleShiftItems(items, cutoff, durationChangeMs, [action.itemId]);
        }

        return { ...t, items };
      });

      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'replace-media': {
      const current = findItem(state.snapshot.tracks, action.itemId);
      if (!current) return state;
      const asset = action.asset;

      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => {
          if (item.id !== action.itemId) return item;
          return {
            ...item,
            mediaId: asset.id,
            name: asset.name.replace(/\.[^.]+$/, ''),
            sourceStartMs: 0,
            sourceDurationMs: item.durationMs,
          };
        }),
      }));

      const media = state.snapshot.media.some((m) => m.id === asset.id)
        ? state.snapshot.media
        : [asset, ...state.snapshot.media];

      return pushHistory(state, { ...state.snapshot, tracks, media });
    }

    case 'update-item': {
      const current = findItem(state.snapshot.tracks, action.itemId);
      if (!current) return state;
      const targetTrackId = action.patch.trackId ?? current.trackId;

      const tracks = state.snapshot.tracks.map((track) => {
        if (track.id === current.trackId && current.trackId === targetTrackId) {
          return {
            ...track,
            items: track.items.map((item) => {
              if (item.id !== action.itemId) return item;
              return {
                ...item,
                ...action.patch,
                startMs: action.patch.startMs !== undefined ? Math.max(0, Math.round(action.patch.startMs)) : item.startMs,
                durationMs: action.patch.durationMs !== undefined ? Math.max(MIN_CLIP_DURATION_MS, Math.round(action.patch.durationMs)) : item.durationMs,
              } as TimelineItem;
            }),
          };
        }
        if (track.id === current.trackId) {
          return {
            ...track,
            items: track.items.filter((item) => item.id !== action.itemId),
          };
        }
        if (track.id === targetTrackId) {
          const updated = {
            ...current,
            ...action.patch,
            trackId: targetTrackId,
            startMs: action.patch.startMs !== undefined ? Math.max(0, Math.round(action.patch.startMs)) : current.startMs,
            durationMs: action.patch.durationMs !== undefined ? Math.max(MIN_CLIP_DURATION_MS, Math.round(action.patch.durationMs)) : current.durationMs,
          } as TimelineItem;
          return {
            ...track,
            items: [...track.items, updated],
          };
        }
        return track;
      });

      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'add-text': {
      let tracks = [...state.snapshot.tracks];
      let track = tracks.find((t) => t.kind === 'text');
      if (!track) {
        track = {
          id: createId('track-text'),
          kind: 'text',
          name: 'Text 1',
          locked: false,
          muted: false,
          hidden: false,
          items: [],
        };
        tracks.push(track);
      }

      const item: TextLayer = {
        id: createId('text'),
        trackId: track.id,
        kind: 'text',
        name: action.preset?.name ?? 'Text Layer',
        startMs: state.ui.playheadMs,
        durationMs: 3000,
        text: action.preset?.text ?? 'New Title',
        fontFamily: action.preset?.fontFamily ?? 'Inter',
        fontSize: action.preset?.fontSize ?? 48,
        fontWeight: action.preset?.fontWeight ?? 600,
        fontStyle: action.preset?.fontStyle ?? 'normal',
        align: action.preset?.align ?? 'center',
        color: action.preset?.color ?? '#F4F6FB',
        opacity: action.preset?.opacity ?? 100,
        letterSpacing: action.preset?.letterSpacing ?? 0,
        lineHeight: action.preset?.lineHeight ?? 1.2,
        positionX: action.preset?.positionX ?? 0,
        positionY: action.preset?.positionY ?? 0,
        width: action.preset?.width,
        height: action.preset?.height,
        rotation: action.preset?.rotation ?? 0,
        scale: action.preset?.scale ?? 100,
        strokeColor: action.preset?.strokeColor,
        strokeWidth: action.preset?.strokeWidth ?? 0,
        shadowColor: action.preset?.shadowColor,
        shadowBlur: action.preset?.shadowBlur ?? 0,
        backgroundColor: action.preset?.backgroundColor,
        backgroundOpacity: action.preset?.backgroundOpacity ?? 0,
        padding: action.preset?.padding ?? 0,
        borderRadius: action.preset?.borderRadius ?? 0,
        animation: action.preset?.animation ?? 'none',
      };

      tracks = tracks.map((t) => (t.id === track!.id ? { ...t, items: [...t.items, item] } : t));
      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: { ...state.ui, selectedItemId: item.id, selectedItemIds: [item.id], activeLeftPanel: 'text', isSaved: false },
      };
    }

    case 'add-caption': {
      let tracks = [...state.snapshot.tracks];
      let track = tracks.find((t) => t.kind === 'caption');
      if (!track) {
        track = {
          id: createId('track-caption'),
          kind: 'caption',
          name: 'Captions',
          locked: false,
          muted: false,
          hidden: false,
          items: [],
        };
        tracks.push(track);
      }

      const item: Caption = {
        id: createId('cap'),
        trackId: track.id,
        kind: 'caption',
        name: action.caption?.name ?? 'Caption',
        startMs: action.caption?.startMs ?? state.ui.playheadMs,
        durationMs: action.caption?.durationMs ?? 2500,
        text: action.caption?.text ?? 'New caption text',
        style: action.caption?.style ?? 'boxed',
        position: action.caption?.position ?? 'bottom',
        speaker: action.caption?.speaker,
        language: action.caption?.language,
        fontSize: action.caption?.fontSize ?? 20,
        color: action.caption?.color ?? '#ffffff',
        backgroundColor: action.caption?.backgroundColor,
      };

      tracks = tracks.map((t) => (t.id === track!.id ? { ...t, items: [...t.items, item] } : t));
      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: { ...state.ui, selectedItemId: item.id, selectedItemIds: [item.id], activeLeftPanel: 'captions', isSaved: false },
      };
    }

    case 'import-captions': {
      if (!action.captions.length) return state;
      let tracks = [...state.snapshot.tracks];
      let track = tracks.find((t) => t.kind === 'caption');
      if (!track) {
        track = {
          id: createId('track-caption'),
          kind: 'caption',
          name: 'Captions',
          locked: false,
          muted: false,
          hidden: false,
          items: [],
        };
        tracks.push(track);
      }

      const targetTrackId = track.id;
      const imported = action.captions.map((c) => ({
        ...c,
        id: createId('cap'),
        trackId: targetTrackId,
      }));

      tracks = tracks.map((t) => (t.id === targetTrackId ? { ...t, items: [...t.items, ...imported] } : t));
      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: { ...state.ui, activeLeftPanel: 'captions', isSaved: false },
      };
    }

    case 'add-media': {
      const asset = action.asset;
      const kind = asset.type === 'audio' ? 'audio' : 'video';
      let tracks = [...state.snapshot.tracks];
      let track = tracks.find((t) => t.kind === kind);
      if (!track) {
        track = {
          id: createId(`track-${kind}`),
          kind,
          name: `${kind === 'video' ? 'Video' : 'Audio'} 1`,
          locked: false,
          muted: false,
          hidden: false,
          items: [],
        };
        tracks.push(track);
      }

      const durationMs = asset.durationMs ?? (asset.type === 'image' ? 4000 : 8000);
      const item: VideoClip | AudioClip =
        kind === 'audio'
          ? {
              id: createId('audio'),
              trackId: track.id,
              kind: 'audio',
              name: asset.name,
              startMs: state.ui.playheadMs,
              durationMs,
              mediaId: asset.id,
              volume: 100,
              fadeInMs: 0,
              fadeOutMs: 0,
              speed: 1,
              sourceStartMs: 0,
              sourceDurationMs: durationMs,
            }
          : {
              id: createId('video'),
              trackId: track.id,
              kind: 'video',
              name: asset.name.replace(/\.[^.]+$/, ''),
              startMs: state.ui.playheadMs,
              durationMs,
              mediaId: asset.id,
              thumbnailColor: asset.thumbnailColor,
              positionX: 0,
              positionY: 0,
              scale: 100,
              rotation: 0,
              opacity: 100,
              speed: 1,
              sourceStartMs: 0,
              sourceDurationMs: durationMs,
            };

      tracks = tracks.map((t) => (t.id === track!.id ? { ...t, items: [...t.items, item] } : t));
      const media = state.snapshot.media.some((m) => m.id === asset.id)
        ? state.snapshot.media
        : [asset, ...state.snapshot.media];
      return {
        ...pushHistory(state, { ...state.snapshot, tracks, media }),
        ui: { ...state.ui, selectedItemId: item.id, selectedItemIds: [item.id], activeLeftPanel: 'media', isSaved: false },
      };
    }

    case 'add-track': {
      const count = state.snapshot.tracks.filter((track) => track.kind === action.kind).length + 1;
      const track: TimelineTrack = {
        id: createId(`track-${action.kind}`),
        kind: action.kind,
        name: `${action.kind[0].toUpperCase() + action.kind.slice(1)} ${count}`,
        locked: false,
        muted: false,
        hidden: false,
        items: [],
      };
      return pushHistory(state, { ...state.snapshot, tracks: [...state.snapshot.tracks, track] });
    }

    case 'update-track': {
      const tracks = state.snapshot.tracks.map((track) => (track.id === action.trackId ? { ...track, ...action.patch } : track));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'toggle-track-solo': {
      const targetTrack = state.snapshot.tracks.find((t) => t.id === action.trackId);
      if (!targetTrack) return state;
      const nextSolo = !targetTrack.solo;

      const tracks = state.snapshot.tracks.map((t) => {
        if (t.id === action.trackId) {
          return { ...t, solo: nextSolo, muted: false };
        }
        return {
          ...t,
          muted: nextSolo ? true : false,
          solo: false,
        };
      });

      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'set-track-volume': {
      const tracks = state.snapshot.tracks.map((t) =>
        t.id === action.trackId ? { ...t, volume: Math.max(0, Math.min(200, action.volume)) } : t,
      );
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'delete-track': {
      const track = state.snapshot.tracks.find((item) => item.id === action.trackId);
      if (!track || track.items.length > 0) return state;
      return pushHistory(state, { ...state.snapshot, tracks: state.snapshot.tracks.filter((item) => item.id !== action.trackId) });
    }

    // Effect Stack Actions
    case 'add-effect': {
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => {
          if (item.id !== action.itemId) return item;
          const currentEffects = item.effects ?? [];
          return {
            ...item,
            effects: [...currentEffects, action.effect],
          };
        }),
      }));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'update-effect': {
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => {
          if (item.id !== action.itemId || !item.effects) return item;
          return {
            ...item,
            effects: item.effects.map((eff) =>
              eff.id === action.effectId ? { ...eff, ...action.patch } : eff,
            ),
          };
        }),
      }));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'remove-effect': {
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => {
          if (item.id !== action.itemId || !item.effects) return item;
          return {
            ...item,
            effects: item.effects.filter((eff) => eff.id !== action.effectId),
          };
        }),
      }));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'reset-effects': {
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => (item.id === action.itemId ? { ...item, effects: [] } : item)),
      }));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'apply-filter-preset': {
      const presetEffects = getFilterEffects(action.preset);
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => (item.id === action.itemId ? { ...item, effects: presetEffects } : item)),
      }));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    // Keyframe Animation Actions
    case 'add-keyframe': {
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => {
          if (item.id !== action.itemId) return item;
          const existing = item.keyframes ?? [];
          // Replace if exists at same property and time
          const filtered = existing.filter(
            (k) => !(k.property === action.keyframe.property && Math.abs(k.timeMs - action.keyframe.timeMs) < 20),
          );
          return {
            ...item,
            keyframes: [...filtered, action.keyframe].sort((a, b) => a.timeMs - b.timeMs),
          };
        }),
      }));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'update-keyframe': {
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => {
          if (item.id !== action.itemId || !item.keyframes) return item;
          return {
            ...item,
            keyframes: item.keyframes.map((k) =>
              k.id === action.keyframeId ? { ...k, ...action.patch } : k,
            ).sort((a, b) => a.timeMs - b.timeMs),
          };
        }),
      }));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'remove-keyframe': {
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.map((item) => {
          if (item.id !== action.itemId || !item.keyframes) return item;
          return {
            ...item,
            keyframes: item.keyframes.filter((k) => k.id !== action.keyframeId),
          };
        }),
      }));
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    // Transitions
    case 'add-transition': {
      const tracks = state.snapshot.tracks.map((t) => {
        if (t.id !== action.trackId) return t;
        const transitions = t.transitions ?? [];
        return {
          ...t,
          transitions: [...transitions.filter((tr) => tr.afterClipId !== action.transition.afterClipId), action.transition],
        };
      });
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    case 'remove-transition': {
      const tracks = state.snapshot.tracks.map((t) => {
        if (t.id !== action.trackId || !t.transitions) return t;
        return {
          ...t,
          transitions: t.transitions.filter((tr) => tr.id !== action.transitionId),
        };
      });
      return pushHistory(state, { ...state.snapshot, tracks });
    }

    // Export Jobs
    case 'start-export':
      return {
        ...state,
        exportJobs: [action.job, ...state.exportJobs],
      };

    case 'update-export-job':
      return {
        ...state,
        exportJobs: state.exportJobs.map((job) =>
          job.id === action.jobId ? { ...job, ...action.patch } : job,
        ),
      };

    case 'cancel-export':
      return {
        ...state,
        exportJobs: state.exportJobs.map((job) =>
          job.id === action.jobId ? { ...job, status: 'failed', error: 'Cancelled by user' } : job,
        ),
      };

    case 'set-panel':
      return { ...state, ui: { ...state.ui, activeLeftPanel: action.panel } };

    case 'rename':
      return pushHistory(state, { ...state.snapshot, name: action.name });

    case 'undo': {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      const nextSelection = firstItemId(previous.tracks);
      return {
        ...state,
        snapshot: previous,
        past: state.past.slice(0, -1),
        future: [cloneSnapshot(state.snapshot), ...state.future],
        ui: {
          ...state.ui,
          selectedItemId: nextSelection,
          selectedItemIds: nextSelection ? [nextSelection] : [],
          isSaved: false,
          isPlaying: false,
        },
      };
    }

    case 'redo': {
      const next = state.future[0];
      if (!next) return state;
      const nextSelection = firstItemId(next.tracks);
      return {
        ...state,
        snapshot: next,
        past: [...state.past, cloneSnapshot(state.snapshot)],
        future: state.future.slice(1),
        ui: {
          ...state.ui,
          selectedItemId: nextSelection,
          selectedItemIds: nextSelection ? [nextSelection] : [],
          isSaved: false,
          isPlaying: false,
        },
      };
    }

    case 'mark-saved':
      return { ...state, ui: { ...state.ui, isSaved: true } };

    default:
      return state;
  }
}

export function createInitialEditorState(): EditorState {
  return {
    projectId: '',
    aspectRatio: '16:9',
    snapshot: { name: 'Untitled', duration: 30, tracks: [], media: [] },
    past: [],
    future: [],
    clipboard: [],
    exportJobs: [],
    ui: {
      selectedItemId: null,
      selectedItemIds: [],
      playheadMs: 0,
      isPlaying: false,
      volume: 80,
      zoom: 48,
      activeLeftPanel: 'media',
      isSaved: true,
      editingMode: 'select',
      rippleEnabled: false,
      frameSnapEnabled: true,
      splitAllTracks: false,
      fps: 30,
    },
  };
}
