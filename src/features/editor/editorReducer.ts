import type {
  AudioClip,
  Caption,
  MediaAsset,
  TextLayer,
  TimelineItem,
  TimelineTrack,
  VideoClip,
} from '@/types';
import { createId } from '@/utils/id';
import { cloneTracks, findItem } from '@/utils/timeline';

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
  playheadMs: number;
  isPlaying: boolean;
  volume: number;
  zoom: number;
  activeLeftPanel: LeftPanelId;
  isSaved: boolean;
}

export interface EditorState {
  projectId: string;
  aspectRatio: string;
  snapshot: EditorSnapshot;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  ui: EditorUiState;
}

export type EditorAction =
  | { type: 'load'; projectId: string; aspectRatio: string; snapshot: EditorSnapshot }
  | { type: 'select'; itemId: string | null }
  | { type: 'set-playhead'; ms: number }
  | { type: 'toggle-play' }
  | { type: 'set-playing'; playing: boolean }
  | { type: 'set-volume'; volume: number }
  | { type: 'set-zoom'; zoom: number }
  | { type: 'set-panel'; panel: LeftPanelId }
  | { type: 'rename'; name: string }
  | { type: 'move-item'; itemId: string; startMs: number }
  | { type: 'trim-item'; itemId: string; edge: 'start' | 'end'; deltaMs: number }
  | { type: 'update-item'; itemId: string; patch: Partial<TimelineItem> }
  | {
      type: 'add-text';
      preset?: { name: string; text: string; fontSize: number; fontWeight: number };
    }
  | { type: 'add-caption' }
  | { type: 'add-media'; asset: MediaAsset }
  | { type: 'delete-selected' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'mark-saved' };

const MAX_HISTORY = 50;

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

