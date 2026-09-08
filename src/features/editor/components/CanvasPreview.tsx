import { Button } from '@/components/ui/Button';
import { useCanvas } from '@/features/editor/CanvasProvider';
import { useEditor } from '@/features/editor/EditorProvider';
import type { CanvasElement } from '@/features/editor/canvasTypes';
import type { Caption, TextAnimation, TextLayer, TimelineItem, TimelineTrack, VideoClip } from '@/types';
import { defaultElement } from '@/services/editorService';
import { buildCssFilter } from '@/utils/effects';
import { formatClock, aspectToCss } from '@/utils/format';
import { interpolateKeyframes } from '@/utils/keyframe';
import { Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';

export function CanvasPreview() {
  const { state: editorState, dispatch } = useEditor();
  const { state, select, update } = useCanvas();
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRefs = useRef(new Map<string, HTMLVideoElement>());
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; startX: number; startY: number; x: number; y: number } | null>(null);

  const assets = editorState.snapshot.media;
  const isPlaying = editorState.ui.isPlaying;
  const playheadMs = editorState.ui.playheadMs;
  const currentTime = playheadMs / 1000;
  const duration = durationMsFromEditor(editorState.snapshot.tracks, editorState.snapshot.duration) / 1000;

  const activeTimelineClips = editorState.snapshot.tracks
    .flatMap((track) => track.items.map((item) => ({ track, item })))
    .filter(isActiveVideoClip(playheadMs));

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
    return activeTimelineClips.map(
      ({ item }, index) =>
        state.elements.find((element) => element.mediaId === item.mediaId) ?? {
          ...defaultElement(item.mediaId ?? '', 'video', state.canvas, index),
          id: `timeline-${item.id}`,
        },
    );
  }, [activeTimelineClips, state.canvas, state.elements, timelineHasClips]);

  const canvasScale = Math.min(1, state.canvas.zoom / 100);

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

  useEffect(() => {
    mediaRefs.current.forEach((video) => {
      video.volume = volume / 100;
      video.muted = muted || volume === 0;
    });
  }, [muted, volume]);

  useEffect(() => {
    renderElements.forEach((element) => {
      const video = mediaRefs.current.get(element.id);
      if (!video) return;
      const clip = activeTimelineClips.find(({ item }) => item.mediaId === element.mediaId)?.item;
      const nextTime = clip ? Math.max(0, (playheadMs - clip.startMs) / 1000) : currentTime;
      if (Math.abs(video.currentTime - nextTime) > 0.15) video.currentTime = nextTime;
      if (isPlaying) void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [activeTimelineClips, currentTime, playheadMs, isPlaying, renderElements]);

  function togglePlayback() {
    if (!duration) return;
    const next = !isPlaying;
    dispatch({ type: 'set-playing', playing: next });
    mediaRefs.current.forEach((video) => {
      if (next) void video.play().catch(() => dispatch({ type: 'set-playing', playing: false }));
      else video.pause();
    });
  }

  function seek(value: number) {
    const next = Math.max(0, Math.min(duration || value, value));
    dispatch({ type: 'set-playhead', ms: next * 1000 });
    mediaRefs.current.forEach((video) => {
      video.currentTime = next;
    });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>, element: CanvasElement) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    select(element.id);
    setDrag({ id: element.id, startX: event.clientX, startY: event.clientY, x: element.x, y: element.y });
  }

  async function fullscreen() {
    if (!frameRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await frameRef.current.requestFullscreen();
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-app">
      <div className="flex-1 min-h-0 overflow-auto grid place-items-center p-4">
        <div
          ref={frameRef}
          className="relative max-w-full max-h-full overflow-hidden border border-border rounded-xl shadow-2xl"
          style={{
            aspectRatio: aspectToCss(state.canvas.aspectRatio),
            width: `min(100%, ${720 * canvasScale}px)`,
            background: state.canvas.background,
          }}
          onPointerDown={() => select(null)}
        >
          {/* Video & Image Elements */}
          {renderElements.map((element) => {
            const asset = assets.find((item) => item.id === element.mediaId);
            if (!asset || !element.visible) return null;
            const src = asset.src ?? asset.url;
            const selected = element.id === state.selectedElementId;
            const clip = activeTimelineClips.find(({ item }) => item.mediaId === element.mediaId)?.item;

            // Keyframe-interpolated values
            const clipTimeMs = clip ? playheadMs - clip.startMs : 0;
            const finalOpacity = clip?.keyframes
              ? interpolateKeyframes(clip.keyframes, 'opacity', clipTimeMs, element.opacity)
              : element.opacity;
            const finalScale = clip?.keyframes
              ? interpolateKeyframes(clip.keyframes, 'scale', clipTimeMs, element.scaleX)
              : element.scaleX;
            const finalRotation = clip?.keyframes
              ? interpolateKeyframes(clip.keyframes, 'rotation', clipTimeMs, element.rotation)
              : element.rotation;
            const filterString = clip ? buildCssFilter(clip.effects) : '';

            return (
              <div
                key={element.id}
                className={`absolute origin-center transition-[filter] ${
                  selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-black' : ''
                }`}
                style={{
                  left: `${(element.x / state.canvas.width) * 100}%`,
                  top: `${(element.y / state.canvas.height) * 100}%`,
                  width: `${(element.width / state.canvas.width) * 100}%`,
                  height: `${(element.height / state.canvas.height) * 100}%`,
                  opacity: finalOpacity / 100,
                  transform: `rotate(${finalRotation}deg) scale(${finalScale}, ${element.scaleY})`,
                  filter: filterString || undefined,
                }}
                onPointerDown={(event) => startDrag(event, element)}
              >
                {element.type === 'video' && src ? (
                  <video
                    ref={(node) => {
                      if (node) mediaRefs.current.set(element.id, node);
                      else mediaRefs.current.delete(element.id);
                    }}
                    src={src}
                    className="h-full w-full object-contain pointer-events-none"
                    muted={muted}
                    playsInline
                    preload="metadata"
                    onTimeUpdate={(event) => {
                      const timelineClip = activeTimelineClips.find(
                        ({ item }) => item.mediaId === element.mediaId,
                      )?.item;
                      const timelineTime = timelineClip
                        ? timelineClip.startMs / 1000 + event.currentTarget.currentTime
                        : event.currentTarget.currentTime;
                      if (selected && Math.abs(playheadMs / 1000 - timelineTime) > 0.1) {
                        dispatch({ type: 'set-playhead', ms: timelineTime * 1000 });
                      }
                    }}
                    onPlay={() => dispatch({ type: 'set-playing', playing: true })}
                    onPause={() => dispatch({ type: 'set-playing', playing: false })}
                    onEnded={() => dispatch({ type: 'set-playing', playing: false })}
                    onError={() => setError('Unable to preview this video. The file may be damaged or unsupported.')}
                  />
                ) : element.type === 'image' && src ? (
                  <img
                    src={src}
                    alt={asset.name}
                    className="h-full w-full object-contain pointer-events-none"
                    onError={() => setError('Unable to preview this image.')}
                  />
                ) : (
                  <div
                    className="h-full w-full grid place-items-center text-xs text-muted"
                    style={{ background: asset.thumbnailColor }}
                  >
                    {asset.name}
                  </div>
                )}
                {selected ? (
                  <ResizeHandle element={element} onResize={(patch) => update(element.id, patch)} />
                ) : null}
              </div>
            );
          })}

          {/* Active Text Layers */}
          {activeTextClips.map((textItem) => {
            const isSelected = editorState.ui.selectedItemId === textItem.id;
            const clipRelMs = playheadMs - textItem.startMs;
            const anim = getTextAnimationStyles(textItem.animation, clipRelMs, textItem.durationMs);
            const displayText = getRenderedText(textItem.text, textItem.animation, clipRelMs);

            // Keyframe interpolation for text
            const posX = textItem.keyframes
              ? interpolateKeyframes(textItem.keyframes, 'positionX', clipRelMs, textItem.positionX)
              : textItem.positionX;
            const posY = textItem.keyframes
              ? interpolateKeyframes(textItem.keyframes, 'positionY', clipRelMs, textItem.positionY)
              : textItem.positionY;
            const scaleVal = textItem.keyframes
              ? interpolateKeyframes(textItem.keyframes, 'scale', clipRelMs, textItem.scale ?? 1)
              : (textItem.scale ?? 1);
            const rotVal = textItem.keyframes
              ? interpolateKeyframes(textItem.keyframes, 'rotation', clipRelMs, textItem.rotation ?? 0)
              : (textItem.rotation ?? 0);
            const opacityVal = textItem.keyframes
              ? interpolateKeyframes(textItem.keyframes, 'opacity', clipRelMs, (textItem.opacity ?? 100))
              : (textItem.opacity ?? 100);

            return (
              <div
                key={textItem.id}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'select', itemId: textItem.id });
                }}
                className={`absolute select-none cursor-pointer ${
                  isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-black rounded' : ''
                }`}
                style={{
                  left: `${(posX / state.canvas.width) * 100}%`,
                  top: `${(posY / state.canvas.height) * 100}%`,
                  transform: `rotate(${rotVal}deg) scale(${scaleVal}) ${anim.transform}`,
                  opacity: (opacityVal / 100) * anim.opacity,
                  fontFamily: textItem.fontFamily,
                  fontSize: `${textItem.fontSize * (state.canvas.height / 720)}px`,
                  fontWeight: textItem.fontWeight,
                  fontStyle: textItem.fontStyle ?? 'normal',
                  textAlign: textItem.align,
                  color: textItem.color,
                  letterSpacing: textItem.letterSpacing ? `${textItem.letterSpacing}px` : undefined,
                  lineHeight: textItem.lineHeight ?? 1.2,
                  backgroundColor: textItem.backgroundColor,
                  padding: textItem.padding ? `${textItem.padding}px` : undefined,
                  borderRadius: textItem.borderRadius ? `${textItem.borderRadius}px` : undefined,
                  WebkitTextStroke: textItem.strokeWidth && textItem.strokeColor ? `${textItem.strokeWidth}px ${textItem.strokeColor}` : undefined,
                  textShadow: textItem.shadowColor && textItem.shadowBlur ? `0px 2px ${textItem.shadowBlur}px ${textItem.shadowColor}` : undefined,
                  zIndex: 15,
                  maxWidth: '90%',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {displayText}
              </div>
            );
          })}

          {/* Active Subtitles / Captions */}
          {activeCaptionClips.map((caption) => {
            const isTop = caption.position === 'top';
            const isCenter = caption.position === 'center';
            const positionClass = isTop ? 'top-6' : isCenter ? 'top-1/2 -translate-y-1/2' : 'bottom-6';

            let styleClasses = 'text-white font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]';
            if (caption.style === 'boxed') {
              styleClasses = 'bg-black/80 backdrop-blur-xs text-white px-4 py-1.5 rounded-lg font-medium shadow-lg';
            } else if (caption.style === 'social') {
              styleClasses = 'bg-yellow-400 text-black px-3.5 py-1 font-black uppercase tracking-wider rounded transform -rotate-1 shadow-md';
            } else if (caption.style === 'karaoke') {
              styleClasses = 'text-amber-300 font-extrabold text-stroke-sm drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]';
            } else if (caption.style === 'minimal') {
              styleClasses = 'text-white/90 font-normal tracking-wide text-xs drop-shadow-sm';
            } else if (caption.style === 'outline') {
              styleClasses = 'text-white font-bold [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]';
            }

            return (
              <div
                key={caption.id}
                className={`absolute inset-x-4 flex flex-col items-center justify-center pointer-events-none z-20 ${positionClass}`}
              >
                {caption.speaker ? (
                  <span className="text-[10px] text-accent font-semibold tracking-wider uppercase mb-0.5">
                    {caption.speaker}
                  </span>
                ) : null}
                <span
                  className={`text-center max-w-[85%] leading-relaxed ${styleClasses}`}
                  style={{
                    fontSize: caption.fontSize ? `${caption.fontSize}px` : undefined,
                    color: caption.color,
                    backgroundColor: caption.backgroundColor,
                  }}
                >
                  {caption.text}
                </span>
              </div>
            );
          })}

          {!renderElements.length && !activeTextClips.length && (
            <p className="absolute inset-0 grid place-items-center text-sm text-muted">
              Add media, text, or captions to preview on the canvas
            </p>
          )}
          {error ? (
            <div className="absolute inset-x-3 bottom-3 rounded-lg bg-danger/90 px-3 py-2 text-xs text-white">
              {error}
            </div>
          ) : null}
        </div>
      </div>
      <div className="shrink-0 border-t border-border bg-app-elevated px-3 py-2 space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={Math.min(currentTime, duration || 1)}
          onChange={(event) => seek(Number(event.target.value))}
          className="w-full accent-accent cursor-pointer"
          aria-label="Preview progress"
        />
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => seek(0)} aria-label="Restart preview">
            <RotateCcw size={15} />
          </Button>
          <Button
            size="icon"
            variant="primary"
            onClick={togglePlayback}
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <span className="text-xs tabular-nums text-muted">
            {formatClock(currentTime * 1000)} / {formatClock(duration * 1000)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? 'Unmute preview' : 'Mute preview'}
              className="text-muted hover:text-fg cursor-pointer"
            >
              {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-20 accent-accent cursor-pointer"
              aria-label="Preview volume"
            />
            <Button size="icon" variant="ghost" onClick={() => void fullscreen()} aria-label="Fullscreen preview">
              <Maximize2 size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isActiveVideoClip(playheadMs: number) {
  return (value: { track: TimelineTrack; item: TimelineItem }): value is { track: TimelineTrack; item: VideoClip } =>
    value.track.kind === 'video' &&
    !value.track.hidden &&
    value.item.kind === 'video' &&
    playheadMs >= value.item.startMs &&
    playheadMs < value.item.startMs + value.item.durationMs;
}

function durationMsFromEditor(
  tracks: { items: { startMs: number; durationMs: number }[] }[],
  fallbackSeconds: number,
): number {
  return Math.max(
    fallbackSeconds * 1000,
    ...tracks.flatMap((track) => track.items.map((item) => item.startMs + item.durationMs)),
  );
}

function getTextAnimationStyles(animation: TextAnimation, clipRelativeMs: number, durationMs: number) {
  const introDuration = 400;
  const outroDuration = 400;
  let transform = '';
  let opacity = 1;

  if (animation === 'fade-in') {
    opacity = Math.min(1, Math.max(0, clipRelativeMs / introDuration));
  } else if (animation === 'fade-out') {
    const fromEnd = durationMs - clipRelativeMs;
    opacity = Math.min(1, Math.max(0, fromEnd / outroDuration));
  } else if (animation === 'slide-up') {
    const p = Math.min(1, Math.max(0, clipRelativeMs / introDuration));
    opacity = p;
    transform = `translateY(${(1 - p) * 30}px)`;
  } else if (animation === 'slide-down') {
    const p = Math.min(1, Math.max(0, clipRelativeMs / introDuration));
    opacity = p;
    transform = `translateY(${(1 - p) * -30}px)`;
  } else if (animation === 'slide-left') {
    const p = Math.min(1, Math.max(0, clipRelativeMs / introDuration));
    opacity = p;
    transform = `translateX(${(1 - p) * 40}px)`;
  } else if (animation === 'slide-right') {
    const p = Math.min(1, Math.max(0, clipRelativeMs / introDuration));
    opacity = p;
    transform = `translateX(${(1 - p) * -40}px)`;
  } else if (animation === 'pop') {
    const p = Math.min(1, Math.max(0, clipRelativeMs / introDuration));
    opacity = p;
    transform = `scale(${0.5 + p * 0.5})`;
  }

  return { transform, opacity };
}

function getRenderedText(text: string, animation: TextAnimation, clipRelativeMs: number) {
  if (animation !== 'typewriter') return text;
  const charsPerSec = 25;
  const charsToShow = Math.floor((clipRelativeMs / 1000) * charsPerSec);
  return text.slice(0, Math.max(1, Math.min(text.length, charsToShow)));
}

function ResizeHandle({
  element,
  onResize,
}: {
  element: CanvasElement;
  onResize: (patch: Partial<CanvasElement>) => void;
}) {
  const start = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  return (
    <span
      className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-accent border-2 border-white cursor-nwse-resize"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        start.current = {
          x: event.clientX,
          y: event.clientY,
          width: element.width,
          height: element.height,
        };
        const move = (moveEvent: globalThis.PointerEvent) => {
          if (!start.current) return;
          const ratio = start.current.width / start.current.height;
          const width = Math.max(80, start.current.width + moveEvent.clientX - start.current.x);
          onResize({ width, height: Math.max(60, width / ratio) });
        };
        const up = () => {
          start.current = null;
          window.removeEventListener('pointermove', move);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up, { once: true });
      }}
      aria-label="Resize selected element"
    />
  );
}
