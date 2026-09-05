import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type {
  AudioClip,
  TextAlign,
  TextAnimation,
  TextLayer,
  TimelineItem,
  VideoClip,
} from '@/types';
import { Trash2 } from 'lucide-react';

export function PropertiesPanel() {
  const { selected, dispatch } = useEditor();

  if (!selected) {
    return (
      <aside className="w-[260px] shrink-0 border-l border-border bg-app-elevated p-4 hidden lg:block">
        <h2 className="text-xs uppercase tracking-wider text-muted">Properties</h2>
        <p className="text-sm text-muted mt-3">Select a clip on the timeline to edit it.</p>
      </aside>
    );
  }

  return (
    <aside className="w-[260px] shrink-0 border-l border-border bg-app-elevated p-4 overflow-auto hidden lg:block">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted">Properties</h2>
          <p className="text-sm font-medium mt-1">{selected.name}</p>
        </div>
        <Button
          size="icon"
          variant="danger"
          onClick={() => dispatch({ type: 'delete-selected' })}
          aria-label="Delete"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <TimelineProps item={selected} />
      {selected.kind === 'video' ? <VideoProps clip={selected} /> : null}
      {selected.kind === 'text' ? <TextProps layer={selected} /> : null}
      {selected.kind === 'audio' ? <AudioProps clip={selected} /> : null}
      {selected.kind === 'caption' ? (
        <label className="block text-xs text-muted">
          Caption
          <textarea
            className="mt-1 w-full rounded-lg border border-border bg-panel px-2 py-1.5 text-sm text-fg outline-none"
            value={selected.text}
            rows={3}
            onChange={(e) =>
              dispatch({ type: 'update-item', itemId: selected.id, patch: { text: e.target.value } })
            }
          />
        </label>
      ) : null}
    </aside>
  );
}

function TimelineProps({ item }: { item: TimelineItem }) {
  const { dispatch } = useEditor();
  const patch = (partial: Partial<TimelineItem>) =>
    dispatch({ type: 'update-item', itemId: item.id, patch: partial });

  return (
    <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-border">
      <NumberField
        label="Start (ms)"
        value={item.startMs}
        min={0}
        onChange={(value) => patch({ startMs: value })}
      />
      <NumberField
        label="Duration (ms)"
        value={item.durationMs}
        min={100}
        onChange={(value) => patch({ durationMs: value })}
      />
    </div>
  );
}

function VideoProps({ clip }: { clip: VideoClip }) {
  const { dispatch } = useEditor();
  const patch = (partial: Partial<VideoClip>) =>
    dispatch({ type: 'update-item', itemId: clip.id, patch: partial });

  return (
    <div className="space-y-3">
      <NumberField label="Position X" value={clip.positionX} onChange={(v) => patch({ positionX: v })} />
      <NumberField label="Position Y" value={clip.positionY} onChange={(v) => patch({ positionY: v })} />
      <NumberField label="Scale" value={clip.scale} onChange={(v) => patch({ scale: v })} />
      <NumberField label="Rotation" value={clip.rotation} onChange={(v) => patch({ rotation: v })} />
      <NumberField label="Opacity" value={clip.opacity} min={0} max={100} onChange={(v) => patch({ opacity: v })} />
      <NumberField
        label="Speed"
        value={clip.speed}
        min={0.25}
        max={4}
        step={0.25}
        onChange={(v) => patch({ speed: v })}
      />
    </div>
  );
}

function TextProps({ layer }: { layer: TextLayer }) {
  const { dispatch } = useEditor();
  const patch = (partial: Partial<TextLayer>) =>
    dispatch({ type: 'update-item', itemId: layer.id, patch: partial });

  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted">
        Text
        <textarea
          className="mt-1 w-full rounded-lg border border-border bg-panel px-2 py-1.5 text-sm text-fg outline-none"
          value={layer.text}
          rows={3}
          onChange={(e) => patch({ text: e.target.value })}
        />
      </label>
      <label className="block text-xs text-muted">
        Font
        <select
          className="mt-1 w-full h-8 rounded-lg border border-border bg-panel px-2 text-sm text-fg"
          value={layer.fontFamily}
          onChange={(e) => patch({ fontFamily: e.target.value })}
        >
          <option>Inter</option>
          <option>Georgia</option>
          <option>Arial</option>
        </select>
      </label>
      <NumberField label="Size" value={layer.fontSize} min={12} max={120} onChange={(v) => patch({ fontSize: v })} />
      <NumberField
        label="Weight"
        value={layer.fontWeight}
        min={400}
        max={800}
        step={100}
        onChange={(v) => patch({ fontWeight: v })}
      />
      <label className="block text-xs text-muted">
        Alignment
        <select
          className="mt-1 w-full h-8 rounded-lg border border-border bg-panel px-2 text-sm text-fg"
          value={layer.align}
          onChange={(e) => patch({ align: e.target.value as TextAlign })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="block text-xs text-muted">
        Color
        <input
          type="color"
          className="mt-1 h-8 w-full rounded border border-border bg-panel"
          value={layer.color}
          onChange={(e) => patch({ color: e.target.value })}
        />
      </label>
      <NumberField label="Position X" value={layer.positionX} onChange={(v) => patch({ positionX: v })} />
      <NumberField label="Position Y" value={layer.positionY} onChange={(v) => patch({ positionY: v })} />
      <label className="block text-xs text-muted">
        Animation
        <select
          className="mt-1 w-full h-8 rounded-lg border border-border bg-panel px-2 text-sm text-fg"
          value={layer.animation}
          onChange={(e) => patch({ animation: e.target.value as TextAnimation })}
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="slide-up">Slide up</option>
          <option value="typewriter">Typewriter</option>
        </select>
      </label>
    </div>
  );
}

function AudioProps({ clip }: { clip: AudioClip }) {
  const { dispatch } = useEditor();
  const patch = (partial: Partial<AudioClip>) =>
    dispatch({ type: 'update-item', itemId: clip.id, patch: partial });

  return (
    <div className="space-y-3">
      <NumberField label="Volume" value={clip.volume} min={0} max={100} onChange={(v) => patch({ volume: v })} />
      <NumberField label="Fade in (ms)" value={clip.fadeInMs} min={0} max={5000} onChange={(v) => patch({ fadeInMs: v })} />
      <NumberField
        label="Fade out (ms)"
        value={clip.fadeOutMs}
        min={0}
        max={5000}
        onChange={(v) => patch({ fadeOutMs: v })}
      />
      <NumberField
        label="Speed"
        value={clip.speed}
        min={0.25}
        max={4}
        step={0.25}
        onChange={(v) => patch({ speed: v })}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input
        type="number"
        className="mt-1 w-full h-8 rounded-lg border border-border bg-panel px-2 text-sm text-fg outline-none"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
