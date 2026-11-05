import { Button } from '@/components/ui/Button';
import { projectService } from '@/services/projectService';
import { mediaService } from '@/services/mediaService';
import type { MediaAsset, MediaType } from '@/types';
import { formatFileSize, formatMediaDuration, getMediaType, validateMediaFile } from '@/utils/media';
import { formatRelativeTime } from '@/utils/format';
import {
  Check,
  Download,
  FileAudio,
  FileImage,
  FileVideo,
  Grid2X2,
  List,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';

type Filter = 'all' | MediaType;
type SortMode = 'recent' | 'oldest' | 'name-asc' | 'name-desc' | 'largest' | 'smallest';
type ViewMode = 'grid' | 'list';
type Modal = 'preview' | 'rename' | 'delete' | 'project' | null;
type QueueItem = { id: string; name: string; type: MediaType | null; size: number; progress: number; status: 'uploading' | 'ready' | 'error'; error?: string };

export function MediaPage() {
  const [assets, setAssets] = useState(() => mediaService.list());
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortMode>('recent');
  const [view, setView] = useState<ViewMode>(() => readViewMode());
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = useMemo(() => {
    return assets.filter((asset) => {
      const matchesType = filter === 'all' || asset.type === filter;
      const matchesSearch = `${asset.name} ${asset.type}`.toLowerCase().includes(search.trim().toLowerCase());
      return matchesType && matchesSearch;
    }).sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      if (sort === 'oldest') return dateValue(a.createdAt) - dateValue(b.createdAt);
      if (sort === 'largest') return (b.size ?? 0) - (a.size ?? 0);
      if (sort === 'smallest') return (a.size ?? 0) - (b.size ?? 0);
      return dateValue(b.createdAt) - dateValue(a.createdAt);
    });
  }, [assets, filter, search, sort]);

  function refresh() {
    setAssets(mediaService.list());
  }

  function setViewMode(next: ViewMode) {
    setView(next);
    localStorage.setItem('vjeditor.media.view', next);
  }

  function receiveFiles(files: FileList | File[]) {
    Array.from(files).forEach((file) => {
      const type = getMediaType(file);
      const error = validateMediaFile(file);
      const itemId = `${file.name}-${file.lastModified}-${Math.random()}`;
      if (error || !type) {
        setQueue((current) => [...current, { id: itemId, name: file.name, type, size: file.size, progress: 0, status: 'error', error: error ?? 'This file type is not supported.' }]);
        return;
      }
      const asset = mediaService.create(file);
      setQueue((current) => [...current, { id: itemId, name: file.name, type, size: file.size, progress: 0, status: 'uploading' }]);
      void simulateUpload(itemId, asset.id);
    });
  }

  async function simulateUpload(queueId: string, assetId: string) {
    for (const progress of [18, 42, 68, 86, 100]) {
      await wait(180);
      setQueue((current) => current.map((item) => item.id === queueId ? { ...item, progress, status: progress === 100 ? 'ready' : 'uploading' } : item));
    }
    if (!mediaService.get(assetId)) refresh();
    else refresh();
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) receiveFiles(event.target.files);
    event.target.value = '';
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) receiveFiles(event.dataTransfer.files);
  }

  function selectAsset(asset: MediaAsset, nextModal: Modal) {
    setSelected(asset);
    setModal(nextModal);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div><p className="text-xs uppercase tracking-[0.16em] text-accent">Library</p><h1 className="text-2xl font-semibold tracking-tight mt-1">Media Library</h1><p className="text-sm text-muted mt-2">Manage the videos, images, and audio that power your projects.</p></div>
        <Button variant="primary" onClick={() => inputRef.current?.click()}><Upload size={16} />Upload Media</Button>
        <input ref={inputRef} type="file" multiple accept="video/*,image/*,audio/*" className="hidden" onChange={onInput} aria-label="Upload media" />
      </header>

      <div onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`rounded-2xl border border-dashed p-7 text-center transition-colors ${dragging ? 'border-accent bg-accent-soft' : 'border-border bg-panel'}`}>
        <Upload size={24} className="mx-auto text-accent" /><h2 className="text-base font-medium mt-3">Upload your media</h2><p className="text-sm text-muted mt-1">Drag and drop files here or <button type="button" className="text-accent hover:underline cursor-pointer" onClick={() => inputRef.current?.click()}>browse files</button></p><p className="text-[11px] text-subtle mt-3">Videos, images, and audio up to 500 MB per file</p>
      </div>

      {queue.length ? <UploadQueue items={queue} onRemove={(id) => setQueue((current) => current.filter((item) => item.id !== id))} /> : null}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {(['all', 'video', 'image', 'audio'] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`h-8 px-3 rounded-lg text-xs capitalize cursor-pointer ${filter === item ? 'bg-panel-hover text-fg' : 'text-muted hover:text-fg'}`}>{item === 'all' ? 'All media' : `${item}s`}</button>)}
        <div className="ml-auto flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <label className="flex items-center gap-2 h-9 flex-1 sm:w-52 rounded-lg border border-border bg-panel px-3"><Search size={14} className="text-subtle" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media..." aria-label="Search media" className="bg-transparent outline-none text-sm w-full placeholder:text-subtle" /></label>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Sort media" className="h-9 rounded-lg border border-border bg-panel px-2 text-xs outline-none"><option value="recent">Recently Added</option><option value="oldest">Oldest</option><option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="largest">Largest</option><option value="smallest">Smallest</option></select>
          <div className="flex h-9 rounded-lg border border-border bg-panel p-0.5"><IconButton label="Grid view" active={view === 'grid'} onClick={() => setViewMode('grid')}><Grid2X2 size={15} /></IconButton><IconButton label="List view" active={view === 'list'} onClick={() => setViewMode('list')}><List size={15} /></IconButton></div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-7 mb-3"><h2 className="text-lg font-semibold">Your media</h2><span className="text-xs text-muted">{visible.length} item{visible.length === 1 ? '' : 's'}</span></div>
      {!visible.length ? <EmptyMediaState hasSearch={Boolean(search || filter !== 'all')} onUpload={() => inputRef.current?.click()} /> : view === 'grid' ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map((asset) => <MediaCard key={asset.id} asset={asset} onPreview={() => selectAsset(asset, 'preview')} onRename={() => selectAsset(asset, 'rename')} onDelete={() => selectAsset(asset, 'delete')} onAdd={() => selectAsset(asset, 'project')} />)}</div> : <MediaList assets={visible} onPreview={(asset) => selectAsset(asset, 'preview')} onRename={(asset) => selectAsset(asset, 'rename')} onDelete={(asset) => selectAsset(asset, 'delete')} onAdd={(asset) => selectAsset(asset, 'project')} />}

      {modal === 'preview' && selected ? <MediaPreviewModal asset={selected} onClose={() => setModal(null)} /> : null}
      {modal === 'rename' && selected ? <RenameMediaModal asset={selected} onClose={() => setModal(null)} onSaved={() => { refresh(); setModal(null); }} /> : null}
      {modal === 'delete' && selected ? <DeleteMediaDialog asset={selected} onClose={() => setModal(null)} onDeleted={() => { mediaService.remove(selected.id); refresh(); setModal(null); }} /> : null}
      {modal === 'project' && selected ? <AddToProjectModal asset={selected} onClose={() => setModal(null)} onAdded={() => { refresh(); setModal(null); }} /> : null}
    </div>
  );
}

