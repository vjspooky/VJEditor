import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import { useCanvas } from '@/features/editor/CanvasProvider';
import type { MediaAsset, MediaType } from '@/types';
import { cx } from '@/utils/cx';
import { formatMediaDuration } from '@/utils/media';
import {
  Bot,
  FolderDown,
  FolderKanban,
  FolderPlus,
  Mic,
  Plus,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';
import { useMemo, useState, type DragEvent } from 'react';

type SubNav = 'import' | 'media' | 'ai' | 'library';

const filterTabs: { id: MediaType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'image', label: 'Images' },
  { id: 'audio', label: 'Audio' },
];

export function MediaPanel() {
  const { state, dispatch, addUploadedFiles } = useEditor();
  const { addMedia } = useCanvas();
  const [subNav, setSubNav] = useState<SubNav>('import');
  const [filter, setFilter] = useState<(typeof filterTabs)[number]['id']>('all');
  const [dragging, setDragging] = useState(false);

  const items = useMemo(
    () => state.snapshot.media.filter((asset) => filter === 'all' || asset.type === filter),
    [state.snapshot.media, filter],
  );

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addUploadedFiles(event.dataTransfer.files);
  }

  return (
    <div className="flex h-full bg-app-elevated select-none">
      {/* CapCut Sub-Sidebar */}
      <div className="w-24 shrink-0 border-r border-border bg-panel flex flex-col py-2 gap-1 text-[11px]">
        <button
          type="button"
          onClick={() => setSubNav('import')}
          className={cx(
            'flex flex-col items-center gap-1 py-2 px-1 rounded-lg mx-1 cursor-pointer transition-colors',
            subNav === 'import' ? 'bg-panel-hover text-accent font-semibold' : 'text-muted hover:text-fg',
          )}
        >
          <FolderPlus size={16} />
          <span>Import</span>
        </button>

        <button
          type="button"
          onClick={() => setSubNav('media')}
          className={cx(
            'flex flex-col items-center gap-1 py-2 px-1 rounded-lg mx-1 cursor-pointer transition-colors',
            subNav === 'media' ? 'bg-panel-hover text-accent font-semibold' : 'text-muted hover:text-fg',
          )}
        >
          <FolderKanban size={16} />
          <span>Project</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubNav('ai');
            dispatch({ type: 'set-panel', panel: 'ai' });
          }}
          className={cx(
            'flex flex-col items-center gap-1 py-2 px-1 rounded-lg mx-1 cursor-pointer transition-colors',
            subNav === 'ai' ? 'bg-panel-hover text-accent font-semibold' : 'text-muted hover:text-fg',
          )}
        >
          <Sparkles size={16} />
          <span>AI media</span>
        </button>

        <button
          type="button"
          onClick={() => setSubNav('library')}
          className={cx(
            'flex flex-col items-center gap-1 py-2 px-1 rounded-lg mx-1 cursor-pointer transition-colors',
            subNav === 'library' ? 'bg-panel-hover text-accent font-semibold' : 'text-muted hover:text-fg',
          )}
        >
          <FolderDown size={16} />
          <span>Library</span>
        </button>
      </div>

      {/* Main Media Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-app overflow-hidden">
        {/* Big Import Dropzone Card */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cx(
            'm-3 rounded-2xl border border-dashed p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[110px]',
            dragging ? 'border-accent bg-accent/15' : 'border-border bg-panel hover:bg-panel-hover hover:border-muted',
          )}
        >
          <div className="h-9 w-9 rounded-full bg-accent/20 grid place-items-center text-accent">
            <Upload size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-fg flex items-center justify-center gap-1">
              <Plus size={14} className="text-accent" /> Import Media
            </p>
            <p className="text-[10px] text-muted mt-0.5">Drag & drop videos, photos, and audio files here</p>
          </div>
          <input
            type="file"
            accept="video/*,image/*,audio/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addUploadedFiles(e.target.files);
            }}
          />
        </label>

        {/* Quick Creation Tool Cards */}
        <div className="px-3 pb-2 grid grid-cols-3 gap-1.5 text-[10px]">
          <button
            type="button"
            onClick={() => dispatch({ type: 'set-panel', panel: 'ai' })}
            className="rounded-xl border border-border bg-panel p-2 flex flex-col items-center gap-1 hover:border-accent hover:bg-panel-hover cursor-pointer transition"
          >
            <Sparkles size={14} className="text-accent" />
            <span className="font-medium text-fg">AI media</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'set-panel', panel: 'ai' })}
            className="rounded-xl border border-border bg-panel p-2 flex flex-col items-center gap-1 hover:border-accent hover:bg-panel-hover cursor-pointer transition"
          >
            <Bot size={14} className="text-emerald-400" />
            <span className="font-medium text-fg">AI avatars</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'set-panel', panel: 'audio' })}
            className="rounded-xl border border-border bg-panel p-2 flex flex-col items-center gap-1 hover:border-accent hover:bg-panel-hover cursor-pointer transition"
          >
            <Mic size={14} className="text-amber-400" />
            <span className="font-medium text-fg">Record</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pt-1 pb-2 flex items-center justify-between border-t border-border">
          <div className="flex gap-1">
            {filterTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cx(
                  'h-6 px-2 rounded-md text-[11px] font-medium cursor-pointer transition',
                  filter === item.id ? 'bg-accent text-white' : 'text-muted hover:text-fg hover:bg-panel',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted">{items.length} files</span>
        </div>

        {/* Media Assets Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start">
          {items.map((asset) => (
            <MediaCard
              key={asset.id}
              asset={asset}
              onAdd={() => {
                if (asset.type === 'video' || asset.type === 'image') addMedia(asset.id, asset.type);
              }}
              onTimeline={() => dispatch({ type: 'add-media', asset })}
            />
          ))}
          {!items.length && (
            <div className="col-span-2 py-8 text-center text-xs text-muted">
              No media files. Click + Import to add videos or photos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaCard({ asset, onAdd, onTimeline }: { asset: MediaAsset; onAdd: () => void; onTimeline: () => void }) {
  const src = asset.src ?? asset.url;
  return (
    <article className="group relative rounded-xl border border-border overflow-hidden bg-panel hover:border-accent/80 transition shadow-sm">
      {/* Visual Thumbnail */}
      <div className="h-20 relative bg-black/60 overflow-hidden" style={{ background: asset.thumbnailColor }}>
        {asset.type === 'image' && src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : asset.type === 'video' && src ? (
          <video src={src} className="h-full w-full object-cover" muted preload="metadata" />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted">
            <Video size={20} />
          </div>
        )}

        {/* Duration badge */}
        {asset.durationMs ? (
          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-white">
            {formatMediaDuration(asset.durationMs / 1000)}
          </span>
        ) : null}

        {/* Quick Add Overlay Button */}
        <button
          type="button"
          onClick={onTimeline}
          title="Add to Timeline"
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
        >
          <div className="h-8 w-8 rounded-full bg-accent text-white grid place-items-center shadow-lg hover:scale-110 transition">
            <Plus size={18} />
          </div>
        </button>
      </div>

      {/* Asset Info & Action Buttons */}
      <div className="p-2">
        <p className="text-[11px] font-medium text-fg truncate" title={asset.name}>
          {asset.name}
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-1">
          <Button size="sm" className="h-6 text-[10px] px-1" onClick={onAdd} disabled={asset.type === 'audio'}>
            {asset.type === 'audio' ? 'Audio' : 'Canvas'}
          </Button>
          <Button size="sm" variant="primary" className="h-6 text-[10px] px-1" onClick={onTimeline}>
            + Track
          </Button>
        </div>
      </div>
    </article>
  );
}
