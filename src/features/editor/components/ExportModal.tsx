import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { AspectRatio, ExportJob, ExportQuality, ProjectResolution } from '@/types';
import type { FrameRate } from '@/utils/frame';
import { createId } from '@/utils/id';
import { Check, Download, Film, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ExportConfig {
  format: 'mp4' | 'webm';
  resolution: ProjectResolution;
  fps: FrameRate;
  quality: ExportQuality;
  range: 'all' | 'selection';
}

const RESOLUTIONS: { label: string; value: ProjectResolution; description: string }[] = [
  { label: '720p HD', value: '720p', description: '1280 × 720 — standard quality' },
  { label: '1080p Full HD', value: '1080p', description: '1920 × 1080 — recommended' },
  { label: '4K UHD', value: '4K', description: '3840 × 2160 — maximum quality' },
];

const FPS_OPTIONS: FrameRate[] = [24, 25, 30, 50, 60];

const QUALITY_OPTIONS: { value: ExportQuality; label: string; bitrate: string }[] = [
  { value: 'draft', label: 'Draft', bitrate: '~4 Mbps' },
  { value: 'standard', label: 'Standard', bitrate: '~12 Mbps' },
  { value: 'high', label: 'High', bitrate: '~25 Mbps' },
  { value: 'maximum', label: 'Maximum', bitrate: '~50 Mbps' },
];

const EXPORT_STAGES = ['Preparing assets', 'Rendering video', 'Processing audio', 'Finalizing output', 'Complete'];

function estimateSizeMb(config: ExportConfig, durationSec: number): number {
  const bitrateMap: Record<ExportQuality, number> = { draft: 0.5, standard: 1.5, high: 3.1, maximum: 6.25 };
  const resMult: Record<ProjectResolution, number> = { '720p': 0.5, '1080p': 1, '4K': 4.5 };
  return Math.round(bitrateMap[config.quality] * resMult[config.resolution] * durationSec);
}

export function ExportModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, durationMs } = useEditor();
  const [config, setConfig] = useState<ExportConfig>({
    format: 'mp4',
    resolution: '1080p',
    fps: 30,
    quality: 'high',
    range: 'all',
  });
  const [activeJob, setActiveJob] = useState<ExportJob | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durationSec = durationMs / 1000;
  const estimatedMb = estimateSizeMb(config, durationSec);

  // Simulated export progress
  useEffect(() => {
    if (!activeJob || activeJob.status === 'complete' || activeJob.status === 'failed') return;

    intervalRef.current = setInterval(() => {
      setActiveJob((prev) => {
        if (!prev) return prev;
        const newProgress = Math.min(100, prev.progress + Math.random() * 6 + 2);
        const newStage = Math.min(EXPORT_STAGES.length - 2, Math.floor((newProgress / 100) * (EXPORT_STAGES.length - 1)));
        setStageIndex(newStage);

        if (newProgress >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const completed: ExportJob = { ...prev, progress: 100, status: 'complete', completedAt: new Date().toISOString() };
          dispatch({ type: 'update-export-job', jobId: prev.id, patch: { progress: 100, status: 'complete', completedAt: completed.completedAt } });
          return completed;
        }

        const updated: ExportJob = { ...prev, progress: newProgress };
        dispatch({ type: 'update-export-job', jobId: prev.id, patch: { progress: newProgress } });
        return updated;
      });
    }, 350);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeJob?.id, activeJob?.status, dispatch]);

  function startExport() {
    const job: ExportJob = {
      id: createId('exp'),
      projectId: state.projectId,
      projectName: state.snapshot.name,
      format: config.format,
      resolution: config.resolution,
      fps: config.fps,
      quality: config.quality,
      aspectRatio: state.aspectRatio as AspectRatio,
      range: config.range,
      status: 'preparing',
      progress: 0,
      estimatedSizeBytes: estimatedMb * 1_000_000,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'start-export', job });
    setActiveJob(job);
    setStageIndex(0);
  }

  function downloadResult() {
    // In a real implementation this would download from a server URL.
    // Here we generate a dummy JSON blob as a placeholder.
    const payload = JSON.stringify({ project: state.snapshot.name, config, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.snapshot.name || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isComplete = activeJob?.status === 'complete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-app-elevated shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-panel">
          <div className="flex items-center gap-2.5">
            <Film size={18} className="text-accent" />
            <h2 className="font-semibold text-sm">Export Project</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-fg cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {!activeJob ? (
            <>
              {/* Format */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-muted">Format</label>
                <div className="flex gap-2">
                  {(['mp4', 'webm'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, format: f }))}
                      className={`flex-1 h-9 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                        config.format === f
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted hover:text-fg'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-muted">Resolution</label>
                <div className="space-y-1.5">
                  {RESOLUTIONS.map((res) => (
                    <button
                      key={res.value}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, resolution: res.value }))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border cursor-pointer transition-colors text-left ${
                        config.resolution === res.value
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-muted'
                      }`}
                    >
                      <span className="text-sm font-medium">{res.label}</span>
                      <span className="text-xs text-muted">{res.description}</span>
                      {config.resolution === res.value ? <Check size={14} className="text-accent shrink-0" /> : null}
                    </button>
                  ))}
                </div>
              </div>

              {/* FPS + Quality */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-muted">Frame Rate</label>
                  <select
                    value={config.fps}
                    onChange={(e) => setConfig((c) => ({ ...c, fps: Number(e.target.value) as FrameRate }))}
                    className="w-full h-9 rounded-xl border border-border bg-panel px-3 text-sm text-fg outline-none focus:border-accent"
                  >
                    {FPS_OPTIONS.map((f) => <option key={f} value={f}>{f} fps</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-muted">Quality</label>
                  <select
                    value={config.quality}
                    onChange={(e) => setConfig((c) => ({ ...c, quality: e.target.value as ExportQuality }))}
                    className="w-full h-9 rounded-xl border border-border bg-panel px-3 text-sm text-fg outline-none focus:border-accent"
                  >
                    {QUALITY_OPTIONS.map((q) => <option key={q.value} value={q.value}>{q.label} ({q.bitrate})</option>)}
                  </select>
                </div>
              </div>

              {/* Range */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-muted">Export Range</label>
                <div className="flex gap-2">
                  {(['all', 'selection'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, range: r }))}
                      className={`flex-1 h-9 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                        config.range === r
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted hover:text-fg'
                      }`}
                    >
                      {r === 'all' ? 'Full Video' : 'Selection'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated file size & duration */}
              <div className="rounded-xl border border-border bg-panel px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Duration</span>
                  <span className="font-mono">{Math.floor(durationSec / 60)}:{String(Math.round(durationSec % 60)).padStart(2, '0')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Est. file size</span>
                  <span className="font-mono text-accent">~{estimatedMb} MB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Output</span>
                  <span className="font-mono">{config.resolution} · {config.fps}fps · {config.format.toUpperCase()}</span>
                </div>
              </div>

              <Button variant="primary" size="lg" className="w-full" onClick={startExport}>
                <Download size={15} />
                Start Export
              </Button>
            </>
          ) : (
            /* Export progress screen */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                {isComplete ? (
                  <div className="mx-auto h-14 w-14 rounded-full bg-success/15 flex items-center justify-center">
                    <Check size={28} className="text-success" />
                  </div>
                ) : (
                  <div className="mx-auto h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
                    <Loader2 size={28} className="text-accent animate-spin" />
                  </div>
                )}
                <p className="font-semibold text-sm">{isComplete ? 'Export Complete!' : 'Exporting…'}</p>
                <p className="text-xs text-muted">{EXPORT_STAGES[stageIndex]}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Progress</span>
                  <span className="font-mono">{Math.round(activeJob.progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-panel-hover overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${activeJob.progress}%` }}
                  />
                </div>
              </div>

              {/* Stage steps */}
              <div className="space-y-1.5">
                {EXPORT_STAGES.slice(0, -1).map((stage, i) => (
                  <div key={stage} className={`flex items-center gap-2.5 text-xs ${i < stageIndex ? 'text-success' : i === stageIndex ? 'text-fg' : 'text-muted'}`}>
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                      i < stageIndex ? 'border-success bg-success/10' : i === stageIndex ? 'border-accent' : 'border-border'
                    }`}>
                      {i < stageIndex ? <Check size={9} className="text-success" /> : i === stageIndex ? <Loader2 size={9} className="animate-spin text-accent" /> : null}
                    </div>
                    {stage}
                  </div>
                ))}
              </div>

              {isComplete ? (
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1" onClick={downloadResult}>
                    <Download size={14} />
                    Download
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
                    Close
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
