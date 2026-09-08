import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { ClipEffect, EffectType } from '@/types';
import { createId } from '@/utils/id';
import { findItem } from '@/utils/timeline';
import { Eye, EyeOff, Plus, RotateCcw, Trash2, Wand2 } from 'lucide-react';

const FILTER_PRESETS = [
  { id: 'cinematic' as const, name: 'Cinematic', desc: 'Moody high contrast film grade' },
  { id: 'warm' as const, name: 'Warm Sunset', desc: 'Golden hour warmth and rich tones' },
  { id: 'cool' as const, name: 'Cool Nordic', desc: 'Crisp scandinavian blue ambience' },
  { id: 'vintage' as const, name: 'Vintage 70s', desc: 'Classic retro faded film aesthetic' },
  { id: 'noir' as const, name: 'B&W Noir', desc: 'Deep high dynamic black and white' },
  { id: 'cyberpunk' as const, name: 'Cyberpunk', desc: 'Neon saturated high-energy grade' },
  { id: 'soft' as const, name: 'Soft Glow', desc: 'Dreamy soft focus and diffused light' },
];

const AVAILABLE_EFFECTS: Array<{ type: EffectType; name: string; defaultIntensity: number }> = [
  { type: 'brightness', name: 'Brightness', defaultIntensity: 110 },
  { type: 'contrast', name: 'Contrast', defaultIntensity: 120 },
  { type: 'saturation', name: 'Saturation', defaultIntensity: 130 },
  { type: 'blur', name: 'Gaussian Blur', defaultIntensity: 4 },
  { type: 'grayscale', name: 'Grayscale', defaultIntensity: 100 },
  { type: 'sepia', name: 'Sepia', defaultIntensity: 60 },
  { type: 'hue-rotate', name: 'Hue Rotation', defaultIntensity: 90 },
  { type: 'invert', name: 'Invert Colors', defaultIntensity: 100 },
];

export function EffectsPanel() {
  const { state, dispatch } = useEditor();
  const selectedClip = state.ui.selectedItemId ? findItem(state.snapshot.tracks, state.ui.selectedItemId) : undefined;
  const currentEffects = selectedClip?.effects ?? [];

  const handleAddEffect = (type: EffectType, name: string, defaultIntensity: number) => {
    if (!selectedClip) return;
    const newEffect: ClipEffect = {
      id: createId('eff'),
      type,
      name,
      intensity: defaultIntensity,
      enabled: true,
    };
    dispatch({ type: 'add-effect', itemId: selectedClip.id, effect: newEffect });
  };

  const handleApplyPreset = (preset: typeof FILTER_PRESETS[number]['id']) => {
    if (!selectedClip) return;
    dispatch({ type: 'apply-filter-preset', itemId: selectedClip.id, preset });
  };

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full text-xs">
      <div>
        <p className="text-xs font-semibold text-fg mb-1">Visual Effects & Filters</p>
        <p className="text-[11px] text-muted">
          GPU-accelerated browser preview filters and clip adjustments.
        </p>
      </div>

      {/* Filter Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Filter Presets
          </p>
          <Wand2 size={12} className="text-accent" />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={!selectedClip}
              onClick={() => handleApplyPreset(preset.id)}
              className="p-2 rounded-xl border border-border bg-panel text-left hover:border-accent hover:bg-panel-hover transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-semibold text-xs text-fg truncate">{preset.name}</p>
              <p className="text-[10px] text-muted truncate mt-0.5">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Effect Stack on Selected Clip */}
      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Active Stack ({currentEffects.length})
          </p>
          {currentEffects.length > 0 && selectedClip ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1.5 text-[10px] text-muted hover:text-danger"
              onClick={() => dispatch({ type: 'reset-effects', itemId: selectedClip.id })}
            >
              <RotateCcw size={11} /> Reset All
            </Button>
          ) : null}
        </div>

        {!selectedClip ? (
          <div className="p-4 text-center text-xs text-muted border border-dashed border-border rounded-xl">
            Select a video or image clip on the timeline to stack effects.
          </div>
        ) : currentEffects.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted border border-dashed border-border rounded-xl">
            No effects attached. Click an effect below or select a Filter Preset above.
          </div>
        ) : (
          <div className="space-y-2">
            {currentEffects.map((eff) => (
              <div
                key={eff.id}
                className="p-2.5 rounded-xl border border-border bg-panel space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-fg">{eff.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'update-effect',
                          itemId: selectedClip.id,
                          effectId: eff.id,
                          patch: { enabled: !eff.enabled },
                        })
                      }
                      className="p-1 text-muted hover:text-fg cursor-pointer"
                    >
                      {eff.enabled ? <Eye size={13} /> : <EyeOff size={13} className="text-muted" />}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'remove-effect',
                          itemId: selectedClip.id,
                          effectId: eff.id,
                        })
                      }
                      className="p-1 text-muted hover:text-danger cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={eff.type === 'blur' ? 20 : eff.type === 'hue-rotate' ? 360 : 200}
                    value={eff.intensity}
                    disabled={!eff.enabled}
                    onChange={(e) =>
                      dispatch({
                        type: 'update-effect',
                        itemId: selectedClip.id,
                        effectId: eff.id,
                        patch: { intensity: Number(e.target.value) },
                      })
                    }
                    className="flex-1 accent-accent cursor-pointer disabled:opacity-40"
                  />
                  <span className="font-mono text-[10px] text-fg w-9 text-right">
                    {eff.intensity}{eff.type === 'hue-rotate' ? '°' : eff.type === 'blur' ? 'px' : '%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Effects Library to Add */}
      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Add Effect
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {AVAILABLE_EFFECTS.map((eff) => (
            <Button
              key={eff.type}
              size="sm"
              variant="secondary"
              disabled={!selectedClip}
              onClick={() => handleAddEffect(eff.type, eff.name, eff.defaultIntensity)}
              className="justify-start text-xs h-8"
            >
              <Plus size={12} />
              {eff.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
