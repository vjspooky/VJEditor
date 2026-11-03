import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { EmbedModal } from '@/components/embed/EmbedModal';
import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace';
import { EditorProvider, useEditor } from '@/features/editor/EditorProvider';
import { ExportModal } from '@/features/editor/components/ExportModal';
import { projectService } from '@/services/projectService';
import {
  Download,
  ExternalLink,
  Globe,
  Maximize2,
  Minimize2,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export function FullPageEmbedPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();

  const paramProjectId = searchParams.get('project') || searchParams.get('id');
  const targetId = projectId || paramProjectId || 'proj_travel';
  const validId = projectService.get(targetId) ? targetId : 'proj_travel';

  const hideHeaderParam = searchParams.get('hideHeader') === '1' || searchParams.get('hideHeader') === 'true';

  return (
    <EditorProvider projectId={validId}>
      <FullPageEmbedContainer hideHeader={hideHeaderParam} />
    </EditorProvider>
  );
}

function FullPageEmbedContainer({ hideHeader }: { hideHeader: boolean }) {
  const { state, dispatch, save, durationMs } = useEditor();
  const [searchParams] = useSearchParams();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayDoneRef = useRef(false);

  // Check iframe status
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Handle autoplay query param
  useEffect(() => {
    if (autoplayDoneRef.current) return;
    if (searchParams.get('autoplay') === '1' || searchParams.get('autoplay') === 'true') {
      autoplayDoneRef.current = true;
      dispatch({ type: 'set-playing', playing: true });
    }
  }, [dispatch, searchParams]);

  // Handle postMessage API for iframe host integration (e.g. Google Sites / external web app)
  useEffect(() => {
    // Notify parent frame that VJEditor full page embed is ready
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage(
        {
          type: 'vjeditor:ready',
          projectId: state.projectId,
          projectName: state.snapshot.name,
          durationMs,
        },
        '*',
      );
    }

    function handleHostMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== 'object') return;
      const { type, ms } = event.data;

      switch (type) {
        case 'vjeditor:play':
          dispatch({ type: 'set-playing', playing: true });
          break;
        case 'vjeditor:pause':
          dispatch({ type: 'set-playing', playing: false });
          break;
        case 'vjeditor:toggle_play':
          dispatch({ type: 'toggle-play' });
          break;
        case 'vjeditor:seek':
          if (typeof ms === 'number') dispatch({ type: 'set-playhead', ms });
          break;
        case 'vjeditor:split':
          dispatch({ type: 'split-selected' });
          break;
        case 'vjeditor:save':
          save();
          break;
        case 'vjeditor:export':
          setExportModalOpen(true);
          break;
        default:
          break;
      }
    }

    window.addEventListener('message', handleHostMessage);
    return () => window.removeEventListener('message', handleHostMessage);
  }, [dispatch, durationMs, save, state.projectId, state.snapshot.name]);

  // Send periodic playhead position updates to parent iframe host
  useEffect(() => {
    if (typeof window === 'undefined' || !window.parent) return;
    window.parent.postMessage(
      {
        type: 'vjeditor:timeupdate',
        playheadMs: state.ui.playheadMs,
        durationMs,
        isPlaying: state.ui.isPlaying,
      },
      '*',
    );
  }, [durationMs, state.ui.isPlaying, state.ui.playheadMs]);

  // Toggle Fullscreen mode
  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-screen flex flex-col bg-[#0b0c10] text-[#e2e8f0] overflow-hidden select-none"
    >
      {/* Embedded Top Control Header (if not explicitly hidden via hideHeader=1) */}
      {!hideHeader && (
        <header className="h-10 shrink-0 border-b border-[#222634] bg-[#12141a] flex items-center justify-between px-3 text-xs overflow-x-auto z-20">
          <div className="flex items-center gap-2">
            <Logo compact to="/" />
            <div className="w-px h-4 bg-[#222634]" />
            <span className="font-semibold text-fg truncate max-w-[200px]">
              {state.snapshot.name || 'Alpine Lake Sunrise'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-medium">
              <Globe size={11} /> Google Sites Full-Page Embed
            </span>
            {isInsideIframe && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted font-mono">
                <Sparkles size={10} className="text-amber-400" /> Embedded Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEmbedModalOpen(true)}
              className="text-muted hover:text-fg text-[11px] gap-1 px-2 h-7 border border-[#222634]"
              title="Get Google Sites Embed Code"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Embed Code</span>
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setExportModalOpen(true)}
              className="text-[11px] gap-1 px-2.5 h-7"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
              className="h-7 w-7 text-muted hover:text-fg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>

            <a
              href={`/#/editor/${state.projectId}`}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 rounded-lg border border-[#222634] bg-[#181b24] hover:bg-[#222634] text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 no-underline transition-colors shrink-0"
              title="Open full VJEditor app in new tab"
            >
              <ExternalLink size={12} />
              <span className="hidden md:inline">Open App</span>
            </a>
          </div>
        </header>
      )}

      {/* Main Full Page Editor Studio */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <EditorWorkspace />
      </div>

      {/* Modals */}
      {embedModalOpen && (
        <EmbedModal
          projectId={state.projectId}
          projectName={state.snapshot.name}
          onClose={() => setEmbedModalOpen(false)}
        />
      )}
      {exportModalOpen && <ExportModal onClose={() => setExportModalOpen(false)} />}
    </div>
  );
}
