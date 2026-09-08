import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { EditingMode, FrameRate, TimelineItem, TimelineTrack, TrackKind } from '@/types';
import { cx } from '@/utils/cx';
import { formatClock } from '@/utils/format';
import { formatDeltaTime, formatPreciseTime } from '@/utils/frame';
import { findItem, findTrackForItem, isCompatibleTrack, snapTimeWithGuides } from '@/utils/timeline';
import {
  Copy,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Magnet,
  Minus,
  Plus,
  Scissors,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ReplaceMediaModal } from './ReplaceMediaModal';
import { TimelineContextMenu, type ContextMenuPosition } from './TimelineContextMenu';

const TRACK_COLORS: Record<TrackKind, string> = {
  video: 'bg-track-video/90 border-blue-400/40 hover:border-blue-400',
  audio: 'bg-track-audio/90 border-emerald-400/40 hover:border-emerald-400',
  text: 'bg-track-text/90 border-purple-400/40 hover:border-purple-400',
  caption: 'bg-track-caption/90 border-amber-400/40 hover:border-amber-400',
};

const FPS_OPTIONS: FrameRate[] = [24, 25, 30, 50, 60];

interface DragMoveState {
  type: 'move';
  initialItems: Array<{ id: string; startMs: number; trackId: string }>;
  primaryItemId: string;
  primaryInitialStartMs: number;
  initialPointerX: number;
  initialPointerY: number;
  currentOffsetMs: number;
  currentOffsetPxY: number;
  targetTrackId?: string;
  snappedGuideMs: number | null;
}

interface DragTrimState {
  type: 'trim';
  itemId: string;
  edge: 'start' | 'end';
  initialStartMs: number;
  initialDurationMs: number;
  initialPointerX: number;
  currentDeltaMs: number;
  snappedGuideMs: number | null;
}

type ActiveDrag = DragMoveState | DragTrimState;

interface MarqueeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function Timeline() {
  const { state, dispatch, durationMs } = useEditor();
  const {
    playheadMs,
    selectedItemId,
    selectedItemIds,
    zoom,
    editingMode,
    rippleEnabled,
    frameSnapEnabled,
    splitAllTracks,
    fps,
  } = state.ui;

  const [snapEnabled, setSnapEnabled] = useState(true);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [replaceClip, setReplaceClip] = useState<TimelineItem | null>(null);
  const [cutHoverTime, setCutHoverTime] = useState<{ itemId: string; timeMs: number } | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const tracksContainerRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = zoom;
  const totalTimelineWidth = Math.max(900, 140 + (durationMs / 1000 + 8) * pixelsPerSecond);

  const selectedClip = selectedItemId ? findItem(state.snapshot.tracks, selectedItemId) : undefined;
  const canSplitSelected = Boolean(
    selectedClip &&
      !selectedClip.locked &&
      playheadMs > selectedClip.startMs &&
      playheadMs < selectedClip.startMs + selectedClip.durationMs,
  );

  // Playhead seeking on ruler / empty track area
  const seekFromClientX = useCallback(
    (clientX: number) => {
      const rect = scrollerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clientX - rect.left + scrollerRef.current!.scrollLeft - 120;
      const targetSec = Math.max(0, x / pixelsPerSecond);
      const targetMs = targetSec * 1000;
      dispatch({ type: 'set-playhead', ms: targetMs });
    },
    [dispatch, pixelsPerSecond],
  );

