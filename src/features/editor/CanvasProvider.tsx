import { editorService, defaultElement } from '@/services/editorService';
import type { AspectRatio, MediaType } from '@/types';
import type { CanvasElement, CanvasSettings, EditorCanvasState } from '@/features/editor/canvasTypes';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { createId } from '@/utils/id';

interface HistoryState {
  present: EditorCanvasState;
  past: EditorCanvasState[];
  future: EditorCanvasState[];
}

type CanvasAction =
  | { type: 'select'; id: string | null }
  | { type: 'add'; mediaId: string; mediaType: Extract<MediaType, 'video' | 'image'> }
  | { type: 'update'; id: string; patch: Partial<CanvasElement> }
  | { type: 'delete'; id?: string }
  | { type: 'duplicate'; id?: string }
  | { type: 'settings'; patch: Partial<CanvasSettings> }
  | { type: 'layer'; id: string; direction: 'forward' | 'backward' | 'front' | 'back' }
  | { type: 'undo' }
  | { type: 'redo' };
type LayerDirection = 'forward' | 'backward' | 'front' | 'back';

interface CanvasContextValue {
  state: EditorCanvasState;
  selected: CanvasElement | undefined;
  addMedia: (mediaId: string, mediaType: Extract<MediaType, 'video' | 'image'>) => void;
  select: (id: string | null) => void;
  update: (id: string, patch: Partial<CanvasElement>) => void;
  remove: (id?: string) => void;
  duplicate: () => void;
  updateSettings: (patch: Partial<CanvasSettings>) => void;
  changeLayer: (direction: LayerDirection) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);
const MAX_HISTORY = 50;

function cloneState(state: EditorCanvasState): EditorCanvasState {
  return structuredClone(state);
}

function withHistory(state: HistoryState, present: EditorCanvasState): HistoryState {
  return { present, past: [...state.past.slice(-(MAX_HISTORY - 1)), cloneState(state.present)], future: [] };
}

function reducer(state: HistoryState, action: CanvasAction): HistoryState {
  const selectedId = state.present.selectedElementId;
  if (action.type === 'select') return { ...state, present: { ...state.present, selectedElementId: action.id } };
  if (action.type === 'undo') {
    const previous = state.past.at(-1);
    return previous ? { present: previous, past: state.past.slice(0, -1), future: [cloneState(state.present), ...state.future] } : state;
  }
  if (action.type === 'redo') {
    const next = state.future[0];
    return next ? { present: next, past: [...state.past, cloneState(state.present)], future: state.future.slice(1) } : state;
  }
  if (action.type === 'add') {
    const element = defaultElement(action.mediaId, action.mediaType, state.present.canvas, state.present.elements.length);
    return withHistory(state, { ...state.present, elements: [...state.present.elements, element], selectedElementId: element.id });
  }
  if (action.type === 'update') {
    return withHistory(state, { ...state.present, elements: state.present.elements.map((item) => item.id === action.id ? { ...item, ...action.patch } : item) });
  }
  if (action.type === 'delete') {
    const id = action.id ?? selectedId;
    if (!id) return state;
    return withHistory(state, { ...state.present, elements: state.present.elements.filter((item) => item.id !== id), selectedElementId: selectedId === id ? null : selectedId });
  }
  if (action.type === 'duplicate') {
    const source = state.present.elements.find((item) => item.id === (action.id ?? selectedId));
    if (!source) return state;
    const copy = { ...source, id: createId('element'), x: source.x + 20, y: source.y + 20 };
    return withHistory(state, { ...state.present, elements: [...state.present.elements, copy], selectedElementId: copy.id });
  }
  if (action.type === 'settings') {
    const nextCanvas = { ...state.present.canvas, ...action.patch };
    return withHistory(state, { ...state.present, canvas: nextCanvas });
  }
  if (action.type === 'layer') {
    const index = state.present.elements.findIndex((item) => item.id === action.id);
    if (index < 0) return state;
    const next = [...state.present.elements];
    const target = action.direction === 'front' ? next.length - 1 : action.direction === 'back' ? 0 : action.direction === 'forward' ? Math.min(next.length - 1, index + 1) : Math.max(0, index - 1);
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    return withHistory(state, { ...state.present, elements: next });
  }
  return state;
}

export function CanvasProvider({ projectId, aspectRatio, children }: { projectId: string; aspectRatio: string; children: ReactNode }) {
  const initial = useMemo(() => editorService.get(projectId, aspectRatio as AspectRatio), [projectId, aspectRatio]);
  const [history, dispatch] = useReducer(reducer, {
    present: { projectId, canvas: initial.canvas, elements: initial.elements, selectedElementId: null },
    past: [],
    future: [],
  });

  useEffect(() => {
    const handle = window.setTimeout(() => editorService.save({ projectId: history.present.projectId, canvas: history.present.canvas, elements: history.present.elements }), 500);
    return () => window.clearTimeout(handle);
  }, [history.present]);

  const addMedia = useCallback((mediaId: string, mediaType: Extract<MediaType, 'video' | 'image'>) => dispatch({ type: 'add', mediaId, mediaType }), []);
  const select = useCallback((id: string | null) => dispatch({ type: 'select', id }), []);
  const update = useCallback((id: string, patch: Partial<CanvasElement>) => dispatch({ type: 'update', id, patch }), []);
  const remove = useCallback((id?: string) => dispatch({ type: 'delete', id }), []);
  const duplicate = useCallback(() => dispatch({ type: 'duplicate' }), []);
  const updateSettings = useCallback((patch: Partial<CanvasSettings>) => dispatch({ type: 'settings', patch }), []);
  const changeLayer = useCallback((direction: LayerDirection) => { if (history.present.selectedElementId) dispatch({ type: 'layer', id: history.present.selectedElementId, direction }); }, [history.present.selectedElementId]);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const selected = history.present.elements.find((item) => item.id === history.present.selectedElementId);
  const value = useMemo(() => ({ state: history.present, selected, addMedia, select, update, remove, duplicate, updateSettings, changeLayer, undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0 }), [history, selected, addMedia, select, update, remove, duplicate, updateSettings, changeLayer, undo, redo]);
  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext);
  if (!context) throw new Error('useCanvas must be used inside CanvasProvider');
  return context;
}
