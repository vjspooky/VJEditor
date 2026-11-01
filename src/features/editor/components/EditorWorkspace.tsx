import { AiToolsPanel } from '@/features/editor/components/AiToolsPanel';
import { CanvasProvider, useCanvas } from '@/features/editor/CanvasProvider';
import { AudioPanel } from '@/features/editor/components/AudioPanel';
import { CaptionsPanel as CaptionsPanelFull } from '@/features/editor/components/CaptionsPanel';
import { PlaceholderPanel } from '@/features/editor/components/UtilityPanels';
import { EffectsPanel } from '@/features/editor/components/EffectsPanel';
import { TransitionsPanel } from '@/features/editor/components/TransitionsPanel';
import { EditorTopBar } from '@/features/editor/components/EditorTopBar';
import { MediaPanel } from '@/features/editor/components/MediaPanel';
import { CanvasPreview } from '@/features/editor/components/CanvasPreview';
import { CanvasProperties } from '@/features/editor/components/CanvasProperties';
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel';
import { TextPanel } from '@/features/editor/components/TextPanel';
import { Timeline } from '@/features/editor/components/Timeline';
import { useEditor, type LeftPanelId } from '@/features/editor/EditorProvider';
import { cx } from '@/utils/cx';
import {
  Blend,
  Captions,
  Clapperboard,
  Image,
  LayoutTemplate,
  Mic2,
  SlidersHorizontal,
  Sparkles,
  Type,
  Volume2,
  WandSparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const categoryTabs: { id: LeftPanelId; label: string; icon: typeof Image }[] = [
  { id: 'media', label: 'Media', icon: Image },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'captions', label: 'Captions', icon: Captions },
  { id: 'transitions', label: 'Transitions', icon: Blend },
  { id: 'effects', label: 'Effects', icon: WandSparkles },
  { id: 'filters', label: 'Filters', icon: Sparkles },
  { id: 'ai', label: 'AI Tools', icon: Clapperboard },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
];

export function EditorWorkspace() {
  const { state } = useEditor();
  return (
    <CanvasProvider projectId={state.projectId} aspectRatio={state.aspectRatio}>
      <EditorWorkspaceContent />
    </CanvasProvider>
  );
}