function mapItem(
  tracks: TimelineTrack[],
  itemId: string,
  mapper: (item: TimelineItem) => TimelineItem,
): TimelineTrack[] {
  return tracks.map((track) => ({
    ...track,
    items: track.items.map((item) => (item.id === itemId ? mapper(item) : item)),
  }));
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
        ui: {
          selectedItemId: firstItemId(action.snapshot.tracks),
          playheadMs: 0,
          isPlaying: false,
          volume: 80,
          zoom: 48,
          activeLeftPanel: 'media',
          isSaved: true,
        },
      };
    case 'select':
      return { ...state, ui: { ...state.ui, selectedItemId: action.itemId } };
    case 'set-playhead':
      return { ...state, ui: { ...state.ui, playheadMs: Math.max(0, action.ms) } };
    case 'toggle-play':
      return { ...state, ui: { ...state.ui, isPlaying: !state.ui.isPlaying } };
    case 'set-playing':
      return { ...state, ui: { ...state.ui, isPlaying: action.playing } };
    case 'set-volume':
      return { ...state, ui: { ...state.ui, volume: action.volume } };
    case 'set-zoom':
      return { ...state, ui: { ...state.ui, zoom: Math.min(160, Math.max(20, action.zoom)) } };
    case 'set-panel':
      return { ...state, ui: { ...state.ui, activeLeftPanel: action.panel } };
    case 'rename':
      return pushHistory(state, { ...state.snapshot, name: action.name });
    case 'move-item': {
      const current = findItem(state.snapshot.tracks, action.itemId);
      if (!current) return state;
      const tracks = mapItem(state.snapshot.tracks, action.itemId, (item) => ({
        ...item,
        startMs: Math.max(0, Math.round(action.startMs)),
        id: item.id,
        trackId: item.trackId,
        kind: item.kind,
      }) as TimelineItem);
      return pushHistory(state, { ...state.snapshot, tracks });
    }
    case 'trim-item': {
      const current = findItem(state.snapshot.tracks, action.itemId);
      if (!current) return state;
      const minimumDurationMs = 100;
      const tracks = mapItem(state.snapshot.tracks, action.itemId, (item) => {
        if (action.edge === 'start') {
          const nextStartMs = Math.max(
            0,
            Math.min(
              item.startMs + item.durationMs - minimumDurationMs,
              item.startMs + action.deltaMs,
            ),
          );
          return {
            ...item,
            startMs: Math.round(nextStartMs),
            durationMs: Math.round(item.durationMs + item.startMs - nextStartMs),
            id: item.id,
            trackId: item.trackId,
            kind: item.kind,
          } as TimelineItem;
        }
        return {
          ...item,
          durationMs: Math.max(minimumDurationMs, Math.round(item.durationMs + action.deltaMs)),
          id: item.id,
          trackId: item.trackId,
          kind: item.kind,
        } as TimelineItem;
      });
      return pushHistory(state, { ...state.snapshot, tracks });
    }
    case 'update-item': {
      const current = findItem(state.snapshot.tracks, action.itemId);
      if (!current) return state;
      const tracks = mapItem(state.snapshot.tracks, action.itemId, (item) => ({
        ...item,
        ...action.patch,
        startMs:
          action.patch.startMs === undefined
            ? item.startMs
            : Math.max(0, Math.round(action.patch.startMs)),
        durationMs:
          action.patch.durationMs === undefined
            ? item.durationMs
            : Math.max(100, Math.round(action.patch.durationMs)),
        id: item.id,
        trackId: item.trackId,
        kind: item.kind,
      }) as TimelineItem);
      return pushHistory(state, { ...state.snapshot, tracks });
    }
    case 'add-text': {
      const track = state.snapshot.tracks.find((t) => t.kind === 'text');
      if (!track) return state;
      const item: TextLayer = {
        id: createId('text'),
        trackId: track.id,
        kind: 'text',
        name: action.preset?.name ?? 'Text',
        startMs: state.ui.playheadMs,
        durationMs: 3000,
        text: action.preset?.text ?? 'New title',
        fontFamily: 'Inter',
        fontSize: action.preset?.fontSize ?? 48,
        fontWeight: action.preset?.fontWeight ?? 600,
        align: 'center',
        color: '#F4F6FB',
        positionX: 0,
        positionY: 0,
        animation: 'none',
      };
      const tracks = addToTrack(state.snapshot.tracks, track.id, item);
      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: { ...state.ui, selectedItemId: item.id, activeLeftPanel: 'text', isSaved: false },
      };
    }
    case 'add-caption': {
      const track = state.snapshot.tracks.find((t) => t.kind === 'caption');
      if (!track) return state;
      const item: Caption = {
        id: createId('cap'),
        trackId: track.id,
        kind: 'caption',
        name: 'Caption',
        startMs: state.ui.playheadMs,
        durationMs: 2500,
        text: 'New caption',
        style: 'boxed',
      };
      const tracks = addToTrack(state.snapshot.tracks, track.id, item);
      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: { ...state.ui, selectedItemId: item.id, activeLeftPanel: 'captions', isSaved: false },
      };
    }
    case 'add-media': {
      const asset = action.asset;
      const kind = asset.type === 'audio' ? 'audio' : 'video';
      const track = state.snapshot.tracks.find((t) => t.kind === kind);
      if (!track) return state;
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
            };
      const tracks = addToTrack(state.snapshot.tracks, track.id, item);
      const media = state.snapshot.media.some((m) => m.id === asset.id)
        ? state.snapshot.media
        : [asset, ...state.snapshot.media];
      return {
        ...pushHistory(state, { ...state.snapshot, tracks, media }),
        ui: { ...state.ui, selectedItemId: item.id, activeLeftPanel: 'media', isSaved: false },
      };
    }
    case 'delete-selected': {
      const id = state.ui.selectedItemId;
      if (!id) return state;
      const tracks = state.snapshot.tracks.map((track) => ({
        ...track,
        items: track.items.filter((item) => item.id !== id),
      }));
      return {
        ...pushHistory(state, { ...state.snapshot, tracks }),
        ui: { ...state.ui, selectedItemId: null, isSaved: false },
      };
    }
    case 'undo': {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      const nextSelection = firstItemId(previous.tracks);
      return {
        ...state,
        snapshot: previous,
        past: state.past.slice(0, -1),
        future: [cloneSnapshot(state.snapshot), ...state.future],
        ui: { ...state.ui, selectedItemId: nextSelection, isSaved: false, isPlaying: false },
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
        ui: { ...state.ui, selectedItemId: nextSelection, isSaved: false, isPlaying: false },
      };
    }
    case 'mark-saved':
      return { ...state, ui: { ...state.ui, isSaved: true } };
  }
}

function addToTrack(
  tracks: TimelineTrack[],
  trackId: string,
  item: TimelineItem,
): TimelineTrack[] {
  return tracks.map((track) =>
    track.id === trackId ? { ...track, items: [...track.items, item] } : track,
  );
}

function firstItemId(tracks: TimelineTrack[]): string | null {
  return tracks.find((t) => t.items.length > 0)?.items[0]?.id ?? null;
}

export function createInitialEditorState(): EditorState {
  return {
    projectId: '',
    aspectRatio: '16:9',
    snapshot: { name: 'Untitled', duration: 30, tracks: [], media: [] },
    past: [],
    future: [],
    ui: {
      selectedItemId: null,
      playheadMs: 0,
      isPlaying: false,
      volume: 80,
      zoom: 48,
      activeLeftPanel: 'media',
      isSaved: true,
    },
  };
}
