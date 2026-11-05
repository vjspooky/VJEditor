import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { Caption } from '@/types';
import { formatPreciseTime } from '@/utils/frame';
import { exportToSrt, exportToVtt, parseSrt } from '@/utils/subtitles';
import { Download, Plus, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

const CAPTION_STYLES: Array<{ id: Caption['style']; label: string; desc: string }> = [
  { id: 'default', label: 'Classic', desc: 'Standard white text with drop shadow' },
  { id: 'boxed', label: 'Modern', desc: 'Sleek dark translucent bounding pill' },
  { id: 'social', label: 'Social', desc: 'High-contrast vibrant punchy headline' },
  { id: 'karaoke', label: 'Karaoke', desc: 'Bold yellow highlighted dialogue' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean, low-profile subtle typography' },
];

export function CaptionsPanel() {
  const { state, dispatch } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find all caption items across caption tracks
  const captionTracks = state.snapshot.tracks.filter((t) => t.kind === 'caption');
  const allCaptions = captionTracks
    .flatMap((t) => t.items.filter((item): item is Caption => item.kind === 'caption'))
    .sort((a, b) => a.startMs - b.startMs);

  const handleImportSubtitles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const parsed = parseSrt(content, captionTracks[0]?.id ?? 'track-caption');
      if (parsed.length > 0) {
        dispatch({ type: 'import-captions', captions: parsed });
      }
    };
    reader.readAsText(file);
  };

  const handleExportSrt = () => {
    const srtText = exportToSrt(allCaptions);
    const blob = new Blob([srtText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.snapshot.name || 'subtitles'}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportVtt = () => {
    const vttText = exportToVtt(allCaptions);
    const blob = new Blob([vttText], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.snapshot.name || 'subtitles'}.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full text-xs">
      {/* Top Actions: Add & Import/Export */}
      <div className="space-y-2">
        <Button
          variant="primary"
          className="w-full h-9"
          onClick={() => dispatch({ type: 'add-caption' })}
        >
          <Plus size={14} />
          Add Caption at Playhead
        </Button>

        <div className="grid grid-cols-2 gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            className="text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={12} />
            Import SRT/VTT
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".srt,.vtt,text/plain"
            className="hidden"
            onChange={handleImportSubtitles}
          />

          <Button
            size="sm"
            variant="secondary"
            className="text-xs"
            disabled={allCaptions.length === 0}
            onClick={handleExportSrt}
          >
            <Download size={12} />
            Export SRT
          </Button>
        </div>
      </div>

      {/* Caption Style Presets */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Preset Styles
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {CAPTION_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                // Apply to selected caption or all
                if (state.ui.selectedItemId) {
                  dispatch({
                    type: 'update-item',
                    itemId: state.ui.selectedItemId,
                    patch: { style: style.id } as Partial<Caption>,
                  });
                } else {
                  allCaptions.forEach((c) =>
                    dispatch({
                      type: 'update-item',
                      itemId: c.id,
                      patch: { style: style.id } as Partial<Caption>,
                    }),
                  );
                }
              }}
              className="p-1.5 rounded-lg border border-border bg-panel text-center hover:border-accent cursor-pointer transition"
            >
              <p className="font-medium text-[11px] text-fg">{style.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Caption Segments List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Timeline Captions ({allCaptions.length})
          </p>
          {allCaptions.length > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1.5 text-[10px] text-subtle"
              onClick={handleExportVtt}
            >
              Export VTT
            </Button>
          ) : null}
        </div>

        {allCaptions.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted border border-dashed border-border rounded-xl">
            No subtitles on timeline. Click Add Caption above or import an SRT file.
          </div>
        ) : (
          <div className="space-y-2">
            {allCaptions.map((cap, idx) => {
              const isSelected = state.ui.selectedItemId === cap.id;
              const isCurrentlyPlaying =
                state.ui.playheadMs >= cap.startMs &&
                state.ui.playheadMs <= cap.startMs + cap.durationMs;

              return (
                <div
                  key={cap.id}
                  onClick={() => {
                    dispatch({ type: 'select', itemId: cap.id });
                    dispatch({ type: 'set-playhead', ms: cap.startMs });
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-accent bg-accent/10 ring-1 ring-accent'
                      : isCurrentlyPlaying
                        ? 'border-accent/40 bg-panel-hover'
                        : 'border-border bg-panel hover:bg-panel-hover'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span className="font-mono">
                      #{idx + 1} • {formatPreciseTime(cap.startMs / 1000)} -{' '}
                      {formatPreciseTime((cap.startMs + cap.durationMs) / 1000)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'select', itemId: cap.id });
                        dispatch({ type: 'delete-selected' });
                      }}
                      className="text-muted hover:text-danger p-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={cap.text}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      dispatch({
                        type: 'update-item',
                        itemId: cap.id,
                        patch: { text: e.target.value } as Partial<Caption>,
                      })
                    }
                    className="w-full bg-app text-xs text-fg rounded-lg p-1.5 border border-border outline-none resize-none focus:border-accent"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