function UploadQueue({ items, onRemove }: { items: QueueItem[]; onRemove: (id: string) => void }) {
  return <section className="mt-5 rounded-xl border border-border bg-panel p-4"><div className="flex items-center justify-between mb-3"><h2 className="text-sm font-medium">Upload queue</h2><span className="text-xs text-muted">{items.filter((item) => item.status === 'ready').length}/{items.length} ready</span></div><div className="space-y-3">{items.map((item) => <div key={item.id} className="flex items-center gap-3"><span className="h-8 w-8 shrink-0 rounded-lg bg-panel-hover grid place-items-center text-accent">{item.type === 'video' ? <FileVideo size={15} /> : item.type === 'image' ? <FileImage size={15} /> : <FileAudio size={15} />}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-xs"><span className="truncate">{item.name}</span><span className={item.status === 'error' ? 'text-danger' : 'text-muted'}>{item.status === 'error' ? 'Error' : `${item.progress}%`}</span></div>{item.status === 'error' ? <p className="text-[11px] text-danger mt-1">{item.error}</p> : <div className="h-1.5 bg-app rounded-full mt-2 overflow-hidden"><div className="h-full bg-accent transition-all" style={{ width: `${item.progress}%` }} /></div>}</div><button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name} from upload queue`} className="h-7 w-7 grid place-items-center rounded-md text-muted hover:text-fg cursor-pointer"><X size={14} /></button></div>)}</div></section>;
}

function MediaCard({ asset, onPreview, onRename, onDelete, onAdd }: { asset: MediaAsset; onPreview: () => void; onRename: () => void; onDelete: () => void; onAdd: () => void }) {
  return <article className="rounded-xl border border-border bg-panel overflow-hidden group"><button type="button" onClick={onPreview} className="block w-full text-left cursor-pointer"><MediaVisual asset={asset} /></button><div className="p-3 flex items-start justify-between gap-2"><button type="button" onClick={onPreview} className="min-w-0 text-left cursor-pointer"><p className="text-sm font-medium truncate">{asset.name}</p><p className="text-xs text-muted mt-1 capitalize">{asset.type} <span className="mx-1">•</span> {formatFileSize(asset.size)}</p><p className="text-[11px] text-subtle mt-1">{formatRelativeTime(asset.createdAt)}{asset.projectIds?.length ? ` • ${asset.projectIds.length} project${asset.projectIds.length > 1 ? 's' : ''}` : ''}</p></button><MediaMenu asset={asset} onPreview={onPreview} onRename={onRename} onDelete={onDelete} onAdd={onAdd} /></div></article>;
}

function MediaList({ assets, onPreview, onRename, onDelete, onAdd }: { assets: MediaAsset[]; onPreview: (asset: MediaAsset) => void; onRename: (asset: MediaAsset) => void; onDelete: (asset: MediaAsset) => void; onAdd: (asset: MediaAsset) => void }) {
  return <div className="rounded-xl border border-border bg-panel overflow-x-auto"><div className="min-w-[680px]"><div className="grid grid-cols-[72px_minmax(220px,1fr)_100px_110px_140px_44px] gap-3 px-4 py-3 border-b border-border text-[11px] uppercase tracking-wide text-subtle"><span>Preview</span><span>Name</span><span>Type</span><span>Size</span><span>Date added</span><span /></div>{assets.map((asset) => <div key={asset.id} className="grid grid-cols-[72px_minmax(220px,1fr)_100px_110px_140px_44px] gap-3 items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-panel-hover"><button type="button" onClick={() => onPreview(asset)} className="h-10 w-16 overflow-hidden rounded-md cursor-pointer"><MediaVisual asset={asset} compact /></button><button type="button" onClick={() => onPreview(asset)} className="truncate text-left text-sm cursor-pointer">{asset.name}</button><span className="text-xs text-muted capitalize">{asset.type}</span><span className="text-xs text-muted">{formatFileSize(asset.size)}</span><span className="text-xs text-muted">{formatRelativeTime(asset.createdAt)}</span><MediaMenu asset={asset} onPreview={() => onPreview(asset)} onRename={() => onRename(asset)} onDelete={() => onDelete(asset)} onAdd={() => onAdd(asset)} /></div>)}</div></div>;
}

function MediaVisual({ asset, compact = false }: { asset: MediaAsset; compact?: boolean }) {
  const url = asset.url ?? asset.src;
  if (asset.type === 'image' && url) return <div className={`${compact ? 'h-full' : 'h-36'} bg-panel-hover`}><img src={url} alt="" className="h-full w-full object-cover" /></div>;
  if (asset.type === 'video' && url) return <div className={`${compact ? 'h-full' : 'h-36'} bg-black relative`}><video src={url} muted preload="metadata" className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] flex items-center gap-1"><Play size={10} fill="currentColor" />{formatMediaDuration(asset.durationMs ? asset.durationMs / 1000 : undefined)}</span></div>;
  return <div className={`${compact ? 'h-full' : 'h-36'} flex flex-col items-center justify-center gap-3`} style={{ background: asset.thumbnailColor }}><MediaTypeIcon type={asset.type} size={compact ? 18 : 30} /><div className="flex gap-1.5 items-end opacity-60">{[18, 28, 12, 24, 16, 30, 20].map((height, index) => <span key={index} className="w-1 rounded-t bg-white" style={{ height }} />)}</div></div>;
}

function MediaMenu({ asset, onPreview, onRename, onDelete, onAdd }: { asset: MediaAsset; onPreview: () => void; onRename: () => void; onDelete: () => void; onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  function download() { const url = asset.url ?? asset.src; if (!url) return; const anchor = document.createElement('a'); anchor.href = url; anchor.download = asset.name; anchor.click(); }
  return <div className="relative"><button type="button" aria-label={`Actions for ${asset.name}`} onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }} className="h-7 w-7 rounded-md text-muted hover:bg-panel-hover cursor-pointer"><MoreHorizontal size={16} className="mx-auto" /></button>{open ? <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-border bg-app-elevated p-1 text-sm shadow-xl"><MenuItem icon={FileVideo} label="Preview" onClick={() => { onPreview(); setOpen(false); }} /><MenuItem icon={Plus} label="Add to project" onClick={() => { onAdd(); setOpen(false); }} /><MenuItem icon={Pencil} label="Rename" onClick={() => { onRename(); setOpen(false); }} /><MenuItem icon={Download} label="Download" onClick={() => { download(); setOpen(false); }} /><MenuItem icon={Trash2} label="Delete" danger onClick={() => { onDelete(); setOpen(false); }} /></div> : null}</div>;
}

function MenuItem({ icon: Icon, label, onClick, danger = false }: { icon: typeof FileVideo; label: string; onClick: () => void; danger?: boolean }) { return <button type="button" onClick={onClick} className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-panel cursor-pointer ${danger ? 'text-danger' : ''}`}><Icon size={14} />{label}</button>; }
function MediaTypeIcon({ type, size = 20 }: { type: MediaType; size?: number }) { const Icon = type === 'video' ? FileVideo : type === 'image' ? FileImage : FileAudio; return <Icon size={size} />; }
function EmptyMediaState({ hasSearch, onUpload }: { hasSearch: boolean; onUpload: () => void }) { return <div className="rounded-xl border border-dashed border-border bg-panel p-12 text-center"><FileImage size={28} className="mx-auto text-subtle" /><h2 className="text-lg font-medium mt-3">{hasSearch ? 'No media found' : 'Your media library is empty'}</h2><p className="text-sm text-muted mt-2">{hasSearch ? 'Try a different search term or filter.' : 'Upload videos, images and audio to start creating.'}</p>{!hasSearch ? <Button variant="primary" className="mt-4" onClick={onUpload}><Upload size={15} />Upload Media</Button> : null}</div>; }

function MediaPreviewModal({ asset, onClose }: { asset: MediaAsset; onClose: () => void }) {
  const url = asset.url ?? asset.src;
  return <Dialog title={asset.name} onClose={onClose}><div className="rounded-xl overflow-hidden bg-black min-h-48 grid place-items-center">{asset.type === 'video' && url ? <video src={url} controls autoPlay className="max-h-[52vh] max-w-full" /> : asset.type === 'image' && url ? <img src={url} alt={asset.name} className="max-h-[52vh] max-w-full object-contain" /> : asset.type === 'audio' && url ? <audio src={url} controls className="w-[90%]" /> : <div className="p-12 text-muted"><MediaTypeIcon type={asset.type} size={36} /></div>}</div><InfoGrid asset={asset} /></Dialog>;
}

function RenameMediaModal({ asset, onClose, onSaved }: { asset: MediaAsset; onClose: () => void; onSaved: () => void }) { const [name, setName] = useState(asset.name); const [error, setError] = useState(''); function save() { if (!name.trim()) { setError('A media name is required.'); return; } mediaService.update(asset.id, { name: name.trim() }); onSaved(); } return <Dialog title="Rename Media" onClose={onClose}><Field label="Media name" error={error}><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(''); }} className="input-field" /></Field><DialogActions onClose={onClose} onConfirm={save} confirmLabel="Save" /></Dialog>; }
function DeleteMediaDialog({ asset, onClose, onDeleted }: { asset: MediaAsset; onClose: () => void; onDeleted: () => void }) { return <Dialog title="Delete Media?" onClose={onClose}><p className="text-sm text-muted">Are you sure you want to delete <span className="text-fg font-medium">{asset.name}</span>? This action cannot be undone.</p><DialogActions onClose={onClose} onConfirm={onDeleted} confirmLabel="Delete" danger /></Dialog>; }
function AddToProjectModal({ asset, onClose, onAdded }: { asset: MediaAsset; onClose: () => void; onAdded: () => void }) { const projects = projectService.list(); const [projectId, setProjectId] = useState(projects[0]?.project.id ?? ''); function add() { if (projectId) { mediaService.addToProject(asset.id, projectId); onAdded(); } } return <Dialog title="Add to Project" onClose={onClose}><p className="text-sm text-muted mb-4">Choose a project for <span className="text-fg">{asset.name}</span>.</p>{projects.length ? <div className="space-y-2">{projects.map((stored) => <label key={stored.project.id} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-panel"><input type="radio" name="project" checked={projectId === stored.project.id} onChange={() => setProjectId(stored.project.id)} /> <span className="text-sm">{stored.project.name}</span></label>)}</div> : <p className="text-sm text-muted">Create a project before adding media.</p>}<DialogActions onClose={onClose} onConfirm={add} confirmLabel="Add" /></Dialog>; }
function InfoGrid({ asset }: { asset: MediaAsset }) { return <div className="grid grid-cols-2 gap-3 mt-5"><Info label="Type" value={asset.type} /><Info label="Size" value={formatFileSize(asset.size)} /><Info label="Duration" value={formatMediaDuration(asset.durationMs ? asset.durationMs / 1000 : undefined)} /><Info label="Added" value={formatRelativeTime(asset.createdAt)} />{asset.width && asset.height ? <Info label="Resolution" value={`${asset.width} x ${asset.height}`} /> : null}</div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-panel p-2.5"><p className="text-[11px] text-subtle">{label}</p><p className="text-sm capitalize mt-1">{value}</p></div>; }
function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-50 bg-black/70 p-4 grid place-items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="media-dialog-title" className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl border border-border bg-app-elevated p-5 shadow-2xl"><div className="flex items-center justify-between mb-5"><h2 id="media-dialog-title" className="text-lg font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="h-8 w-8 grid place-items-center rounded-lg text-muted hover:bg-panel-hover cursor-pointer"><X size={16} /></button></div>{children}</div></div>; }
function DialogActions({ onClose, onConfirm, confirmLabel, danger = false }: { onClose: () => void; onConfirm: () => void; confirmLabel: string; danger?: boolean }) { return <div className="flex justify-end gap-2 pt-5"><Button onClick={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{danger ? <Trash2 size={14} /> : <Check size={14} />}{confirmLabel}</Button></div>; }
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <label className="block mb-4"><span className="text-xs text-muted">{label}</span>{children}{error ? <span className="block text-xs text-danger mt-1">{error}</span> : null}</label>; }
function IconButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-label={label} onClick={onClick} className={`h-8 w-8 grid place-items-center rounded-md cursor-pointer ${active ? 'bg-panel-hover text-fg' : 'text-muted hover:text-fg'}`}>{children}</button>; }
function wait(ms: number) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }
function dateValue(value: string) { const parsed = Date.parse(value); return Number.isNaN(parsed) ? 0 : parsed; }
function readViewMode(): ViewMode { return localStorage.getItem('vjeditor.media.view') === 'list' ? 'list' : 'grid'; }