function EditorWorkspaceContent() {
  const { state, dispatch, durationMs } = useEditor();
  const { selected: selectedCanvas, remove, duplicate, undo, redo } = useCanvas();
  const [activeTabOverride, setActiveTabOverride] = useState<'clip' | 'canvas' | null>(null);
  const inspectorTab = activeTabOverride ?? (state.ui.selectedItemId ? 'clip' : 'canvas');
  const panel = state.ui.activeLeftPanel;
  const playheadRef = useRef(state.ui.playheadMs);

  useEffect(() => {
    playheadRef.current = state.ui.playheadMs;
  }, [state.ui.playheadMs]);

  useEffect(() => {
    if (!state.ui.isPlaying || durationMs <= 0) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const next = playheadRef.current + now - last;
      last = now;
      if (next >= durationMs) {
        dispatch({ type: 'set-playhead', ms: durationMs });
        dispatch({ type: 'set-playing', playing: false });
        return;
      }
      dispatch({ type: 'set-playhead', ms: next });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dispatch, durationMs, state.ui.isPlaying]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (typing) return;

      // Escape: Deselect all
      if (event.key === 'Escape') {
        dispatch({ type: 'clear-selection' });
        remove();
      }

      // Delete / Backspace: Delete or Ripple Delete
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (selectedCanvas) {
          remove();
        } else if (event.shiftKey || state.ui.rippleEnabled) {
          dispatch({ type: 'ripple-delete-selected' });
        } else {
          dispatch({ type: 'delete-selected' });
        }
      }

      // Ctrl/Cmd + D: Duplicate
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        if (selectedCanvas) duplicate();
        else dispatch({ type: 'duplicate-selected' });
      }

      // Ctrl/Cmd + C: Copy
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        dispatch({ type: 'copy-selected' });
      }

      // Ctrl/Cmd + X: Cut
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'x') {
        event.preventDefault();
        dispatch({ type: 'cut-selected' });
      }

      // Ctrl/Cmd + V: Paste
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        dispatch({ type: 'paste-clips' });
      }

      // S: Split at playhead
      if (event.key.toLowerCase() === 's' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        if (state.ui.splitAllTracks) dispatch({ type: 'split-all-at-playhead' });
        else dispatch({ type: 'split-selected' });
      }

      // Space: Play / Pause
      if (event.code === 'Space') {
        event.preventDefault();
        dispatch({ type: 'toggle-play' });
      }

      // Arrow Left / Right: Frame stepping & Nudge
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;

        if (event.altKey) {
          // Alt + Arrow = Nudge selected clip(s)
          const frameMs = 1000 / state.ui.fps;
          const deltaMs = direction * frameMs * (event.shiftKey ? 5 : 1);
          dispatch({ type: 'nudge-selected', deltaMs });
        } else {
          // Step playhead
          dispatch({ type: 'step-playhead', direction, large: event.shiftKey });
        }
      }

      // Ctrl/Cmd + Z: Undo / Redo
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          if (selectedCanvas) redo();
          else dispatch({ type: 'redo' });
        } else {
          if (selectedCanvas) undo();
          else dispatch({ type: 'undo' });
        }
      }

      // Tool Mode Shortcuts (V: Select, T: Trim, C: Cut)
      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.key.toLowerCase() === 'v') dispatch({ type: 'set-editing-mode', mode: 'select' });
        if (event.key.toLowerCase() === 't') dispatch({ type: 'set-editing-mode', mode: 'trim' });
        if (event.key.toLowerCase() === 'c') dispatch({ type: 'set-editing-mode', mode: 'cut' });
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, duplicate, redo, remove, selectedCanvas, state.ui.fps, state.ui.rippleEnabled, state.ui.splitAllTracks, undo]);

  return (
    <div className="h-[100dvh] flex flex-col bg-app text-fg overflow-hidden select-none">
      {/* Top Header Bar */}
      <EditorTopBar />

      {/* CapCut-Style 3-Column Top Grid Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr_310px] border-b border-border bg-app overflow-hidden">

        {/* COLUMN 1: MEDIA & ASSET LIBRARY (Left) */}
        <div className="flex flex-col border-r border-border bg-panel min-h-0 overflow-hidden">
          {/* CapCut Top Asset Category Tab Bar */}
          <div className="h-10 shrink-0 border-b border-border bg-app-elevated flex items-center gap-1 px-2 overflow-x-auto scrollbar-none">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const selected = panel === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => dispatch({ type: 'set-panel', panel: tab.id })}
                  className={cx(
                    'h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors shrink-0',
                    selected
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-fg hover:bg-panel',
                  )}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Asset Category Panel Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {panel === 'media' ? <MediaPanel /> : null}
            {panel === 'audio' ? <AudioPanel /> : null}
            {panel === 'text' ? <TextPanel /> : null}
            {panel === 'captions' ? <CaptionsPanelFull /> : null}
            {panel === 'ai' ? <AiToolsPanel /> : null}
            {panel === 'transitions' ? <TransitionsPanel /> : null}
            {panel === 'effects' ? <EffectsPanel /> : null}
            {panel === 'filters' ? <EffectsPanel /> : null}
            {panel === 'templates' ? (
              <PlaceholderPanel
                title="Templates"
                body="Editor templates will inject pre-built tracks into the current project."
              />
            ) : null}
          </div>
        </div>

        {/* COLUMN 2: PLAYER / PREVIEW CANVAS (Middle) */}
        <div className="flex flex-col min-h-0 bg-app overflow-hidden">
          <div className="h-9 shrink-0 border-b border-border bg-panel px-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
              Player
            </span>
            <span className="text-[11px] font-mono text-muted">{state.aspectRatio}</span>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <CanvasPreview />
          </div>
        </div>

        {/* COLUMN 3: DETAILS / INSPECTOR PANEL (Right) */}
        <div className="hidden lg:flex flex-col border-l border-border bg-app-elevated min-h-0 overflow-hidden">
          <div className="h-9 shrink-0 border-b border-border bg-panel px-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-accent" /> Details
            </span>
            <div className="flex items-center gap-1 bg-app p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setActiveTabOverride('clip')}
                className={cx(
                  'text-[11px] font-medium px-2 py-0.5 rounded transition cursor-pointer',
                  inspectorTab === 'clip' ? 'bg-accent text-white' : 'text-muted hover:text-fg',
                )}
              >
                Clip
              </button>
              <button
                type="button"
                onClick={() => setActiveTabOverride('canvas')}
                className={cx(
                  'text-[11px] font-medium px-2 py-0.5 rounded transition cursor-pointer',
                  inspectorTab === 'canvas' ? 'bg-accent text-white' : 'text-muted hover:text-fg',
                )}
              >
                Canvas
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {inspectorTab === 'clip' ? <PropertiesPanel /> : <CanvasProperties />}
          </div>
        </div>

      </div>

      {/* Mobile Toolbar */}
      <MobileEditorToolbar />

      {/* BOTTOM ROW: FULL-WIDTH TIMELINE PANEL */}
      <Timeline />
    </div>
  );
}

function MobileEditorToolbar() {
  const { state, dispatch } = useEditor();
  const tools = [
    { id: 'media' as const, label: 'Media', icon: Image },
    { id: 'audio' as const, label: 'Audio', icon: Mic2 },
    { id: 'text' as const, label: 'Text', icon: Type },
    { id: 'captions' as const, label: 'Captions', icon: Captions },
    { id: 'ai' as const, label: 'AI', icon: Sparkles },
  ];

  return (
    <nav className="sm:hidden h-14 shrink-0 border-t border-border bg-app-elevated flex items-center justify-around px-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const active = state.ui.activeLeftPanel === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => dispatch({ type: 'set-panel', panel: tool.id })}
            className={`h-11 min-w-14 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] cursor-pointer ${active ? 'text-accent bg-accent-soft font-semibold' : 'text-muted'}`}
          >
            <Icon size={16} />
            {tool.label}
          </button>
        );
      })}
    </nav>
  );
}