  // Global Pointer Events for Dragging & Marquee
  useEffect(() => {
    if (!activeDrag && !marquee) return;

    function handlePointerMove(e: globalThis.PointerEvent) {
      if (activeDrag) {
        if (activeDrag.type === 'move') {
          const deltaX = e.clientX - activeDrag.initialPointerX;
          const deltaY = e.clientY - activeDrag.initialPointerY;
          const rawDeltaMs = (deltaX * 1000) / pixelsPerSecond;

          // Target time for primary item
          const targetStartMs = activeDrag.primaryInitialStartMs + rawDeltaMs;
          const snapResult = snapTimeWithGuides(
            targetStartMs,
            state.snapshot.tracks,
            activeDrag.initialItems.map((i) => i.id),
            playheadMs,
            snapEnabled,
            frameSnapEnabled,
            fps,
          );

          const finalDeltaMs = snapResult.snappedMs - activeDrag.primaryInitialStartMs;

          // Detect track under cursor for cross-track dragging
          let targetTrackId: string | undefined = undefined;
          const trackElements = tracksContainerRef.current?.querySelectorAll('[data-track-id]');
          if (trackElements) {
            trackElements.forEach((el) => {
              const r = el.getBoundingClientRect();
              if (e.clientY >= r.top && e.clientY <= r.bottom) {
                targetTrackId = el.getAttribute('data-track-id') ?? undefined;
              }
            });
          }

          setActiveDrag((prev) =>
            prev && prev.type === 'move'
              ? {
                  ...prev,
                  currentOffsetMs: finalDeltaMs,
                  currentOffsetPxY: deltaY,
                  targetTrackId,
                  snappedGuideMs: snapResult.guideMs,
                }
              : prev,
          );
        } else if (activeDrag.type === 'trim') {
          const deltaX = e.clientX - activeDrag.initialPointerX;
          const rawDeltaMs = (deltaX * 1000) / pixelsPerSecond;

          // Target point to snap: if start edge, snapping (startMs + deltaMs); if end edge, snapping (startMs + durationMs + deltaMs)
          const targetEdgeMs =
            activeDrag.edge === 'start'
              ? activeDrag.initialStartMs + rawDeltaMs
              : activeDrag.initialStartMs + activeDrag.initialDurationMs + rawDeltaMs;

          const snapResult = snapTimeWithGuides(
            targetEdgeMs,
            state.snapshot.tracks,
            [activeDrag.itemId],
            playheadMs,
            snapEnabled,
            frameSnapEnabled,
            fps,
          );

          let finalDeltaMs = rawDeltaMs;
          if (snapResult.guideMs !== null) {
            finalDeltaMs =
              activeDrag.edge === 'start'
                ? snapResult.snappedMs - activeDrag.initialStartMs
                : snapResult.snappedMs - (activeDrag.initialStartMs + activeDrag.initialDurationMs);
          }

          setActiveDrag((prev) =>
            prev && prev.type === 'trim'
              ? {
                  ...prev,
                  currentDeltaMs: finalDeltaMs,
                  snappedGuideMs: snapResult.guideMs,
                }
              : prev,
          );
        }
      } else if (marquee) {
        const scrollerRect = scrollerRef.current?.getBoundingClientRect();
        if (!scrollerRect) return;
        const currentX = e.clientX - scrollerRect.left + scrollerRef.current!.scrollLeft;
        const currentY = e.clientY - scrollerRect.top + scrollerRef.current!.scrollTop;
        setMarquee((prev) => (prev ? { ...prev, currentX, currentY } : null));
      }
    }

    function handlePointerUp() {
      if (activeDrag) {
        if (activeDrag.type === 'move') {
          const { initialItems, currentOffsetMs, targetTrackId, primaryItemId } = activeDrag;
          if (currentOffsetMs !== 0 || targetTrackId) {
            // If primary item changed track, check compatibility
            const primaryItem = findItem(state.snapshot.tracks, primaryItemId);
            const targetTrack = targetTrackId
              ? state.snapshot.tracks.find((t) => t.id === targetTrackId)
              : undefined;

            const canChangeTrack =
              primaryItem &&
              targetTrack &&
              isCompatibleTrack(targetTrack.kind, primaryItem.kind) &&
              !targetTrack.locked;

            const updates = initialItems.map((item) => ({
              itemId: item.id,
              startMs: Math.max(0, item.startMs + currentOffsetMs),
              targetTrackId: canChangeTrack && item.id === primaryItemId ? targetTrackId : undefined,
            }));

            dispatch({ type: 'move-items', updates });
          }
        } else if (activeDrag.type === 'trim') {
          const { itemId, edge, currentDeltaMs } = activeDrag;
          if (currentDeltaMs !== 0) {
            dispatch({ type: 'trim-item', itemId, edge, deltaMs: currentDeltaMs });
          }
        }
        setActiveDrag(null);
      }

      if (marquee) {
        // Calculate bounding box in timeline space and select enclosed clips
        const x1 = Math.min(marquee.startX, marquee.currentX);
        const x2 = Math.max(marquee.startX, marquee.currentX);
        const y1 = Math.min(marquee.startY, marquee.currentY);
        const y2 = Math.max(marquee.startY, marquee.currentY);

        const selectedIds: string[] = [];
        const trackElements = tracksContainerRef.current?.querySelectorAll('[data-track-id]');
        if (trackElements && scrollerRef.current) {
          const scrollerRect = scrollerRef.current.getBoundingClientRect();
          trackElements.forEach((trackEl) => {
            const trackRect = trackEl.getBoundingClientRect();
            const trackTop = trackRect.top - scrollerRect.top + scrollerRef.current!.scrollTop;
            const trackBottom = trackTop + trackRect.height;

            // Check if track intersects Y
            if (y2 >= trackTop && y1 <= trackBottom) {
              const clipElements = trackEl.querySelectorAll('[data-clip-id]');
              clipElements.forEach((clipEl) => {
                const clipId = clipEl.getAttribute('data-clip-id');
                const clipRect = clipEl.getBoundingClientRect();
                const clipLeft = clipRect.left - scrollerRect.left + scrollerRef.current!.scrollLeft;
                const clipRight = clipLeft + clipRect.width;

                if (x2 >= clipLeft && x1 <= clipRight && clipId) {
                  selectedIds.push(clipId);
                }
              });
            }
          });
        }

        if (selectedIds.length > 0) {
          dispatch({ type: 'select-multiple', itemIds: selectedIds });
        }
        setMarquee(null);
      }
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDrag, dispatch, fps, frameSnapEnabled, marquee, pixelsPerSecond, playheadMs, snapEnabled, state.snapshot.tracks]);

  // Start Move Drag
  const handleStartMove = useCallback(
    (item: TimelineItem, e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      const track = findTrackForItem(state.snapshot.tracks, item.id);
      if (track?.locked || item.locked) return;

      // Select item or keep multi-selection if already selected
      const isAlreadySelected = selectedItemIds.includes(item.id);
      const targetIds = isAlreadySelected ? selectedItemIds : [item.id];
      if (!isAlreadySelected) {
        dispatch({ type: 'select', itemId: item.id });
      }

      const allItems = state.snapshot.tracks.flatMap((t) => t.items);
      const movingItems = allItems.filter((i) => targetIds.includes(i.id) && !i.locked);

      setActiveDrag({
        type: 'move',
        initialItems: movingItems.map((i) => ({ id: i.id, startMs: i.startMs, trackId: i.trackId })),
        primaryItemId: item.id,
        primaryInitialStartMs: item.startMs,
        initialPointerX: e.clientX,
        initialPointerY: e.clientY,
        currentOffsetMs: 0,
        currentOffsetPxY: 0,
        snappedGuideMs: null,
      });
    },
    [dispatch, selectedItemIds, state.snapshot.tracks],
  );

  // Start Trim Drag
  const handleStartTrim = useCallback(
    (item: TimelineItem, edge: 'start' | 'end', e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      const track = findTrackForItem(state.snapshot.tracks, item.id);
      if (track?.locked || item.locked) return;

      dispatch({ type: 'select', itemId: item.id });

      setActiveDrag({
        type: 'trim',
        itemId: item.id,
        edge,
        initialStartMs: item.startMs,
        initialDurationMs: item.durationMs,
        initialPointerX: e.clientX,
        currentDeltaMs: 0,
        snappedGuideMs: null,
      });
    },
    [dispatch, state.snapshot.tracks],
  );

  // Start Marquee Selection on empty space
  const handleStartMarquee = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || activeDrag) return;
      // Do not marquee if clicking on playhead or clip
      if ((e.target as HTMLElement).closest('[data-clip-id]') || (e.target as HTMLElement).closest('[data-ruler]')) {
        return;
      }
      const scrollerRect = scrollerRef.current?.getBoundingClientRect();
      if (!scrollerRect) return;

