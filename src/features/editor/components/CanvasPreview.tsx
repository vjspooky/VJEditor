import { useCanvas } from '@/features/editor/CanvasProvider';
import { useEditor } from '@/features/editor/EditorProvider';
import type { CanvasElement } from '@/features/editor/canvasTypes';
import type { Caption, TextLayer } from '@/types';
import { defaultElement } from '@/services/editorService';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';

function formatSmpteTime(ms: number, fps: number = 30): string {
  const safeMs = Math.max(0, ms);
  const totalFrames = Math.floor((safeMs / 1000) * fps);
  const frames = totalFrames % fps;
  const totalSecs = Math.floor(safeMs / 1000);
  const secs = totalSecs % 60;
  const totalMins = Math.floor(totalSecs / 60);
  const mins = totalMins % 60;
  const hours = Math.floor(totalMins / 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

export function CanvasPreview() {
  const { state: editorState, durationMs } = useEditor();
  const { state, select, update } = useCanvas();
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRefs = useRef(new Map<string, HTMLVideoElement>());
  const [aspect, setAspect] = useState<string>('16:9');
  const [failedElementIds, setFailedElementIds] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState<{ id: string; startX: number; startY: number; x: number; y: number } | null>(null);

  const assets = editorState.snapshot.media;
  const playheadMs = editorState.ui.playheadMs;

  const activeTimelineClips = editorState.snapshot.tracks
    .flatMap((track) => track.items.map((item) => ({ track, item })))
    .filter(({ item }) => item.kind === 'video' && playheadMs >= item.startMs && playheadMs < item.startMs + item.durationMs);

  const activeTextClips = editorState.snapshot.tracks
    .filter((track) => !track.hidden)
    .flatMap((track) => track.items)
    .filter(
      (item): item is TextLayer =>
        item.kind === 'text' &&
        !item.hidden &&
        playheadMs >= item.startMs &&
        playheadMs < item.startMs + item.durationMs,
    );

  const activeCaptionClips = editorState.snapshot.tracks
    .filter((track) => !track.hidden)
    .flatMap((track) => track.items)
    .filter(
      (item): item is Caption =>
        item.kind === 'caption' &&
        !item.hidden &&
        playheadMs >= item.startMs &&
        playheadMs < item.startMs + item.durationMs,
    );

  const timelineHasClips = editorState.snapshot.tracks.some((track) =>
    track.items.some((item) => item.kind === 'video'),
  );

  const renderElements = useMemo(() => {
    if (!timelineHasClips) return state.elements;
    return activeTimelineClips.map(({ item }, index) => {
      const asset = assets.find((a) => a.id === item.mediaId);
      const visualType: 'video' | 'image' = asset?.type === 'image' ? 'image' : 'video';
      return (
        state.elements.find((element) => element.mediaId === item.mediaId) ?? {
          ...defaultElement(item.mediaId ?? '', visualType, state.canvas, index),
          id: `timeline-${item.id}`,
          type: visualType,
        }
      );
    });
  }, [activeTimelineClips, assets, state.canvas, state.elements, timelineHasClips]);

  useEffect(() => {
    if (!drag) return;
    const activeDrag = drag;
    function move(event: globalThis.PointerEvent) {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scale = rect.width / state.canvas.width;
      update(activeDrag.id, {
        x: Math.max(0, Math.min(state.canvas.width - 20, activeDrag.x + (event.clientX - activeDrag.startX) / scale)),
        y: Math.max(0, Math.min(state.canvas.height - 20, activeDrag.y + (event.clientY - activeDrag.startY) / scale)),
      });
    }
    function up() {
      setDrag(null);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, state.canvas.height, state.canvas.width, update]);

  // Sync video elements with playhead
  useEffect(() => {
    renderElements.forEach((element) => {
      if (element.type !== 'video') return;
      const video = mediaRefs.current.get(element.id);
      if (!video) return;

      const matchedClip = activeTimelineClips.find(
        (c) => c.item.mediaId === element.mediaId || `timeline-${c.item.id}` === element.id,
      );

      const targetTime = matchedClip
        ? (playheadMs - matchedClip.item.startMs) / 1000
        : playheadMs / 1000;

      if (Math.abs(video.currentTime - targetTime) > 0.25) {
        video.currentTime = Math.max(0, targetTime);
      }
    });
  }, [activeTimelineClips, playheadMs, renderElements]);

  function startDrag(element: CanvasElement, event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    select(element.id);
    setDrag({
      id: element.id,
      startX: event.clientX,
      startY: event.clientY,
      x: element.x,
      y: element.y,
    });
  }

  // Format timecodes: 00:00:00:00 / 00:00:16:00
  const formattedPlayhead = formatSmpteTime(playheadMs, editorState.ui.fps);
  const formattedTotal = formatSmpteTime(durationMs || 16000, editorState.ui.fps);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0c10] text-[#e2e8f0] select-none p-3 overflow-hidden">
      {/* Top Aspect Selector Row */}
      <div className="flex items-center justify-center gap-2 pb-2 shrink-0">
        <span className="text-xs text-slate-400 font-medium">Aspect:</span>
        <div className="relative inline-flex items-center">
          <select
            value={aspect}
            onChange={(e) => setAspect(e.target.value)}
            className="appearance-none bg-[#181b24] hover:bg-[#222634] border border-[#222634] text-cyan-400 text-xs font-semibold px-3 py-1 pr-7 rounded-full cursor-pointer outline-none transition-colors shadow-sm"
          >
            <option value="16:9">16:9 (Landscape YouTube)</option>
            <option value="9:16">9:16 (Shorts / Reels / TikTok)</option>
            <option value="1:1">1:1 (Square Instagram)</option>
            <option value="4:5">4:5 (Portrait Feed)</option>
            <option value="21:9">21:9 (Cinematic Ultrawide)</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 text-cyan-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Main Video Canvas Viewport */}
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-2">
        <div
          ref={frameRef}
          className="relative bg-black border border-[#222634] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center max-w-full max-h-full aspect-video"
          style={{
            width: '100%',
            maxWidth: '820px',
            maxHeight: '100%',
          }}
          onClick={() => select(null)}
        >
          {/* Active Video Elements */}
          {renderElements.map((element) => {
            const asset = assets.find((a) => a.id === element.mediaId);
            if (!asset) return null;
            const src = asset.src ?? asset.url;
            const selected = state.selectedElementId === element.id;

            return (
              <div
                key={element.id}
                onPointerDown={(event) => startDrag(element, event)}
                className={`absolute inset-0 flex items-center justify-center overflow-hidden ${
                  selected ? 'ring-2 ring-cyan-400' : ''
                }`}
                style={{
                  transform: `translate(${element.x}px, ${element.y}px) scale(${element.scaleX}) rotate(${element.rotation}deg)`,
                  opacity: element.opacity,
                }}
              >
                {element.type === 'video' && src && !failedElementIds.has(element.id) ? (
                  <video
                    ref={(node) => {
                      if (node) mediaRefs.current.set(element.id, node);
                      else mediaRefs.current.delete(element.id);
                    }}
                    src={src}
                    playsInline
                    muted
                    loop
                    className="w-full h-full object-cover pointer-events-none"
                    onError={() => {
                      setFailedElementIds((prev) => new Set(prev).add(element.id));
                    }}
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <img
                      src={asset.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80'}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Active Text Clips */}
          {activeTextClips.map((textItem) => (
            <div
              key={textItem.id}
              className="absolute z-20 text-center font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none select-none tracking-wide"
              style={{
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: `${Math.round(textItem.fontSize * 0.7)}px`,
                fontFamily: textItem.fontFamily || 'Inter',
              }}
            >
              {textItem.text}
            </div>
          ))}

          {/* Active Captions */}
          {activeCaptionClips.map((cap) => (
            <div
              key={cap.id}
              className="absolute bottom-6 inset-x-4 flex justify-center z-20 pointer-events-none"
            >
              <span className="bg-black/80 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-lg border border-white/10">
                {cap.text}
              </span>
            </div>
          ))}

          {!renderElements.length && (
            <div className="relative w-full h-full">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80"
                alt="Misty Alpine Lake Sunrise"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timecode Display (Cyan Monospace) */}
      <div className="pt-2 text-center shrink-0">
        <span className="font-mono text-cyan-400 font-bold tracking-widest text-sm drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {formattedPlayhead} / {formattedTotal}
        </span>
      </div>
    </div>
  );
}
