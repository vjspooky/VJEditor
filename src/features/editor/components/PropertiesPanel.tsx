import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { AnimatableProperty, Keyframe, TextAlign, TextAnimation, TextLayer, TimelineItem } from '@/types';
import { formatPreciseTime } from '@/utils/frame';
import { createId } from '@/utils/id';
import {
  Copy,
  Diamond,
  Eye,
  EyeOff,
  FileCode,
  Lock,
  LockOpen,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';
import { ReplaceMediaModal } from './ReplaceMediaModal';

const TEXT_ANIMATIONS: { value: TextAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade-in', label: 'Fade In' },
  { value: 'fade-out', label: 'Fade Out' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'pop', label: 'Pop' },
  { value: 'typewriter', label: 'Typewriter' },
];

const FONT_FAMILIES = ['Arial', 'Georgia', 'Helvetica', 'Impact', 'Montserrat', 'Oswald', 'Playfair Display', 'Roboto', 'Times New Roman', 'Verdana'];

export function PropertiesPanel() {
  const { state, dispatch, selected } = useEditor();
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);

  if (!selected) {
    return (
      <aside className="w-[280px] shrink-0 border-l border-border bg-app-elevated p-4 hidden lg:flex flex-col">
        <h2 className="text-xs uppercase tracking-wider text-muted">Clip Properties</h2>
        <div className="flex-1 grid place-items-center text-center p-6 text-xs text-muted">
          <div>
            <p className="font-medium text-fg mb-1">No Clip Selected</p>
            <p>Click on any clip in the timeline to view and adjust its properties.</p>
          </div>
        </div>
      </aside>
    );
  }

  const tracks = state.snapshot.tracks;
  const currentTrack = tracks.find((t) => t.id === selected.trackId);
  const compatibleTracks = tracks.filter((t) => {
    if (selected.kind === 'video') return t.kind === 'video';
    if (selected.kind === 'audio') return t.kind === 'audio';
    if (selected.kind === 'text') return t.kind === 'text';
    if (selected.kind === 'caption') return t.kind === 'caption';
    return false;
  });

  const mediaAsset = selected.mediaId
    ? state.snapshot.media.find((m) => m.id === selected.mediaId)
    : undefined;

  const patchItem = (patch: Partial<TimelineItem>) => {
    dispatch({ type: 'update-item', itemId: selected.id, patch });
  };

  const endMs = selected.startMs + selected.durationMs;
  const isLocked = Boolean(selected.locked || currentTrack?.locked);

  // Keyframe helpers
  const addKeyframeAtPlayhead = (property: AnimatableProperty, value: number) => {
    const timeMs = state.ui.playheadMs - selected.startMs;
    const kf: Keyframe = {
      id: createId('kf'),
      property,
      timeMs: Math.max(0, timeMs),
      value,
      easing: 'easeInOut',
    };
    dispatch({ type: 'add-keyframe', itemId: selected.id, keyframe: kf });
  };

  const hasKeyframesFor = (property: AnimatableProperty) =>
    (selected.keyframes ?? []).some((k) => k.property === property);

  return (
    <aside className="w-[280px] shrink-0 border-l border-border bg-app-elevated p-4 overflow-y-auto hidden lg:flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-accent">
            {selected.kind} clip
          </span>
          <input
            type="text"
            disabled={isLocked}
            value={selected.name}
            onChange={(e) => patchItem({ name: e.target.value })}
            className="mt-0.5 w-full bg-transparent font-medium text-sm text-fg outline-none border-b border-transparent hover:border-border focus:border-accent disabled:opacity-60"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => dispatch({ type: 'duplicate-selected' })}
            disabled={isLocked}
            aria-label="Duplicate clip"
          >
            <Copy size={14} />
          </Button>
          <Button
            size="icon"
            variant="danger"
            onClick={() => dispatch({ type: 'delete-selected' })}
            disabled={isLocked}
            aria-label="Delete clip"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Track & Toggles */}
      <div className="space-y-3">
        <label className="block text-xs text-muted">
          Track
          <select
            disabled={isLocked}
            value={selected.trackId}
            onChange={(e) => patchItem({ trackId: e.target.value })}
            className="mt-1 w-full h-8 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
          >
            {compatibleTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.kind})
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <Button
            size="sm"
            variant={selected.locked ? 'subtle' : 'ghost'}
            className={selected.locked ? 'border-accent text-accent' : ''}
            onClick={() => patchItem({ locked: !selected.locked })}
          >
            {selected.locked ? <Lock size={13} /> : <LockOpen size={13} />}
            <span>{selected.locked ? 'Locked' : 'Lock'}</span>
          </Button>

          <Button
            size="sm"
            variant={selected.muted ? 'subtle' : 'ghost'}
            className={selected.muted ? 'border-accent text-accent' : ''}
            onClick={() => patchItem({ muted: !selected.muted })}
          >
            {selected.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{selected.muted ? 'Muted' : 'Mute'}</span>
          </Button>

          <Button
            size="sm"
            variant={selected.hidden ? 'subtle' : 'ghost'}
            className={selected.hidden ? 'border-accent text-accent' : ''}
            onClick={() => patchItem({ hidden: !selected.hidden })}
          >
            {selected.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{selected.hidden ? 'Hidden' : 'Show'}</span>
          </Button>
        </div>
      </div>

      {/* Timing Controls */}
      <div className="space-y-3 border-t border-border pt-3">
        <h3 className="text-xs uppercase tracking-wider text-muted font-medium">Timing</h3>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-muted mb-1">Start (ms)</label>
            <input
              type="number"
              min={0}
              disabled={isLocked}
              value={Math.round(selected.startMs)}
              onChange={(e) => patchItem({ startMs: Number(e.target.value) })}
              className="w-full h-8 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
            />
            <span className="block text-[10px] text-subtle mt-0.5">
              {formatPreciseTime(selected.startMs / 1000)}
            </span>
          </div>

          <div>
            <label className="block text-[11px] text-muted mb-1">Duration (ms)</label>
            <input
              type="number"
              min={100}
              disabled={isLocked}
              value={Math.round(selected.durationMs)}
              onChange={(e) => patchItem({ durationMs: Number(e.target.value) })}
              className="w-full h-8 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
            />
            <span className="block text-[10px] text-subtle mt-0.5">
              {formatPreciseTime(selected.durationMs / 1000)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-panel border border-border">
          <span className="text-muted">End time:</span>
          <span className="font-mono text-[11px]">{formatPreciseTime(endMs / 1000)}</span>
        </div>
      </div>

      {/* Source Timing Controls (Media backed) */}
      {(selected.sourceStartMs !== undefined || selected.mediaId) ? (
        <div className="space-y-3 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-muted font-medium">
              Source Range
            </h3>
            {mediaAsset?.durationMs ? (
              <span className="text-[10px] text-subtle">
                Max: {formatPreciseTime(mediaAsset.durationMs / 1000)}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-muted mb-1">Source Start (ms)</label>
              <input
                type="number"
                min={0}
                disabled={isLocked}
                value={Math.round(selected.sourceStartMs ?? 0)}
                onChange={(e) => patchItem({ sourceStartMs: Number(e.target.value) })}
                className="w-full h-8 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
              />
              <span className="block text-[10px] text-subtle mt-0.5">
                {formatPreciseTime((selected.sourceStartMs ?? 0) / 1000)}
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-muted mb-1">Source Duration (ms)</label>
              <input
                type="number"
                min={100}
                disabled={isLocked}
                value={Math.round(selected.sourceDurationMs ?? selected.durationMs)}
                onChange={(e) => patchItem({ sourceDurationMs: Number(e.target.value) })}
                className="w-full h-8 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
              />
              <span className="block text-[10px] text-subtle mt-0.5">
                {formatPreciseTime((selected.sourceDurationMs ?? selected.durationMs) / 1000)}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Volume (Audio / Video) */}
      {(selected.kind === 'video' || selected.kind === 'audio') ? (
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-muted font-medium">Volume</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono">{selected.volume ?? 100}%</span>
              <button
                type="button"
                title="Add keyframe for volume at current playhead"
                onClick={() => addKeyframeAtPlayhead('volume', selected.volume ?? 100)}
                className={`cursor-pointer transition-colors ${hasKeyframesFor('volume') ? 'text-accent' : 'text-muted hover:text-fg'}`}
              >
                <Diamond size={11} />
              </button>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            disabled={isLocked || selected.muted}
            value={selected.muted ? 0 : (selected.volume ?? 100)}
            onChange={(e) => patchItem({ volume: Number(e.target.value) })}
            className="w-full accent-accent cursor-pointer disabled:opacity-40"
          />
          {selected.kind === 'audio' ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] text-muted mb-1">Fade In (ms)</label>
                <input
                  type="number"
                  min={0}
                  disabled={isLocked}
                  value={selected.fadeInMs ?? 0}
                  onChange={(e) => patchItem({ fadeInMs: Number(e.target.value) })}
                  className="w-full h-7 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted mb-1">Fade Out (ms)</label>
                <input
                  type="number"
                  min={0}
                  disabled={isLocked}
                  value={selected.fadeOutMs ?? 0}
                  onChange={(e) => patchItem({ fadeOutMs: Number(e.target.value) })}
                  className="w-full h-7 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Text Layer Controls */}
      {selected.kind === 'text' ? (
        <TextLayerControls clip={selected} isLocked={isLocked} onPatch={patchItem} onKeyframe={addKeyframeAtPlayhead} hasKeyframe={hasKeyframesFor} />
      ) : null}

      {/* Media Reference & Replace */}
      {selected.kind === 'video' || selected.kind === 'audio' ? (
        <div className="space-y-2 border-t border-border pt-3">
          <h3 className="text-xs uppercase tracking-wider text-muted font-medium">Media Source</h3>
          {mediaAsset ? (
            <div className="p-2 rounded-xl border border-border bg-panel flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{mediaAsset.name}</p>
                <p className="text-[10px] text-muted capitalize">{mediaAsset.type}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={isLocked}
                onClick={() => setReplaceModalOpen(true)}
              >
                <FileCode size={13} />
                Replace
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              disabled={isLocked}
              onClick={() => setReplaceModalOpen(true)}
            >
              Attach / Replace Media
            </Button>
          )}
        </div>
      ) : null}

      {/* Keyframes summary */}
      {(selected.keyframes?.length ?? 0) > 0 ? (
        <div className="space-y-1.5 border-t border-border pt-3">
          <h3 className="text-xs uppercase tracking-wider text-muted font-medium">Keyframes ({selected.keyframes!.length})</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selected.keyframes!.map((kf) => (
              <div key={kf.id} className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-panel border border-border">
                <span className="text-muted capitalize">{kf.property}</span>
                <span className="font-mono">{formatPreciseTime(kf.timeMs / 1000)}</span>
                <span className="text-accent">{Math.round(kf.value)}</span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'remove-keyframe', itemId: selected.id, keyframeId: kf.id })}
                  className="text-muted hover:text-danger cursor-pointer"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Delete / Ripple Delete Actions */}
      <div className="border-t border-border pt-3 space-y-2 mt-auto">
        <Button
          size="sm"
          variant="secondary"
          className="w-full text-xs"
          disabled={isLocked}
          onClick={() => dispatch({ type: 'ripple-delete-selected' })}
        >
          Ripple Delete (Shift+Del)
        </Button>
      </div>

      {replaceModalOpen ? (
        <ReplaceMediaModal
          clip={selected}
          onClose={() => setReplaceModalOpen(false)}
        />
      ) : null}
    </aside>
  );
}

/** Text-layer specific property controls */
function TextLayerControls({
  clip,
  isLocked,
  onPatch,
  onKeyframe,
  hasKeyframe,
}: {
  clip: TextLayer;
  isLocked: boolean;
  onPatch: (patch: Partial<TimelineItem>) => void;
  onKeyframe: (property: AnimatableProperty, value: number) => void;
  hasKeyframe: (property: AnimatableProperty) => boolean;
}) {
  return (
    <div className="space-y-3 border-t border-border pt-3">
      <h3 className="text-xs uppercase tracking-wider text-muted font-medium">Text</h3>

      {/* Text content */}
      <label className="block text-[11px] text-muted">
        Content
        <textarea
          disabled={isLocked}
          value={clip.text}
          rows={3}
          onChange={(e) => onPatch({ text: e.target.value })}
          className="mt-1 w-full rounded-lg border border-border bg-panel px-2 py-1.5 text-xs text-fg outline-none resize-none disabled:opacity-60 focus:border-accent"
        />
      </label>

      {/* Font family + size */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] text-muted">
          Font
          <select
            disabled={isLocked}
            value={clip.fontFamily}
            onChange={(e) => onPatch({ fontFamily: e.target.value })}
            className="mt-1 w-full h-7 rounded-lg border border-border bg-panel px-1 text-xs text-fg outline-none disabled:opacity-60"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] text-muted">
          Size
          <input
            type="number"
            min={8}
            max={300}
            disabled={isLocked}
            value={clip.fontSize}
            onChange={(e) => onPatch({ fontSize: Number(e.target.value) })}
            className="mt-1 w-full h-7 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
          />
        </label>
      </div>

      {/* Style toggles */}
      <div className="grid grid-cols-3 gap-1.5">
        {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
          <Button
            key={align}
            size="sm"
            variant={clip.align === align ? 'subtle' : 'ghost'}
            className={clip.align === align ? 'border-accent text-accent' : ''}
            onClick={() => onPatch({ align })}
          >
            {align[0].toUpperCase() + align.slice(1)}
          </Button>
        ))}
      </div>

      {/* Weight & Italic */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] text-muted">
          Weight
          <select
            disabled={isLocked}
            value={clip.fontWeight}
            onChange={(e) => onPatch({ fontWeight: Number(e.target.value) })}
            className="mt-1 w-full h-7 rounded-lg border border-border bg-panel px-1 text-xs text-fg outline-none disabled:opacity-60"
          >
            {[300, 400, 500, 600, 700, 800, 900].map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] text-muted">
          Style
          <select
            disabled={isLocked}
            value={clip.fontStyle ?? 'normal'}
            onChange={(e) => onPatch({ fontStyle: e.target.value as 'normal' | 'italic' })}
            className="mt-1 w-full h-7 rounded-lg border border-border bg-panel px-1 text-xs text-fg outline-none disabled:opacity-60"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </label>
      </div>

      {/* Color */}
      <label className="block text-[11px] text-muted">
        Fill Color
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            disabled={isLocked}
            value={clip.color}
            onChange={(e) => onPatch({ color: e.target.value })}
            className="h-8 w-10 rounded border border-border cursor-pointer disabled:opacity-60"
          />
          <input
            type="text"
            disabled={isLocked}
            value={clip.color}
            onChange={(e) => onPatch({ color: e.target.value })}
            className="flex-1 h-8 rounded-lg border border-border bg-panel px-2 text-xs font-mono text-fg outline-none disabled:opacity-60"
          />
        </div>
      </label>

      {/* Stroke */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] text-muted">
          Stroke Color
          <input
            type="color"
            disabled={isLocked}
            value={clip.strokeColor ?? '#000000'}
            onChange={(e) => onPatch({ strokeColor: e.target.value })}
            className="mt-1 h-8 w-full rounded border border-border cursor-pointer disabled:opacity-60"
          />
        </label>
        <label className="block text-[11px] text-muted">
          Stroke Width
          <input
            type="number"
            min={0}
            max={20}
            disabled={isLocked}
            value={clip.strokeWidth ?? 0}
            onChange={(e) => onPatch({ strokeWidth: Number(e.target.value) })}
            className="mt-1 w-full h-8 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
          />
        </label>
      </div>

      {/* Background */}
      <label className="block text-[11px] text-muted">
        Background
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            disabled={isLocked}
            value={clip.backgroundColor ?? '#000000'}
            onChange={(e) => onPatch({ backgroundColor: e.target.value })}
            className="h-8 w-10 rounded border border-border cursor-pointer disabled:opacity-60"
          />
          <input
            type="range"
            min={0}
            max={100}
            disabled={isLocked}
            value={clip.backgroundOpacity ?? 0}
            onChange={(e) => onPatch({ backgroundOpacity: Number(e.target.value) })}
            className="flex-1 accent-accent disabled:opacity-40"
            title="Background opacity"
          />
          <span className="text-[10px] w-6 text-right">{clip.backgroundOpacity ?? 0}%</span>
        </div>
      </label>

      {/* Letter spacing & Line height */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] text-muted">
          Letter Spacing
          <input
            type="number"
            step={0.5}
            disabled={isLocked}
            value={clip.letterSpacing ?? 0}
            onChange={(e) => onPatch({ letterSpacing: Number(e.target.value) })}
            className="mt-1 w-full h-7 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
          />
        </label>
        <label className="block text-[11px] text-muted">
          Line Height
          <input
            type="number"
            step={0.1}
            min={0.5}
            max={5}
            disabled={isLocked}
            value={clip.lineHeight ?? 1.2}
            onChange={(e) => onPatch({ lineHeight: Number(e.target.value) })}
            className="mt-1 w-full h-7 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
          />
        </label>
      </div>

      {/* Animation */}
      <label className="block text-[11px] text-muted">
        Animation
        <select
          disabled={isLocked}
          value={clip.animation}
          onChange={(e) => onPatch({ animation: e.target.value as TextAnimation })}
          className="mt-1 w-full h-7 rounded-lg border border-border bg-panel px-2 text-xs text-fg outline-none disabled:opacity-60"
        >
          {TEXT_ANIMATIONS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </label>

      {/* Animatable Transform Keyframe Toggles */}
      <div className="pt-1">
        <h4 className="text-[11px] uppercase tracking-wider text-muted mb-2">Keyframe Toggles</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            ['positionX', clip.positionX],
            ['positionY', clip.positionY],
            ['scale', clip.scale ?? 1],
            ['rotation', clip.rotation ?? 0],
            ['opacity', clip.opacity ?? 100],
          ] as [AnimatableProperty, number][]).map(([prop, val]) => (
            <button
              key={prop}
              type="button"
              onClick={() => onKeyframe(prop, val)}
              className={`flex items-center gap-1.5 h-7 px-2 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                hasKeyframe(prop) ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted hover:text-fg hover:border-border'
              }`}
            >
              <Diamond size={10} />
              <span className="capitalize">{prop}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
