import { AiToolsPanel } from '@/features/editor/components/AiToolsPanel';
import { AudioPanel } from '@/features/editor/components/AudioPanel';
import { CaptionsPanel, PlaceholderPanel } from '@/features/editor/components/UtilityPanels';
import { EditorTopBar } from '@/features/editor/components/EditorTopBar';
import { LeftToolbar } from '@/features/editor/components/LeftToolbar';
import { MediaPanel } from '@/features/editor/components/MediaPanel';
import { PreviewPlayer } from '@/features/editor/components/PreviewPlayer';
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel';
import { TextPanel } from '@/features/editor/components/TextPanel';
import { Timeline } from '@/features/editor/components/Timeline';
import { useEditor } from '@/features/editor/EditorProvider';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';

export function EditorWorkspace() {
  const { state } = useEditor();
  const [panelOpen, setPanelOpen] = useState(true);
  const panel = state.ui.activeLeftPanel;

  return (
    <div className="h-screen flex flex-col bg-app text-fg overflow-hidden">
      <EditorTopBar />
      <div className="flex-1 min-h-0 flex">
        <LeftToolbar />
        {panelOpen ? (
          <div className="w-[280px] shrink-0 border-r border-border bg-panel flex flex-col min-h-0">
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
            <div className="flex-1 min-h-0">
              {panel === 'media' ? <MediaPanel /> : null}
              {panel === 'audio' ? <AudioPanel /> : null}
              {panel === 'text' ? <TextPanel /> : null}
              {panel === 'captions' ? <CaptionsPanel /> : null}
              {panel === 'ai' ? <AiToolsPanel /> : null}
              {panel === 'transitions' ? (
                <PlaceholderPanel
                  title="Transitions"
                  body="Dissolve, slide, and wipe transitions will attach between adjacent clips on the same track."
                />
              ) : null}
              {panel === 'effects' ? (
                <PlaceholderPanel
                  title="Effects"
                  body="Clip-level effects (blur, glow, motion) will bind to TimelineItem ids."
                />
              ) : null}
              {panel === 'filters' ? (
                <PlaceholderPanel
                  title="Filters"
                  body="Color filters will stack on video clips without changing the timeline schema."
                />
              ) : null}
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
        <PreviewPlayer />
        <PropertiesPanel />
      </div>
      <Timeline />
    </div>
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