      const startX = e.clientX - scrollerRect.left + scrollerRef.current!.scrollLeft;
      const startY = e.clientY - scrollerRect.top + scrollerRef.current!.scrollTop;

      dispatch({ type: 'clear-selection' });
      setMarquee({ startX, startY, currentX: startX, currentY: startY });
    },
    [activeDrag, dispatch],
  );

  // Cut Mode Click Handler
  const handleClipCutClick = useCallback(
    (item: TimelineItem, e: React.MouseEvent<HTMLElement>) => {
      const track = findTrackForItem(state.snapshot.tracks, item.id);
      if (track?.locked || item.locked) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const relativePx = e.clientX - rect.left;
      const relativeMs = (relativePx * 1000) / pixelsPerSecond;
      const splitTimeMs = item.startMs + relativeMs;

      dispatch({ type: 'select', itemId: item.id });
      dispatch({ type: 'set-playhead', ms: splitTimeMs });
      dispatch({ type: 'split-clip-at-time', itemId: item.id, splitTimeMs });
    },
    [dispatch, pixelsPerSecond, state.snapshot.tracks],
  );

  // Right Click Context Menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, clip?: TimelineItem) => {
      e.preventDefault();
      e.stopPropagation();
      if (clip) {
        dispatch({ type: 'select', itemId: clip.id });
      }
      setContextMenu({ x: e.clientX, y: e.clientY, clip });
    },
    [dispatch],
  );

  return (
    <section className="h-[300px] sm:h-[320px] shrink-0 border-t border-border bg-app-elevated flex flex-col select-none relative">
      {/* Control Header */}
      <div className="h-10 shrink-0 px-3 flex items-center gap-1.5 border-b border-border bg-panel overflow-x-auto">
        <span className="text-xs font-semibold mr-1">Timeline</span>

        {/* Editing Modes */}
        <div className="flex items-center bg-app rounded-lg p-0.5 border border-border">
          {(['select', 'trim', 'cut'] as EditingMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => dispatch({ type: 'set-editing-mode', mode })}
              className={cx(
                'px-2 py-1 rounded text-xs capitalize font-medium transition cursor-pointer',
                editingMode === mode
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted hover:text-fg',
              )}
            >
              {mode} <span className="text-[9px] opacity-70">({mode === 'select' ? 'V' : mode === 'trim' ? 'T' : 'C'})</span>
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Track creation */}
        <Button size="sm" onClick={() => dispatch({ type: 'add-track', kind: 'video' })}>
          <Plus size={12} />
          Video track
        </Button>
        <Button size="sm" onClick={() => dispatch({ type: 'add-track', kind: 'audio' })}>
          <Plus size={12} />
          Audio track
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Split and Duplicate buttons */}
        <Button
          size="icon"
          variant="ghost"
          disabled={!canSplitSelected && !splitAllTracks}
          onClick={() => {
            if (splitAllTracks) dispatch({ type: 'split-all-at-playhead' });
            else dispatch({ type: 'split-selected' });
          }}
          aria-label="Split clip (S)"
          title="Split clip at playhead (S)"
        >
          <Scissors size={14} />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          disabled={!selectedItemId}
          onClick={() => dispatch({ type: 'duplicate-selected' })}
          aria-label="Duplicate selected (Ctrl+D)"
          title="Duplicate selected (Ctrl+D)"
        >
          <Copy size={14} />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          disabled={!selectedItemId}
          onClick={() => dispatch({ type: 'delete-selected' })}
          aria-label="Delete selected (Del)"
          title="Delete selected (Del)"
        >
          <Trash2 size={14} />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Snapping, Ripple, Frame Snap, Split All */}
        <Button
          size="sm"
          variant={snapEnabled ? 'subtle' : 'ghost'}
          onClick={() => setSnapEnabled((v) => !v)}
          title="Toggle timeline snapping"
        >
          <Magnet size={12} />
          Snap {snapEnabled ? 'On' : 'Off'}
        </Button>

        <Button
          size="sm"
          variant={rippleEnabled ? 'subtle' : 'ghost'}
          onClick={() => dispatch({ type: 'toggle-ripple' })}
          title="When enabled, edits shift subsequent clips on track"
        >
          Ripple {rippleEnabled ? 'On' : 'Off'}
        </Button>

        <Button
          size="sm"
          variant={frameSnapEnabled ? 'subtle' : 'ghost'}
          onClick={() => dispatch({ type: 'toggle-frame-snap' })}
          title="Snap playhead and edits to exact frame boundaries"
        >
          Frame Snap
        </Button>

        <Button
          size="sm"
          variant={splitAllTracks ? 'subtle' : 'ghost'}
          onClick={() => dispatch({ type: 'toggle-split-all' })}
          title="Split all tracks simultaneously"
        >
          Split All
        </Button>

        {/* FPS selector */}
        <div className="flex items-center gap-1 ml-1">
          <span className="text-[11px] text-muted">FPS:</span>
          <select
            value={fps}
            onChange={(e) => dispatch({ type: 'set-fps', fps: Number(e.target.value) as FrameRate })}
            className="h-7 px-1.5 rounded-md border border-border bg-app text-xs text-fg outline-none cursor-pointer"
          >
            {FPS_OPTIONS.map((rate) => (
              <option key={rate} value={rate}>
                {rate} fps
              </option>
            ))}
          </select>
        </div>

        {/* Zoom controls */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => dispatch({ type: 'set-zoom', zoom: zoom - 8 })}
            aria-label="Zoom out"
          >
            <Minus size={14} />
          </Button>
          <span className="w-10 text-center text-[11px] font-mono text-muted">{zoom}%</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => dispatch({ type: 'set-zoom', zoom: zoom + 8 })}
            aria-label="Zoom in"
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* Timeline Scrollable Area */}
      <div
        ref={scrollerRef}
        className={cx(
          'flex-1 overflow-auto relative',
          editingMode === 'cut' ? 'cursor-crosshair' : 'cursor-default',
        )}
        onPointerDown={handleStartMarquee}
        onContextMenu={(e) => handleContextMenu(e)}
      >
        <div className="relative min-h-full" style={{ width: totalTimelineWidth }}>
          {/* Ruler */}
          <TimeRuler
            durationMs={durationMs}
            zoom={pixelsPerSecond}
            fps={fps}
            onSeek={seekFromClientX}
          />

          {/* Vertical Visual Snap Guide Line */}
          {activeDrag?.snappedGuideMs !== null && activeDrag?.snappedGuideMs !== undefined ? (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(250,204,21,0.8)]"
              style={{ left: 120 + (activeDrag.snappedGuideMs / 1000) * pixelsPerSecond }}
            >
              <span className="absolute -top-1 -left-1.5 px-1 py-0.2 rounded bg-yellow-400 text-[9px] font-mono text-black font-bold">
                {formatPreciseTime(activeDrag.snappedGuideMs / 1000)}
              </span>
            </div>
          ) : null}

          {/* Red Playhead Line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-accent z-30 pointer-events-none"
            style={{ left: 120 + (playheadMs / 1000) * pixelsPerSecond }}
          >
            <div className="absolute -top-0 -left-2 h-4 w-4 bg-accent rounded-b-sm rotate-45 transform origin-center shadow-md flex items-center justify-center pointer-events-auto cursor-ew-resize">
              <span className="h-1.5 w-1.5 bg-white rounded-full" />
            </div>
          </div>

          {/* Tracks List */}
          <div ref={tracksContainerRef} className="pb-8">
            {state.snapshot.tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                state={state}
                zoom={pixelsPerSecond}
                fps={fps}
                selectedItemIds={selectedItemIds}
                activeDrag={activeDrag}
                editingMode={editingMode}
                cutHoverTime={cutHoverTime}
                onSelect={(id, additive) =>
                  dispatch({ type: additive ? 'toggle-select' : 'select', itemId: id })
                }
                onStartMove={handleStartMove}
                onStartTrim={handleStartTrim}
                onCutClick={handleClipCutClick}
                onCutHover={(itemId, timeMs) => setCutHoverTime(itemId ? { itemId, timeMs } : null)}
                onContextMenu={handleContextMenu}
                onTrackAction={(patch) =>
                  dispatch({ type: 'update-track', trackId: track.id, patch })
                }
              />
            ))}
          </div>

          {/* Empty timeline prompt */}
          {!state.snapshot.tracks.some((track) => track.items.length) ? (
            <div className="absolute left-32 right-0 top-20 text-center text-xs text-muted">
              Timeline is empty. Drag media from the Media panel to begin editing.
            </div>
          ) : null}

          {/* Marquee Selection Rectangle */}
          {marquee ? (
            <div
              className="absolute border border-accent bg-accent/20 pointer-events-none z-40 rounded"
              style={{
                left: Math.min(marquee.startX, marquee.currentX),
                top: Math.min(marquee.startY, marquee.currentY),
                width: Math.abs(marquee.currentX - marquee.startX),
                height: Math.abs(marquee.currentY - marquee.startY),
              }}
            />
          ) : null}
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="h-6 px-3 text-[11px] text-muted border-t border-border bg-panel flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>
            Playhead: <strong className="font-mono text-fg">{formatPreciseTime(playheadMs / 1000)}</strong>
          </span>
          <span>
            FPS: <strong className="text-fg">{fps}</strong>
          </span>
          <span>
            Mode: <strong className="capitalize text-fg">{editingMode}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Total: <strong className="font-mono text-fg">{formatClock(durationMs)}</strong>
          </span>
          <span>
            Selected: <strong className="text-fg">{selectedItemIds.length}</strong>
          </span>
        </div>
      </div>

      {/* Context Menu */}
      <TimelineContextMenu
        position={contextMenu}
        hasClipboard={state.clipboard.length > 0}
        canSplit={Boolean(selectedClip && !selectedClip.locked)}
        onClose={() => setContextMenu(null)}
        onCut={() => dispatch({ type: 'cut-selected' })}
        onCopy={() => dispatch({ type: 'copy-selected' })}
        onPaste={() => dispatch({ type: 'paste-clips' })}
        onSplit={() => dispatch({ type: 'split-selected' })}
        onDuplicate={() => dispatch({ type: 'duplicate-selected' })}
        onDelete={() => dispatch({ type: 'delete-selected' })}
        onRippleDelete={() => dispatch({ type: 'ripple-delete-selected' })}
        onReplaceMedia={() => {
          if (contextMenu?.clip) setReplaceClip(contextMenu.clip);
        }}
        onToggleMute={() => {
          if (contextMenu?.clip) {
            dispatch({
              type: 'update-item',
              itemId: contextMenu.clip.id,
              patch: { muted: !contextMenu.clip.muted },
            });
          }
        }}
        onToggleLock={() => {
          if (contextMenu?.clip) {
            dispatch({
              type: 'update-item',
              itemId: contextMenu.clip.id,
              patch: { locked: !contextMenu.clip.locked },
            });
          }
        }}
        onOpenProperties={() => {
          // Focuses properties inspector
        }}
      />

      {/* Replace Media Modal */}
      {replaceClip ? (
        <ReplaceMediaModal
          clip={replaceClip}
          onClose={() => setReplaceClip(null)}
        />
      ) : null}
    </section>
  );
}

