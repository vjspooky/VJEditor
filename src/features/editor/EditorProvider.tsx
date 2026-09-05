import { projectService } from '@/services/projectService';
import { findItem, projectDurationMs } from '@/utils/timeline';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  createInitialEditorState,
  editorReducer,
  type EditorAction,
  type EditorState,
  type LeftPanelId,
} from '@/features/editor/editorReducer';
import type { MediaAsset, TimelineItem } from '@/types';

interface EditorContextValue {
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  selected: TimelineItem | undefined;
  durationMs: number;
  save: () => void;
  addUploadedFiles: (files: FileList | File[]) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialEditorState);

  useEffect(() => {
    const stored = projectService.get(projectId);
    if (!stored) return;
    dispatch({
      type: 'load',
      projectId: stored.project.id,
      aspectRatio: stored.project.aspectRatio,
      snapshot: {
        name: stored.project.name,
        duration: stored.project.duration,
        tracks: stored.tracks,
        media: stored.media,
      },
    });
  }, [projectId]);

  const durationMs = projectDurationMs(state.snapshot.tracks, state.snapshot.duration);
  const selected = findItem(state.snapshot.tracks, state.ui.selectedItemId);

  const save = useCallback(() => {
    const stored = projectService.get(state.projectId) ?? projectService.get(projectId);
    if (!stored) return;

    const nextStored = {
      ...stored,
      project: {
        ...stored.project,
        name: state.snapshot.name,
        duration: Math.round(durationMs / 1000),
        updatedAt: new Date().toISOString(),
      },
      tracks: state.snapshot.tracks,
      media: state.snapshot.media,
    };

    projectService.save(nextStored);
    dispatch({ type: 'mark-saved' });
  }, [durationMs, projectId, state.projectId, state.snapshot]);

  const addUploadedFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    for (const file of list) {
      const type = file.type.startsWith('audio')
        ? 'audio'
        : file.type.startsWith('image')
          ? 'image'
          : 'video';
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        thumbnailColor: type === 'audio' ? '#1f4a3c' : type === 'image' ? '#2a3f66' : '#1e3a5f',
        src: URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'add-media', asset });
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (event.code === 'Space' && !typing) {
        event.preventDefault();
        dispatch({ type: 'toggle-play' });
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && !typing) {
        event.preventDefault();
        dispatch({ type: 'delete-selected' });
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? 'redo' : 'undo' });
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        dispatch({ type: 'redo' });
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const value = useMemo(
    () => ({ state, dispatch, selected, durationMs, save, addUploadedFiles }),
    [addUploadedFiles, dispatch, durationMs, save, selected, state],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}

export type { LeftPanelId };
