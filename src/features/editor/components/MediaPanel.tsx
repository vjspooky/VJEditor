import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import { useCanvas } from '@/features/editor/CanvasProvider';
import type { MediaAsset, MediaType } from '@/types';
import { cx } from '@/utils/cx';
import { Upload } from 'lucide-react';
import { useMemo, useState, type DragEvent } from 'react';

const tabs: { id: MediaType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'image', label: 'Images' },
  { id: 'audio', label: 'Audio' },
];

export function MediaPanel() {
  const { state, dispatch, addUploadedFiles } = useEditor();
  const { addMedia } = useCanvas();
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('all');
  const [dragging, setDragging] = useState(false);

  const items = useMemo(
    () => state.snapshot.media.filter((asset) => tab === 'all' || asset.type === tab),
    [state.snapshot.media, tab],
  );

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addUploadedFiles(event.dataTransfer.files);
  }

  return (
    <div className="flex flex-col h-full">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cx(
          'm-3 rounded-xl border border-dashed p-4 text-center cursor-pointer',
          dragging ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
        )}
      >
        <Upload size={16} className="mx-auto text-muted" />
        <p className="text-xs text-muted mt-2">Drop files or click to upload</p>
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
      <div className="px-3 flex gap-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cx(
              'h-7 px-2 rounded-md text-xs cursor-pointer',
              tab === item.id ? 'bg-panel-hover text-fg' : 'text-muted hover:text-fg',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-3 grid grid-cols-2 gap-2 content-start">
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
      </div>
    </div>
  );
}

function MediaCard({ asset, onAdd, onTimeline }: { asset: MediaAsset; onAdd: () => void; onTimeline: () => void }) {
  return (
    <article className="rounded-lg border border-border overflow-hidden bg-panel">
      <div className="h-16" style={{ background: asset.thumbnailColor }} />
      <div className="p-2">
        <p className="text-[11px] truncate">{asset.name}</p>
        <div className="mt-2 grid grid-cols-2 gap-1"><Button size="sm" className="h-7 text-[10px]" onClick={onAdd} disabled={asset.type === 'audio'}>{asset.type === 'audio' ? 'Audio' : 'Canvas'}</Button><Button size="sm" className="h-7 text-[10px]" onClick={onTimeline}>Timeline</Button></div>
      </div>
    </article>
  );
}