// TrackRow component
interface TrackRowProps {
  track: TimelineTrack;
  state: ReturnType<typeof useEditor>['state'];
  zoom: number;
  fps: FrameRate;
  selectedItemIds: string[];
  activeDrag: ActiveDrag | null;
  editingMode: EditingMode;
  cutHoverTime: { itemId: string; timeMs: number } | null;
  onSelect: (id: string, additive: boolean) => void;
  onStartMove: (item: TimelineItem, e: PointerEvent<HTMLElement>) => void;
  onStartTrim: (item: TimelineItem, edge: 'start' | 'end', e: PointerEvent<HTMLElement>) => void;
  onCutClick: (item: TimelineItem, e: React.MouseEvent<HTMLElement>) => void;
  onCutHover: (itemId: string, timeMs: number) => void;
  onContextMenu: (e: React.MouseEvent, clip?: TimelineItem) => void;
  onTrackAction: (patch: Partial<TimelineTrack>) => void;
}

const TrackRow = memo(function TrackRow({
  track,
  state,
  zoom,
  selectedItemIds,
  activeDrag,
  editingMode,
  cutHoverTime,
  onSelect,
  onStartMove,
  onStartTrim,
  onCutClick,
  onCutHover,
  onContextMenu,
  onTrackAction,
}: TrackRowProps) {
  const isTargetOfDrag =
    activeDrag?.type === 'move' && activeDrag.targetTrackId === track.id;

  return (
    <div
      data-track-id={track.id}
      className={cx(
        'flex h-16 border-b border-border/70 relative transition-colors',
        isTargetOfDrag ? 'bg-accent/10 ring-1 ring-accent inset-0' : '',
      )}
    >
      {/* Sticky Left Header */}
      <div className="w-[120px] shrink-0 sticky left-0 z-20 bg-panel border-r border-border px-2.5 flex items-center justify-between shadow-sm">
        <div className="min-w-0 flex-1 pr-1">
          <p className="text-xs font-semibold truncate text-fg">{track.name}</p>
          <p className="text-[10px] text-muted capitalize tracking-tight">{track.kind}</p>
        </div>

        <div className="flex items-center gap-1 text-muted">
          <button
            type="button"
            onClick={() => onTrackAction({ hidden: !track.hidden })}
            aria-label={track.hidden ? 'Show track' : 'Hide track'}
            className="hover:text-fg cursor-pointer p-0.5"
            title={track.hidden ? 'Show track' : 'Hide track'}
          >
            {track.hidden ? <EyeOff size={13} className="text-danger" /> : <Eye size={13} />}
          </button>

          <button
            type="button"
            onClick={() => onTrackAction({ locked: !track.locked })}
            aria-label={track.locked ? 'Unlock track' : 'Lock track'}
            className="hover:text-fg cursor-pointer p-0.5"
            title={track.locked ? 'Unlock track' : 'Lock track'}
          >
            {track.locked ? <Lock size={13} className="text-amber-400" /> : <LockOpen size={13} />}
          </button>

          {track.kind === 'audio' ? (
            <button
              type="button"
              onClick={() => onTrackAction({ muted: !track.muted })}
              aria-label={track.muted ? 'Unmute track' : 'Mute track'}
              className="hover:text-fg cursor-pointer p-0.5"
              title={track.muted ? 'Unmute track' : 'Mute track'}
            >
              {track.muted ? <VolumeX size={13} className="text-danger" /> : <Volume2 size={13} />}
            </button>
          ) : null}
        </div>
      </div>

      {/* Track Lane */}
      <div className="relative flex-1 h-full">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-app/30 pointer-events-none" />

        {track.items.map((item) => {
          const isSelected = selectedItemIds.includes(item.id);
          const media = item.mediaId
            ? state.snapshot.media.find((asset) => asset.id === item.mediaId)
            : undefined;

          return (
            <ClipBlock
              key={item.id}
              item={item}
              track={track}
              zoom={zoom}
              selected={isSelected}
              activeDrag={activeDrag}
              editingMode={editingMode}
              cutHoverTime={cutHoverTime?.itemId === item.id ? cutHoverTime.timeMs : null}
              media={media}
              onSelect={onSelect}
              onStartMove={onStartMove}
              onStartTrim={onStartTrim}
              onCutClick={onCutClick}
              onCutHover={onCutHover}
              onContextMenu={onContextMenu}
            />
          );
        })}
      </div>
    </div>
  );
});

