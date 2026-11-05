import { AiToolsPanel } from '@/features/editor/components/AiToolsPanel';
import { CanvasProvider } from '@/features/editor/CanvasProvider';
import { AudioPanel } from '@/features/editor/components/AudioPanel';
import { CaptionsPanel as CaptionsPanelFull } from '@/features/editor/components/CaptionsPanel';
import { PlaceholderPanel } from '@/features/editor/components/UtilityPanels';
import { EffectsPanel } from '@/features/editor/components/EffectsPanel';
import { TransitionsPanel } from '@/features/editor/components/TransitionsPanel';
import { MediaPanel } from '@/features/editor/components/MediaPanel';
import { CanvasPreview } from '@/features/editor/components/CanvasPreview';
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel';
import { TextPanel } from '@/features/editor/components/TextPanel';
import { Timeline } from '@/features/editor/components/Timeline';
import { useEditor, type LeftPanelId } from '@/features/editor/EditorProvider';
import { cx } from '@/utils/cx';
import {
  FolderKanban,
  Music,
  Type,
  Smile,
  Wand2,
  Blend,
  SlidersHorizontal,
  LayoutTemplate,
  Sparkles,
  Captions,
  Shapes,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SidebarItem {
  id: LeftPanelId;
  label: string;
  icon: typeof FolderKanban;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'media', label: 'Media', icon: FolderKanban },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'stickers', label: 'Stickers', icon: Smile },
  { id: 'effects', label: 'Effects', icon: Wand2 },
  { id: 'transitions', label: 'Transitions', icon: Blend },
  { id: 'filters', label: 'Filters', icon: SlidersHorizontal },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'ai', label: 'AI Tools', icon: Sparkles },
  { id: 'captions', label: 'Captions', icon: Captions },
  { id: 'elements', label: 'Elements', icon: Shapes },
];

export function EditorWorkspace() {
  const { state } = useEditor();
  const validProjectId = state.projectId || 'proj_travel';
  return (
    <CanvasProvider key={validProjectId} projectId={validProjectId} aspectRatio={state.aspectRatio || '16:9'}>
      <EditorWorkspaceContent />
    </CanvasProvider>
  );
}

function EditorWorkspaceContent() {
  const { state, dispatch, durationMs } = useEditor();
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

      if (event.key === 'Escape') {
        dispatch({ type: 'clear-selection' });
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        dispatch({ type: 'delete-selected' });
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        dispatch({ type: 'duplicate-selected' });
      }

      if (event.key.toLowerCase() === 's' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        dispatch({ type: 'split-selected' });
      }

      if (event.code === 'Space') {
        event.preventDefault();
        dispatch({ type: 'toggle-play' });
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0b0c10] text-[#e2e8f0] overflow-hidden select-none">
      {/* Top Main Studio Area (4 Columns) */}
      <div className="flex-1 min-h-0 flex border-b border-[#222634] overflow-hidden">
        {/* COLUMN 1: FAR-LEFT VERTICAL ICON STRIP (w-[68px]) */}
        <div className="w-[68px] shrink-0 bg-[#0b0c10] border-r border-[#222634] flex flex-col items-center py-2.5 gap-1.5 overflow-y-auto scrollbar-none z-10">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = panel === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => dispatch({ type: 'set-panel', panel: item.id })}
                className={cx(
                  'w-[54px] py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all',
                  isSelected
                    ? 'bg-[#181b24] text-cyan-400 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141a]',
                )}
                title={item.label}
              >
                <Icon size={18} strokeWidth={isSelected ? 2.2 : 1.8} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* COLUMN 2: SUB-DRAWER PANEL (w-[320px]) */}
        <div className="w-[320px] shrink-0 bg-[#12141a] border-r border-[#222634] flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {panel === 'media' ? <MediaPanel /> : null}
            {panel === 'audio' ? <AudioPanel /> : null}
            {panel === 'text' ? <TextPanel /> : null}
            {panel === 'captions' ? <CaptionsPanelFull /> : null}
            {panel === 'ai' ? <AiToolsPanel /> : null}
            {panel === 'transitions' ? <TransitionsPanel /> : null}
            {panel === 'effects' ? <EffectsPanel /> : null}
            {panel === 'filters' ? <EffectsPanel /> : null}
            {panel === 'stickers' || panel === 'elements' || panel === 'templates' ? (
              <PlaceholderPanel
                title={panel.toUpperCase()}
                body={`Explore high quality creative ${panel} curated for AI video productions.`}
              />
            ) : null}
          </div>
        </div>

        {/* COLUMN 3: CENTER VIEWPORT / PLAYER CANVAS (flex-1) */}
        <div className="flex-1 min-w-0 bg-[#0b0c10] flex flex-col min-h-0 overflow-hidden">
          <CanvasPreview />
        </div>

        {/* COLUMN 4: RIGHT INSPECTOR PANEL (w-[310px]) */}
        <PropertiesPanel />
      </div>

      {/* Bottom Timeline Area */}
      <div className="h-[270px] shrink-0 bg-[#0b0c10] flex flex-col overflow-hidden">
        <Timeline />
      </div>
    </div>
  );
}
