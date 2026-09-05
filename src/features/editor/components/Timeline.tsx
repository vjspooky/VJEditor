import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { TimelineItem, TrackKind } from '@/types';
import { formatTimecode } from '@/utils/format';
import { cx } from '@/utils/cx';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';

const TRACK_COLORS: Record<TrackKind, string> = {
  video: 'bg-track-video',
  audio: 'bg-track-audio',
  text: 'bg-track-text',
  caption: 'bg-track-caption',
};

export function Timeline() {
  const { state, dispatch, durationMs } = useEditor();
  const { zoom, playheadMs, selectedItemId } = state.ui;
  const scroller = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{
    itemId: string;
    mode: 'move' | 'trim';
    edge?: 'start' | 'end';
    startMs: number;
    durationMs: number;
    pointerStartX: number;
    offsetPx: number;
  } | null>(null);
  const width = Math.max(800, (durationMs / 1000) * zoom + 120);

  useEffect(() => {
    if (!drag) return;

    function onPointerMove(event: globalThis.PointerEvent) {
      setDrag((current) =>
        current
          ? {
              ...current,
              offsetPx: event.clientX - current.pointerStartX,
            }
          : current,
      );
    }

    function onPointerUp() {
      const current = drag;
      if (!current) return;
      if (current.mode === 'move') {
        dispatch({
          type: 'move-item',
          itemId: current.itemId,
          startMs: current.startMs + (current.offsetPx * 1000) / zoom,
        });
      } else {
        dispatch({
          type: 'trim-item',
          itemId: current.itemId,
          edge: current.edge ?? 'end',
          deltaMs: (current.offsetPx * 1000) / zoom,
        });
      }
      setDrag(null);
    }

    if (!drag) return;

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dispatch, drag, zoom]);

  function seekFromEvent(event: MouseEvent<HTMLDivElement>) {
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left + node.scrollLeft - 88;
    const ms = (x / zoom) * 1000;
    dispatch({ type: 'set-playhead', ms: Math.min(durationMs, Math.max(0, ms)) });
  }

  return (
    <section className="h-[220px] sm:h-[240px] shrink-0 border-t border-border bg-app-elevated flex flex-col">
      <div className="h-9 px-3 flex items-center justify-between border-b border-border">
        <p className="text-xs text-muted">Timeline</p>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => dispatch({ type: 'set-zoom', zoom: zoom - 8 })}>
            <Minus size={14} />
          </Button>
          <span className="text-[11px] tabular-nums text-muted w-10 text-center">{zoom}</span>
          <Button size="icon" variant="ghost" onClick={() => dispatch({ type: 'set-zoom', zoom: zoom + 8 })}>
            <Plus size={14} />
          </Button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex-1 overflow-auto"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-clip]')) return;
          seekFromEvent(e);
        }}
      >
        <div className="relative min-h-full" style={{ width }}>
          <TimeRuler durationMs={durationMs} zoom={zoom} />
          <div
            className="absolute top-6 bottom-0 w-px bg-accent z-10 pointer-events-none"
            style={{ left: 88 + (playheadMs / 1000) * zoom }}
          >
            <span className="absolute -top-1 -left-1.5 h-3 w-3 rotate-45 bg-accent" />
          </div>
          {state.snapshot.tracks.map((track) => (
            <div key={track.id} className="flex h-12 border-b border-border/80">
              <div className="w-[88px] shrink-0 sticky left-0 z-[5] bg-panel border-r border-border px-2 flex items-center text-[11px] text-muted">
                {track.name}
                <span className="ml-1 uppercase opacity-60">{track.kind[0]}</span>
              </div>
              <div className="relative flex-1">
                {track.items.map((item) => (
                  <ClipBlock
                    key={item.id}
                    item={item}
                    zoom={zoom}
                    selected={item.id === selectedItemId}
                    onSelect={() => dispatch({ type: 'select', itemId: item.id })}
                    dragOffsetPx={drag?.itemId === item.id ? drag.offsetPx : 0}
                    dragState={drag?.itemId === item.id ? drag : null}
                    onDragStart={(event) => {
                      if (event.button !== 0) return;
                      event.preventDefault();
                      event.stopPropagation();
                      dispatch({ type: 'select', itemId: item.id });
                      setDrag({
                        itemId: item.id,
                        mode: 'move',
                        startMs: item.startMs,
                        durationMs: item.durationMs,
                        pointerStartX: event.clientX,
                        offsetPx: 0,
                      });
                    }}
                    onTrimStart={(edge, event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      dispatch({ type: 'select', itemId: item.id });
                      setDrag({
                        itemId: item.id,
                        mode: 'trim',
                        edge,
                        startMs: item.startMs,
                        durationMs: item.durationMs,
                        pointerStartX: event.clientX,
                        offsetPx: 0,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-6 px-3 text-[11px] text-muted flex items-center border-t border-border">
        Playhead {formatTimecode(playheadMs)}
      </div>
    </section>
  );
}

function TimeRuler({ durationMs, zoom }: { durationMs: number; zoom: number }) {
  const seconds = Math.ceil(durationMs / 1000);
  const marks = [];
  const step = zoom < 36 ? 5 : 1;
  for (let s = 0; s <= seconds; s += step) {
    marks.push(
      <span
        key={s}
        className="absolute top-0 text-[10px] text-subtle"
        style={{ left: 88 + s * zoom }}
      >
        {s}s
      </span>,
    );
  }
  return <div className="relative h-6 border-b border-border">{marks}</div>;
}

function ClipBlock({
  item,
  zoom,
  selected,
  onSelect,
  dragOffsetPx,
  dragState,
  onDragStart,
  onTrimStart,
}: {
  item: TimelineItem;
  zoom: number;
  selected: boolean;
  onSelect: () => void;
  dragOffsetPx: number;
  dragState: {
    mode: 'move' | 'trim';
    edge?: 'start' | 'end';
    startMs: number;
    durationMs: number;
  } | null;
  onDragStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onTrimStart: (edge: 'start' | 'end', event: PointerEvent<HTMLSpanElement>) => void;
}) {
  const deltaMs = (dragOffsetPx * 1000) / zoom;
  const previewStartMs =
    dragState?.mode === 'trim' && dragState.edge === 'start'
      ? Math.max(0, Math.min(item.startMs + item.durationMs - 100, item.startMs + deltaMs))
      : item.startMs;
  const previewDurationMs =
    dragState?.mode === 'trim'
      ? dragState.edge === 'start'
        ? item.durationMs + item.startMs - previewStartMs
        : Math.max(100, item.durationMs + deltaMs)
      : item.durationMs;

  return (
    <button
      type="button"
      data-clip="true"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragStart(event);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cx(
        'absolute top-1.5 h-9 rounded-md px-2 text-left text-[11px] truncate text-white cursor-grab border touch-none',
        TRACK_COLORS[item.kind],
        selected ? 'border-white/80' : 'border-black/20',
        dragOffsetPx !== 0 ? 'cursor-grabbing opacity-80' : '',
      )}
      style={{
        left: (previewStartMs / 1000) * zoom +
          (dragState?.mode === 'move' ? dragOffsetPx : 0),
        width: Math.max(28, (previewDurationMs / 1000) * zoom),
        userSelect: 'none',
      }}
    >
      <span
        className="absolute inset-y-0 left-0 w-2 cursor-ew-resize"
        onPointerDown={(event) => onTrimStart('start', event)}
        aria-label="Trim start"
      />
      {item.name}
      <span
        className="absolute inset-y-0 right-0 w-2 cursor-ew-resize"
        onPointerDown={(event) => onTrimStart('end', event)}
        aria-label="Trim end"
      />
    </button>
  );
}