// ClipBlock component
interface ClipBlockProps {
  item: TimelineItem;
  track: TimelineTrack;
  zoom: number;
  selected: boolean;
  activeDrag: ActiveDrag | null;
  editingMode: EditingMode;
  cutHoverTime: number | null;
  media?: { type: string; thumbnailColor: string; name: string; src?: string; url?: string; durationMs?: number };
  onSelect: (id: string, additive: boolean) => void;
  onStartMove: (item: TimelineItem, e: PointerEvent<HTMLElement>) => void;
  onStartTrim: (item: TimelineItem, edge: 'start' | 'end', e: PointerEvent<HTMLElement>) => void;
  onCutClick: (item: TimelineItem, e: React.MouseEvent<HTMLElement>) => void;
  onCutHover: (itemId: string, timeMs: number) => void;
  onContextMenu: (e: React.MouseEvent, clip?: TimelineItem) => void;
}

const ClipBlock = memo(function ClipBlock({
  item,
  track,
  zoom,
  selected,
  activeDrag,
  editingMode,
  cutHoverTime,
  media,
  onSelect,
  onStartMove,
  onStartTrim,
  onCutClick,
  onCutHover,
  onContextMenu,
}: ClipBlockProps) {
  // Compute transient preview position and duration during drag
  let renderStartMs = item.startMs;
  let renderDurationMs = item.durationMs;

  if (activeDrag) {
    if (activeDrag.type === 'move') {
      const isMovingThis = activeDrag.initialItems.some((i) => i.id === item.id);
      if (isMovingThis) {
        renderStartMs = Math.max(0, item.startMs + activeDrag.currentOffsetMs);
      }
    } else if (activeDrag.type === 'trim' && activeDrag.itemId === item.id) {
      if (activeDrag.edge === 'start') {
        const targetStart = Math.max(0, item.startMs + activeDrag.currentDeltaMs);
        renderDurationMs = Math.max(100, item.durationMs - (targetStart - item.startMs));
        renderStartMs = targetStart;
      } else {
        renderDurationMs = Math.max(100, item.durationMs + activeDrag.currentDeltaMs);
      }
    }
  }

  const leftPx = (renderStartMs / 1000) * zoom;
  const widthPx = Math.max(30, (renderDurationMs / 1000) * zoom);

  const isLocked = Boolean(item.locked || track.locked);
  const colorClass = TRACK_COLORS[track.kind];

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (editingMode === 'cut') {
      onCutClick(item, e);
      return;
    }

    if (editingMode === 'trim') {
      // Determine nearest edge
      const rect = e.currentTarget.getBoundingClientRect();
      const edge = e.clientX - rect.left < rect.width / 2 ? 'start' : 'end';
      onStartTrim(item, edge, e);
      return;
    }

    // Select mode
    if (e.shiftKey) {
      onSelect(item.id, true);
    } else {
      onStartMove(item, e);
    }
  };

  return (
    <button
      type="button"
      data-clip-id={item.id}
      onClick={(e) => {
        e.stopPropagation();
        if (editingMode === 'cut') {
          onCutClick(item, e);
        } else {
          onSelect(item.id, e.shiftKey);
        }
      }}
      onPointerDown={handlePointerDown}
      onMouseMove={(e) => {
        if (editingMode === 'cut') {
          const rect = e.currentTarget.getBoundingClientRect();
          const relativeMs = ((e.clientX - rect.left) * 1000) / zoom;
          onCutHover(item.id, item.startMs + relativeMs);
        }
      }}
      onMouseLeave={() => {
        if (editingMode === 'cut') onCutHover('', 0);
      }}
      onContextMenu={(e) => onContextMenu(e, item)}
      className={cx(
        'absolute top-2 h-12 rounded-lg border text-left text-xs text-white overflow-hidden touch-none group transition-shadow',
        colorClass,
        selected ? 'ring-2 ring-accent border-white shadow-lg z-10' : 'shadow-sm z-0',
        isLocked ? 'opacity-65 cursor-not-allowed' : editingMode === 'cut' ? 'cursor-crosshair' : 'cursor-grab',
        item.hidden ? 'opacity-30' : '',
      )}
      style={{
        left: leftPx,
        width: widthPx,
      }}
    >
      {/* Background Media Thumbnail */}
      {media?.type === 'image' && (media.src || media.url) ? (
        <img
          src={media.src ?? media.url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 pointer-events-none"
        />
      ) : media?.type === 'video' && (media.src || media.url) ? (
        <video
          src={media.src ?? media.url}
          muted
          className="absolute inset-0 h-full w-full object-cover opacity-35 pointer-events-none"
        />
      ) : null}

      {/* Header Info */}
      <div className="relative z-10 px-2 py-0.5 flex items-center justify-between text-[11px] font-medium bg-black/40 backdrop-blur-[2px]">
        <span className="truncate">{item.name}</span>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {item.muted ? <VolumeX size={10} className="text-danger" /> : null}
          {item.locked ? <Lock size={10} className="text-amber-400" /> : null}
          {item.hidden ? <EyeOff size={10} className="text-muted" /> : null}
        </div>
      </div>

      {/* Duration Label */}
      <div className="relative z-10 px-2 pt-0.5 text-[10px] text-white/80 font-mono">
        {formatPreciseTime(renderDurationMs / 1000)}
      </div>

      {/* Live Trimming Tooltip */}
      {activeDrag?.type === 'trim' && activeDrag.itemId === item.id ? (
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-accent text-white text-[10px] font-mono shadow-md z-30 whitespace-nowrap"
        >
          {formatPreciseTime(renderDurationMs / 1000)} ({formatDeltaTime(activeDrag.currentDeltaMs)})
        </div>
      ) : null}

      {/* Cut indicator line when hovering in Cut Mode */}
      {editingMode === 'cut' && cutHoverTime !== null ? (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-20 shadow-[0_0_6px_rgba(239,68,68,0.9)]"
          style={{ left: ((cutHoverTime - renderStartMs) / 1000) * zoom }}
        >
          <span className="absolute -top-4 -left-3 text-[9px] text-red-500 font-bold">✂</span>
        </div>
      ) : null}

      {/* Left Trim Handle */}
      {!isLocked && (
        <span
          data-trim-handle="start"
          aria-label="Trim start"
          title="Drag to trim start edge"
          onPointerDown={(e) => {
            e.stopPropagation();
            onStartTrim(item, 'start', e);
          }}
          className="absolute inset-y-0 left-0 w-2.5 bg-white/20 hover:bg-white/60 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
        >
          <span className="w-0.5 h-3 bg-white/90 rounded-full" />
        </span>
      )}

      {/* Right Trim Handle */}
      {!isLocked && (
        <span
          data-trim-handle="end"
          aria-label="Trim end"
          title="Drag to trim end edge"
          onPointerDown={(e) => {
            e.stopPropagation();
            onStartTrim(item, 'end', e);
          }}
          className="absolute inset-y-0 right-0 w-2.5 bg-white/20 hover:bg-white/60 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
        >
          <span className="w-0.5 h-3 bg-white/90 rounded-full" />
        </span>
      )}
    </button>
  );
});

// TimeRuler component
function TimeRuler({
  durationMs,
  zoom,
  onSeek,
}: {
  durationMs: number;
  zoom: number;
  fps: FrameRate;
  onSeek: (clientX: number) => void;
}) {
  const totalSeconds = Math.ceil(durationMs / 1000) + 10;
  const majorStepSeconds = zoom < 30 ? 10 : zoom < 60 ? 5 : zoom < 100 ? 2 : 1;

  return (
    <div
      data-ruler="true"
      onClick={(e) => onSeek(e.clientX)}
      className="relative h-7 border-b border-border bg-panel text-[10px] font-mono text-muted cursor-pointer select-none"
    >
      {Array.from({ length: Math.floor(totalSeconds / majorStepSeconds) + 1 }, (_, i) => {
        const second = i * majorStepSeconds;
        const leftPx = 120 + second * zoom;

        return (
          <div key={second} className="absolute top-0 bottom-0" style={{ left: leftPx }}>
            <div className="h-2 w-px bg-border mt-auto" />
            <span className="absolute top-1 -translate-x-1/2 whitespace-nowrap text-subtle">
              {formatPreciseTime(second)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
