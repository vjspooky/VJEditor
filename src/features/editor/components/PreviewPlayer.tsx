import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import { formatClock } from '@/utils/format';
import { aspectToCss } from '@/utils/format';
import { itemAtPlayhead } from '@/utils/timeline';
import {
  Maximize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

export function PreviewPlayer() {
  const { state, dispatch, durationMs, selected } = useEditor();
  const { playheadMs, isPlaying, volume } = state.ui;
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playheadRef = useRef(playheadMs);
  useEffect(() => {
    playheadRef.current = playheadMs;
  }, [playheadMs]);

  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      const next = playheadRef.current + delta;
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
  }, [dispatch, durationMs, isPlaying]);

  const video = itemAtPlayhead(state.snapshot.tracks, playheadMs, 'video');
  const text = itemAtPlayhead(state.snapshot.tracks, playheadMs, 'text');
  const caption = itemAtPlayhead(state.snapshot.tracks, playheadMs, 'caption');
  const activeVideo = video?.kind === 'video' ? video : undefined;
  const activeText = text?.kind === 'text' ? text : undefined;
  const activeCaption = caption?.kind === 'caption' ? caption : undefined;
  const activeVideoAsset = activeVideo?.mediaId
    ? state.snapshot.media.find((asset) => asset.id === activeVideo.mediaId)
    : undefined;

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !activeVideo || activeVideoAsset?.type !== 'video' || !activeVideoAsset.src) {
      return;
    }

    const time = Math.max(0, (playheadMs - activeVideo.startMs) / 1000);
    element.volume = volume / 100;
    element.muted = volume === 0;
    if (Math.abs(element.currentTime - time) > 0.15) {
      element.currentTime = time;
    }

    if (isPlaying) {
      void element.play().catch(() => undefined);
    } else {
      element.pause();
    }
  }, [activeVideo, activeVideoAsset, isPlaying, playheadMs, volume]);

  function step(direction: -1 | 1) {
    dispatch({ type: 'set-playing', playing: false });
    dispatch({
      type: 'set-playhead',
      ms: Math.min(durationMs, Math.max(0, playheadMs + direction * (1000 / 30))),
    });
  }

  async function toggleFullscreen() {
    const node = frameRef.current;
    if (!node) return;
    if (!document.fullscreenElement) {
      await node.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-app">
      <div className="flex-1 min-h-0 grid place-items-center p-4">
        <div
          ref={frameRef}
          className="relative w-full max-w-[720px] max-h-full bg-black rounded-xl overflow-hidden border border-border"
          style={{ aspectRatio: aspectToCss(state.aspectRatio) }}
        >
          <div
            className="absolute inset-0 transition-opacity"
            style={{
              background: activeVideo?.thumbnailColor ?? '#111318',
              opacity: (activeVideo?.opacity ?? 100) / 100,
              transform: activeVideo
                ? `translate(${activeVideo.positionX}%, ${activeVideo.positionY}%) scale(${activeVideo.scale / 100}) rotate(${activeVideo.rotation}deg)`
                : undefined,
            }}
          />
            {activeVideoAsset?.type === 'video' && activeVideoAsset.src ? (
              <video
                ref={videoRef}
                src={activeVideoAsset.src}
                className="absolute inset-0 h-full w-full object-contain"
                style={{
                  opacity: (activeVideo?.opacity ?? 100) / 100,
                  transform: activeVideo
                    ? `translate(${activeVideo.positionX}%, ${activeVideo.positionY}%) scale(${activeVideo.scale / 100}) rotate(${activeVideo.rotation}deg)`
                    : undefined,
                }}
                playsInline
                preload="metadata"
              />
            ) : null}
          {activeText ? (
            <p
              className="absolute left-1/2 text-white drop-shadow-md px-4"
              style={{
                top: `${50 + activeText.positionY}%`,
                transform: `translate(-50%, -50%) translateX(${activeText.positionX}px)`,
                fontFamily: activeText.fontFamily,
                fontSize: `${activeText.fontSize * 0.45}px`,
                fontWeight: activeText.fontWeight,
                textAlign: activeText.align,
                color: activeText.color,
                width: '80%',
              }}
            >
              {activeText.text}
            </p>
          ) : null}
          {activeCaption ? (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm bg-black/70 px-3 py-1 rounded-md">
              {activeCaption.text}
            </p>
          ) : null}
          {!activeVideo && !activeText ? (
            <p className="absolute inset-0 grid place-items-center text-sm text-muted">
              {selected ? selected.name : 'No clip at playhead'}
            </p>
          ) : null}
        </div>
      </div>

      <div className="h-12 shrink-0 border-t border-border flex items-center gap-2 px-3 bg-app-elevated">
        <Button size="icon" variant="ghost" onClick={() => step(-1)} aria-label="Previous frame">
          <SkipBack size={16} />
        </Button>
        <Button
          size="icon"
          variant="primary"
          onClick={() => dispatch({ type: 'toggle-play' })}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => step(1)} aria-label="Next frame">
          <SkipForward size={16} />
        </Button>
        <span className="text-xs tabular-nums text-muted ml-2">
          {formatClock(playheadMs)} / {formatClock(durationMs)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Volume2 size={14} className="text-muted" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => dispatch({ type: 'set-volume', volume: Number(e.target.value) })}
            className="w-24 accent-accent"
            aria-label="Volume"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => void toggleFullscreen()}
            aria-label="Fullscreen"
          >
            <Maximize2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
