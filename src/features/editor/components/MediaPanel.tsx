import { useEditor } from '@/features/editor/EditorProvider';
import { useCanvas } from '@/features/editor/CanvasProvider';
import type { MediaAsset } from '@/types';
import { Plus, Upload, Radio } from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';

interface MediaItemMeta {
  tag: string;
  fps: number;
  size: string;
}

const MEDIA_METADATA: Record<string, MediaItemMeta> = {
  media_alpine: { tag: 'Travel', fps: 30, size: '12.4 MB' },
  media_cyberpunk: { tag: 'Cinematic', fps: 30, size: '18.1 MB' },
  media_presenter: { tag: 'Green Screen', fps: 30, size: '15.6 MB' },
};

export function MediaPanel() {
  const { state, dispatch, addUploadedFiles } = useEditor();
  const { addMedia } = useCanvas();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaList = state.snapshot.media.slice(0, 3);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addUploadedFiles(e.target.files);
    }
  };

  const handleAddMedia = (asset: MediaAsset) => {
    addMedia(asset.id, asset.type === 'image' ? 'image' : 'video');
    // Also select the media clip in timeline if available
    const existing = state.snapshot.tracks
      .flatMap((t) => t.items)
      .find((i) => i.mediaId === asset.id);
    if (existing) {
      dispatch({ type: 'select', itemId: existing.id });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12141a] text-[#e2e8f0] select-none p-3 overflow-hidden">
      {/* Hidden file input for Import Files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,image/*,audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-xs font-bold tracking-wider text-slate-100 uppercase">
          Media Assets
        </h2>
        <span className="text-[11px] font-medium bg-[#181b24] text-slate-400 px-2.5 py-0.5 rounded-full border border-[#222634]">
          {mediaList.length} items
        </span>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-[#181b24] hover:bg-[#222634] border border-[#262c3e] text-slate-200 text-xs py-2 px-3 rounded-full flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-colors shadow-sm"
        >
          <Upload size={13} className="text-slate-300" />
          <span>Import Files</span>
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'set-panel', panel: 'ai' })}
          className="flex-1 bg-[#181b24] hover:bg-[#222634] border border-[#262c3e] text-slate-200 text-xs py-2 px-3 rounded-full flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-colors shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Record Studio</span>
        </button>
      </div>

      {/* Media Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
        {mediaList.map((asset) => {
          const meta = MEDIA_METADATA[asset.id] || {
            tag: asset.type === 'video' ? 'Video' : 'Asset',
            fps: 30,
            size: '14.2 MB',
          };
          const durationSec = Math.round((asset.durationMs || 8000) / 1000);

          return (
            <div
              key={asset.id}
              onClick={() => handleAddMedia(asset)}
              className="bg-[#181b24] hover:bg-[#1e2230] border border-[#222634] hover:border-[#2f3549] p-2.5 rounded-xl flex items-center gap-3 transition-all group cursor-pointer shadow-sm"
            >
              {/* 16:9 Thumbnail with Duration Badge */}
              <div className="w-24 h-14 rounded-lg overflow-hidden relative shrink-0 bg-black/60 border border-white/5">
                {asset.thumbnail ? (
                  <img
                    src={asset.thumbnail}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: asset.thumbnailColor || '#0e7490' }}
                  >
                    <Radio size={16} className="text-white/60" />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] font-mono px-1 py-0.2 rounded font-medium shadow">
                  {durationSec}s
                </span>
              </div>

              {/* Media Title & Metadata Badges */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                  {asset.name}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                  <span className="bg-[#222634] text-slate-300 px-1.5 py-0.5 rounded font-medium">
                    {meta.tag}
                  </span>
                  <span className="text-slate-400 font-mono">{meta.fps} FPS</span>
                  <span className="text-slate-400 font-mono">{meta.size}</span>
                </div>
              </div>

              {/* Cyan Plus Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddMedia(asset);
                }}
                className="w-7 h-7 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 text-cyan-400 hover:text-black flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Add to Canvas / Timeline"
              >
                <Plus size={15} strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
