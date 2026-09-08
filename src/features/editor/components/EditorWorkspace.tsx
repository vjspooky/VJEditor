import { AiToolsPanel } from '@/features/editor/components/AiToolsPanel';
import { CanvasProvider, useCanvas } from '@/features/editor/CanvasProvider';
import { AudioPanel } from '@/features/editor/components/AudioPanel';
import { CaptionsPanel as CaptionsPanelFull } from '@/features/editor/components/CaptionsPanel';
import { PlaceholderPanel } from '@/features/editor/components/UtilityPanels';
import { EffectsPanel } from '@/features/editor/components/EffectsPanel';
import { TransitionsPanel } from '@/features/editor/components/TransitionsPanel';
import { EditorTopBar } from '@/features/editor/components/EditorTopBar';
import { LeftToolbar } from '@/features/editor/components/LeftToolbar';
import { MediaPanel } from '@/features/editor/components/MediaPanel';
import { CanvasPreview } from '@/features/editor/components/CanvasPreview';
import { CanvasProperties } from '@/features/editor/components/CanvasProperties';
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel';
import { TextPanel } from '@/features/editor/components/TextPanel';
import { Timeline } from '@/features/editor/components/Timeline';
import { useEditor } from '@/features/editor/EditorProvider';
import { Captions, Image, Mic2, PanelLeftClose, PanelLeftOpen, Sparkles, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  const [panelOpen, setPanelOpen] = useState(true);
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
    <div className="h-[100dvh] flex flex-col bg-app text-fg overflow-hidden">
      <EditorTopBar />
      <div className="flex-1 min-h-0 flex">
        <div className="hidden sm:block">
          <LeftToolbar />
        </div>
        {panelOpen ? (
          <div className="w-[min(280px,calc(100vw-56px))] shrink-0 border-r border-border bg-panel flex flex-col min-h-0">
            <div className="h-9 px-3 flex items-center justify-between border-b border-border">
              <p className="text-xs uppercase tracking-wider text-muted">{labelFor(panel)}</p>
              <button
                type="button"
                className="text-muted hover:text-fg cursor-pointer"
                onClick={() => setPanelOpen(false)}
                aria-label="Close panel"
              >
                <PanelLeftClose size={14} />
              </button>
            </div>
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
        ) : (
          <button
            type="button"
            className="w-8 border-r border-border text-muted hover:text-fg cursor-pointer"
            onClick={() => setPanelOpen(true)}
            aria-label="Open panel"
          >
            <PanelLeftOpen size={14} className="mx-auto" />
          </button>
        )}
        <CanvasPreview />

        {/* Right Inspector with Tab Switcher */}
        <div className="hidden lg:flex flex-col shrink-0 border-l border-border bg-app-elevated">
          <div className="h-9 px-3 flex items-center gap-2 border-b border-border bg-panel">
            <button
              type="button"
              onClick={() => setActiveTabOverride('clip')}
              className={`text-xs font-medium px-2.5 py-1 rounded transition cursor-pointer ${
                inspectorTab === 'clip'
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-fg'
              }`}
            >
              Clip Properties
            </button>
            <button
              type="button"
              onClick={() => setActiveTabOverride('canvas')}
              className={`text-xs font-medium px-2.5 py-1 rounded transition cursor-pointer ${
                inspectorTab === 'canvas'
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-fg'
              }`}
            >
              Canvas & Project
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {inspectorTab === 'clip' ? <PropertiesPanel /> : <CanvasProperties />}
          </div>
        </div>
      </div>
      <MobileEditorToolbar />
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
    <nav className="sm:hidden h-16 shrink-0 border-t border-border bg-app-elevated flex items-center justify-around px-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const active = state.ui.activeLeftPanel === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => dispatch({ type: 'set-panel', panel: tool.id })}
            className={`h-12 min-w-14 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] cursor-pointer ${active ? 'text-accent bg-accent-soft' : 'text-muted'}`}
          >
            <Icon size={18} />
            {tool.label}
          </button>
        );
      })}
    </nav>
  );
}

function labelFor(panel: string): string {
  const labels: Record<string, string> = {
    media: 'Media',
    audio: 'Audio',
    text: 'Text',
    captions: 'Captions',
    transitions: 'Transitions',
    effects: 'Effects',
    filters: 'Filters',
    ai: 'AI Tools',
    templates: 'Templates',
  };
  return labels[panel] ?? panel;
}
