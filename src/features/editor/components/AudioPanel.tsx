import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import { seedMedia } from '@/data/seedMedia';
import type { MediaAsset } from '@/types';
import { formatClock } from '@/utils/format';
import { getOrGenerateWaveform } from '@/utils/audioWaveform';
import { Lock, LockOpen, Music, Plus, Upload, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function AudioPanel() {
  const { state, dispatch, addUploadedFiles } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [waveforms, setWaveforms] = useState<Record<string, number[]>>({});

  const allAudioAssets: MediaAsset[] = [
    ...state.snapshot.media.filter((m) => m.type === 'audio'),
    ...seedMedia.filter((m) => m.type === 'audio'),
  ];
  const uniqueAudio = [...new Map(allAudioAssets.map((item) => [item.id, item])).values()];

  const audioTracks = state.snapshot.tracks.filter((t) => t.kind === 'audio');

  useEffect(() => {
    uniqueAudio.forEach(async (asset) => {
      if (!waveforms[asset.id]) {
        const peaks = await getOrGenerateWaveform(asset.id, asset.src ?? asset.url, 40);
        setWaveforms((prev) => ({ ...prev, [asset.id]: peaks }));
      }
    });
  }, [uniqueAudio, waveforms]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addUploadedFiles(e.target.files);
    }
  };

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full text-xs">
      {/* Upload button */}
      <div>
        <Button
          variant="primary"
          className="w-full h-9"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={14} />
          Import Audio (MP3, WAV, AAC, OGG)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/aac,audio/m4a,audio/ogg"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Audio Track Master Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Audio Tracks ({audioTracks.length})
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-1.5 text-[10px]"
            onClick={() => dispatch({ type: 'add-track', kind: 'audio' })}
          >
            <Plus size={11} /> Track
          </Button>
        </div>

        {audioTracks.map((track) => (
          <div
            key={track.id}
            className="p-2.5 rounded-xl border border-border bg-panel space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-fg">{track.name}</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={track.solo ? 'subtle' : 'ghost'}
                  className={`h-6 px-1.5 text-[10px] ${track.solo ? 'border-amber-400 text-amber-400' : ''}`}
                  onClick={() => dispatch({ type: 'toggle-track-solo', trackId: track.id })}
                >
                  Solo
                </Button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'update-track', trackId: track.id, patch: { muted: !track.muted } })}
                  className="p-1 text-muted hover:text-fg cursor-pointer"
                >
                  {track.muted ? <VolumeX size={13} className="text-danger" /> : <Volume2 size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'update-track', trackId: track.id, patch: { locked: !track.locked } })}
                  className="p-1 text-muted hover:text-fg cursor-pointer"
                >
                  {track.locked ? <Lock size={13} className="text-amber-400" /> : <LockOpen size={13} />}
                </button>
              </div>
            </div>

            {/* Track volume slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted w-10">Vol</span>
              <input
                type="range"
                min={0}
                max={200}
                value={track.volume ?? 100}
                onChange={(e) =>
                  dispatch({
                    type: 'set-track-volume',
                    trackId: track.id,
                    volume: Number(e.target.value),
                  })
                }
                className="flex-1 accent-accent cursor-pointer"
              />
              <span className="font-mono text-[10px] text-fg w-8 text-right">
                {track.volume ?? 100}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Audio Assets List */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Music & Voice Assets
        </p>

        {uniqueAudio.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted border border-dashed border-border rounded-xl">
            No audio uploaded yet. Click Import Audio above to add sounds.
          </div>
        ) : (
          uniqueAudio.map((asset) => {
            const peaks = waveforms[asset.id] || [];
            return (
              <div
                key={asset.id}
                className="p-2.5 rounded-xl border border-border bg-panel flex flex-col gap-2 hover:border-accent transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 grid place-items-center shrink-0">
                      <Music size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-xs">{asset.name}</p>
                      <p className="text-[10px] text-muted">
                        {asset.durationMs ? formatClock(asset.durationMs) : 'Audio'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs"
                    onClick={() => dispatch({ type: 'add-media', asset })}
                  >
                    <Plus size={11} /> Place
                  </Button>
                </div>

                {/* Waveform Visualization Preview */}
                {peaks.length > 0 ? (
                  <div className="h-6 flex items-center gap-0.5 bg-black/40 rounded px-1.5 py-1">
                    {peaks.map((peak, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-emerald-400/70 rounded-full"
                        style={{ height: `${Math.max(15, peak * 100)}%` }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
