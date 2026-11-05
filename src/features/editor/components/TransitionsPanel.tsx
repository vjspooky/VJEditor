import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { TransitionType } from '@/types';
import { createId } from '@/utils/id';
import { findItem, findTrackForItem } from '@/utils/timeline';
import { Blend, Film, Layers, MoveRight, Sparkles, ZoomIn } from 'lucide-react';
import { useState } from 'react';

interface TransitionDef {
  type: TransitionType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const TRANSITIONS_LIBRARY: TransitionDef[] = [
  { type: 'dissolve', name: 'Cross Dissolve', description: 'Smooth alpha cross-fade between scenes', icon: <Blend size={16} /> },
  { type: 'fade', name: 'Dip to Black', description: 'Fade through black color between clips', icon: <Film size={16} /> },
  { type: 'wipe', name: 'Directional Wipe', description: 'Horizontal wipe revealing incoming footage', icon: <Layers size={16} /> },
  { type: 'slide', name: 'Push Slide', description: 'Slide transition pushing outgoing frame out', icon: <MoveRight size={16} /> },
  { type: 'zoom', name: 'Warp Zoom', description: 'Dynamic camera zoom transition', icon: <ZoomIn size={16} /> },
  { type: 'blur', name: 'Motion Blur', description: 'High speed optical blur blend', icon: <Sparkles size={16} /> },
];

export function TransitionsPanel() {
  const { state, dispatch } = useEditor();
  const [durationMs, setDurationMs] = useState(1000);
  const selectedClip = state.ui.selectedItemId ? findItem(state.snapshot.tracks, state.ui.selectedItemId) : undefined;

  const handleApplyTransition = (type: TransitionType) => {
    if (!selectedClip) return;
    const track = findTrackForItem(state.snapshot.tracks, selectedClip.id);
    if (!track) return;

    // Find next adjacent clip on the same track
    const trackItems = [...track.items].sort((a, b) => a.startMs - b.startMs);
    const currentIndex = trackItems.findIndex((i) => i.id === selectedClip.id);
    const nextClip = trackItems[currentIndex + 1];

    if (nextClip) {
      dispatch({
        type: 'add-transition',
        trackId: track.id,
        transition: {
          id: createId('trans'),
          type,
          durationMs,
          afterClipId: selectedClip.id,
          beforeClipId: nextClip.id,
        },
      });
    }
  };

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full text-xs">
      <div>
        <p className="text-xs font-semibold text-fg mb-1">Transitions Library</p>
        <p className="text-[11px] text-muted">
          Attach cinematic transitions between consecutive clips on the same track.
        </p>
      </div>

      {/* Duration Control */}
      <div className="p-2.5 rounded-xl border border-border bg-panel space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted font-medium">Transition Duration</span>
          <span className="font-mono text-xs font-semibold text-fg">{(durationMs / 1000).toFixed(1)}s</span>
        </div>
        <input
          type="range"
          min={300}
          max={3000}
          step={100}
          value={durationMs}
          onChange={(e) => setDurationMs(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
        />
      </div>

      {/* Transitions Grid */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Transitions
        </p>
        <div className="grid grid-cols-1 gap-2">
          {TRANSITIONS_LIBRARY.map((item) => (
            <div
              key={item.type}
              className="p-3 rounded-xl border border-border bg-panel flex items-center justify-between gap-3 hover:border-accent transition group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-fg">{item.name}</p>
                  <p className="text-[10px] text-muted truncate">{item.description}</p>
                </div>
              </div>

              <Button
                size="sm"
                variant="secondary"
                disabled={!selectedClip}
                onClick={() => handleApplyTransition(item.type)}
                className="shrink-0 text-xs"
              >
                Apply
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
