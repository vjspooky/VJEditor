import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { MediaAsset, TimelineItem } from '@/types';
import { formatClock } from '@/utils/format';
import { FileVideo, Image as ImageIcon, Music, Upload, X } from 'lucide-react';
import { useRef } from 'react';

interface ReplaceMediaModalProps {
  clip: TimelineItem;
  onClose: () => void;
}

export function ReplaceMediaModal({ clip, onClose }: ReplaceMediaModalProps) {
  const { state, dispatch, addUploadedFiles } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter project media by kind compatibility
  const candidateAssets = state.snapshot.media.filter((asset) => {
    if (clip.kind === 'audio') return asset.type === 'audio';
    if (clip.kind === 'video') return asset.type === 'video' || asset.type === 'image';
    return false;
  });

  const handleSelectAsset = (asset: MediaAsset) => {
    dispatch({ type: 'replace-media', itemId: clip.id, asset });
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addUploadedFiles(files);
      // Wait for asset creation and selection, or onClose
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 p-4 grid place-items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="replace-media-title"
        className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-app-elevated flex flex-col shadow-2xl"
      >
        <div className="h-12 px-4 flex items-center justify-between border-b border-border">
          <div>
            <h2 id="replace-media-title" className="text-sm font-semibold">
              Replace Media
            </h2>
            <p className="text-[11px] text-muted">
              Replacing media on <span className="text-fg font-medium">{clip.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-7 w-7 grid place-items-center rounded-lg text-muted hover:bg-panel cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Project Media ({candidateAssets.length})
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={13} />
              Upload new file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={clip.kind === 'audio' ? 'audio/*' : 'video/*,image/*'}
              onChange={handleFileUpload}
            />
          </div>

          {candidateAssets.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted border border-dashed border-border rounded-xl">
              No matching media assets found in project. Click &ldquo;Upload new file&rdquo; above.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {candidateAssets.map((asset) => {
                const isCurrent = clip.mediaId === asset.id;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => handleSelectAsset(asset)}
                    className={`relative p-2 rounded-xl border text-left flex flex-col gap-2 transition cursor-pointer hover:border-accent ${
                      isCurrent ? 'border-accent bg-accent/10 ring-1 ring-accent' : 'border-border bg-panel hover:bg-panel-hover'
                    }`}
                  >
                    <div className="h-24 rounded-lg bg-black/40 overflow-hidden relative flex items-center justify-center">
                      {asset.type === 'image' && (asset.src || asset.url) ? (
                        <img
                          src={asset.src ?? asset.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : asset.type === 'video' && (asset.src || asset.url) ? (
                        <video
                          src={asset.src ?? asset.url}
                          className="h-full w-full object-cover"
                          muted
                        />
                      ) : (
                        <div
                          className="h-full w-full grid place-items-center"
                          style={{ backgroundColor: asset.thumbnailColor }}
                        >
                          {asset.type === 'audio' ? (
                            <Music size={24} className="text-white/70" />
                          ) : asset.type === 'video' ? (
                            <FileVideo size={24} className="text-white/70" />
                          ) : (
                            <ImageIcon size={24} className="text-white/70" />
                          )}
                        </div>
                      )}
                      {asset.durationMs ? (
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[9px] text-white">
                          {formatClock(asset.durationMs)}
                        </span>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{asset.name}</p>
                      <p className="text-[10px] text-muted capitalize">
                        {asset.type} {asset.width ? `· ${asset.width}x${asset.height}` : ''}
                      </p>
                    </div>

                    {isCurrent ? (
                      <span className="absolute top-3 right-3 text-[9px] font-semibold bg-accent text-white px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-12 px-4 border-t border-border flex items-center justify-end gap-2 bg-app">
          <Button size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
