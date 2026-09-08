import { Button } from '@/components/ui/Button';
import { projectService } from '@/services/projectService';
import { AiToolsDashboard } from '@/features/ai/AiToolsDashboard';
import type { AspectRatio, ProjectResolution, StoredProject } from '@/types';
import { formatDuration, formatRelativeTime } from '@/utils/format';
import {
  Check,
  Copy,
  FilePlus2,
  FileVideo,
  Grid2X2,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type SortMode = 'recent' | 'name-asc' | 'name-desc' | 'newest' | 'oldest';
type ViewMode = 'grid' | 'list';
type ModalMode = 'create' | 'ai' | 'rename' | 'delete' | null;
type ProjectActions = {
  onOpen: (id: string) => void;
  onRename: (project: StoredProject) => void;
  onDelete: (project: StoredProject) => void;
  onRefresh: () => void;
};

export function DashboardHomePage() {
  return <DashboardContent home />;
}

export function DashboardProjectsPage() {
  return <DashboardContent />;
}

function DashboardContent({ home = false }: { home?: boolean }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState(() => projectService.list());
  const [sort, setSort] = useState<SortMode>('recent');
  const [view, setView] = useState<ViewMode>(() => readViewMode());
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<StoredProject | null>(null);
  const search = searchParams.get('q') ?? '';

  const visibleProjects = useMemo(() => {
    const filtered = projects.filter((stored) =>
      stored.project.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      if (sort === 'name-asc') return a.project.name.localeCompare(b.project.name);
      if (sort === 'name-desc') return b.project.name.localeCompare(a.project.name);
      if (sort === 'newest') return dateValue(b.project.createdAt) - dateValue(a.project.createdAt);
      if (sort === 'oldest') return dateValue(a.project.createdAt) - dateValue(b.project.createdAt);
      return dateValue(b.project.updatedAt) - dateValue(a.project.updatedAt);
    });
  }, [projects, search, sort]);

  function refresh() {
    setProjects(projectService.list());
  }

  function openCreate(ai = false) {
    setModal(ai ? 'ai' : 'create');
  }

  function setViewMode(next: ViewMode) {
    setView(next);
    sessionStorage.setItem('vjeditor_dashboard_view', next);
  }

  function startRename(project: StoredProject) {
    setSelected(project);
    setModal('rename');
  }

  function startDelete(project: StoredProject) {
    setSelected(project);
    setModal('delete');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <DashboardHeader
        search={search}
        onSearch={(value) => {
          const next = new URLSearchParams(searchParams);
          if (value.trim()) next.set('q', value);
          else next.delete('q');
          setSearchParams(next, { replace: true });
        }}
        sort={sort}
        onSort={setSort}
        view={view}
        onView={setViewMode}
      />

      {home ? <WelcomeSection onCreate={() => openCreate()} onAI={() => openCreate(true)} /> : null}
      {home ? <QuickCreate onBlank={() => openCreate()} onAI={() => openCreate(true)} /> : null}

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-accent">Workspace</p>
            <h2 className="text-xl font-semibold mt-1">{home ? 'Recent Projects' : 'All Projects'}</h2>
          </div>
          <span className="text-xs text-muted">
            {visibleProjects.length} project{visibleProjects.length === 1 ? '' : 's'}
          </span>
        </div>
        {visibleProjects.length === 0 ? (
          <EmptyProjectsState search={Boolean(search.trim())} onCreate={() => openCreate()} />
        ) : view === 'grid' ? (
          <ProjectGrid
            projects={visibleProjects}
            onOpen={(id) => navigate(`/editor/${id}`)}
            onRename={startRename}
            onDelete={startDelete}
            onRefresh={refresh}
          />
        ) : (
          <ProjectList
            projects={visibleProjects}
            onOpen={(id) => navigate(`/editor/${id}`)}
            onRename={startRename}
            onDelete={startDelete}
            onRefresh={refresh}
          />
        )}
      </section>

      {modal === 'create' ? (
        <CreateProjectModal onClose={() => setModal(null)} onCreated={(id) => navigate(`/editor/${id}`)} />
      ) : null}
      {modal === 'ai' ? (
        <AIProjectModal onClose={() => setModal(null)} onCreated={(id) => navigate(`/editor/${id}`)} />
      ) : null}
      {modal === 'rename' && selected ? (
        <RenameProjectModal
          project={selected}
          onClose={() => setModal(null)}
          onSaved={() => {
            refresh();
            setModal(null);
          }}
        />
      ) : null}
      {modal === 'delete' && selected ? (
        <DeleteProjectDialog
          project={selected}
          onClose={() => setModal(null)}
          onDeleted={() => {
            projectService.remove(selected.project.id);
            refresh();
            setModal(null);
          }}
        />
      ) : null}
    </div>
  );
}

function DashboardHeader({
  search,
  onSearch,
  sort,
  onSort,
  view,
  onView,
}: {
  search: string;
  onSearch: (value: string) => void;
  sort: SortMode;
  onSort: (value: SortMode) => void;
  view: ViewMode;
  onView: (value: ViewMode) => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 mb-7">
      <div>
        <p className="text-sm text-muted">Home</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Your creative workspace</h1>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <label className="flex items-center gap-2 h-9 w-full sm:w-56 rounded-lg border border-border bg-panel px-3">
          <Search size={15} className="text-subtle" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search projects..."
            aria-label="Search projects"
            className="bg-transparent outline-none text-sm w-full placeholder:text-subtle"
          />
        </label>
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value as SortMode)}
          aria-label="Sort projects"
          className="h-9 rounded-lg border border-border bg-panel px-2 text-xs outline-none"
        >
          <option value="recent">Recently Edited</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <div className="flex h-9 rounded-lg border border-border bg-panel p-0.5">
          <IconButton label="Grid view" active={view === 'grid'} onClick={() => onView('grid')}>
            <Grid2X2 size={15} />
          </IconButton>
          <IconButton label="List view" active={view === 'list'} onClick={() => onView('list')}>
            <List size={15} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function WelcomeSection({ onCreate, onAI }: { onCreate: () => void; onAI: () => void }) {
  return (
    <section className="rounded-2xl border border-border bg-panel p-5 sm:p-7 flex flex-wrap items-center justify-between gap-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-accent">VJEditor Studio</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2">Create something amazing</h2>
        <p className="text-sm text-muted mt-2 max-w-xl">Turn your ideas into professional videos with VJEditor.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={onCreate}><Plus size={16} />Create New Video</Button>
        <Button variant="secondary" onClick={onAI}><Sparkles size={16} />AI Video</Button>
      </div>
    </section>
  );
}

function QuickCreate({ onBlank, onAI }: { onBlank: () => void; onAI: () => void }) {
  const cards = [
    { title: 'Blank Project', body: 'Start editing from scratch.', icon: FilePlus2, action: 'Create', onClick: onBlank },
    { title: 'Create with AI', body: 'Turn a prompt into a complete video.', icon: Sparkles, action: 'Generate', onClick: onAI },
    { title: 'Import Video', body: 'Start editing an existing video.', icon: Upload, action: 'Coming in Phase 3', onClick: undefined },
  ];
  return (
    <section className="mt-7">
      <h2 className="text-sm font-medium mb-3">Quick Create</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-xl border border-border bg-app-elevated p-4 flex items-start gap-3">
            <span className="h-9 w-9 shrink-0 rounded-lg bg-accent-soft text-accent grid place-items-center"><card.icon size={17} /></span>
            <div className="min-w-0 flex-1"><p className="text-sm font-medium">{card.title}</p><p className="text-xs text-muted mt-1">{card.body}</p><Button size="sm" className="mt-3" disabled={!card.onClick} onClick={card.onClick}>{card.action}</Button></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectGrid({ projects, ...actions }: { projects: StoredProject[] } & ProjectActions) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{projects.map((stored) => <ProjectCard key={stored.project.id} stored={stored} {...actions} />)}</div>;
}

function ProjectCard({ stored, onOpen, onRename, onDelete, onRefresh }: { stored: StoredProject } & ProjectActions) {
  return (
    <article className="group rounded-xl border border-border bg-panel overflow-hidden hover:border-border-strong transition-colors">
      <button type="button" onClick={() => onOpen(stored.project.id)} className="block w-full text-left cursor-pointer"><ProjectThumbnail stored={stored} /></button>
      <div className="p-3 flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-sm font-medium truncate">{stored.project.name}</p><p className="text-xs text-muted mt-1">{formatDuration(stored.project.duration)} <span className="mx-1">•</span> {stored.project.aspectRatio}</p><p className="text-[11px] text-subtle mt-1">Edited {formatRelativeTime(stored.project.updatedAt)}</p></div><ProjectMenu stored={stored} onRename={onRename} onDelete={onDelete} onRefresh={onRefresh} /></div>
    </article>
  );
}

function ProjectList({ projects, ...actions }: { projects: StoredProject[] } & ProjectActions) {
  return <div className="rounded-xl border border-border bg-panel overflow-x-auto"><div className="min-w-[620px]"><div className="grid grid-cols-[minmax(240px,1fr)_100px_100px_140px_44px] gap-3 px-4 py-3 border-b border-border text-[11px] uppercase tracking-wide text-subtle"><span>Project</span><span>Duration</span><span>Ratio</span><span>Last edited</span><span /></div>{projects.map((stored) => <div key={stored.project.id} className="grid grid-cols-[minmax(240px,1fr)_100px_100px_140px_44px] gap-3 items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-panel-hover"><button type="button" onClick={() => actions.onOpen(stored.project.id)} className="flex items-center gap-3 text-left min-w-0 cursor-pointer"><span className="h-10 w-16 shrink-0 rounded-md overflow-hidden"><ProjectThumbnail stored={stored} compact /></span><span className="truncate text-sm">{stored.project.name}</span></button><span className="text-xs text-muted">{formatDuration(stored.project.duration)}</span><span className="text-xs text-muted">{stored.project.aspectRatio}</span><span className="text-xs text-muted">{formatRelativeTime(stored.project.updatedAt)}</span><ProjectMenu stored={stored} onRename={actions.onRename} onDelete={actions.onDelete} onRefresh={actions.onRefresh} /></div>)}</div></div>;
}

function ProjectThumbnail({ stored, compact = false }: { stored: StoredProject; compact?: boolean }) {
  return <div className={`${compact ? 'h-full' : 'h-36'} relative overflow-hidden`} style={{ background: stored.project.thumbnailColor }}><div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, transparent 20%, ${stored.project.thumbnailColor} 20%, #101217 65%, transparent 65%)` }} /><span className="absolute bottom-2 right-2 text-[11px] bg-app/80 px-1.5 py-0.5 rounded">{formatDuration(stored.project.duration)}</span></div>;
}

function ProjectMenu({ stored, onRename, onDelete, onRefresh }: { stored: StoredProject; onRename: (project: StoredProject) => void; onDelete: (project: StoredProject) => void; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return <div className="relative"><button type="button" className="h-7 w-7 rounded-md text-muted hover:bg-panel-hover cursor-pointer" onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }} aria-label={`Actions for ${stored.project.name}`}><MoreHorizontal size={16} className="mx-auto" /></button>{open ? <div className="absolute right-0 top-8 z-20 w-36 rounded-lg border border-border bg-app-elevated p-1 text-sm shadow-xl"><MenuButton icon={FileVideo} label="Open" onClick={() => navigate(`/editor/${stored.project.id}`)} /><MenuButton icon={Pencil} label="Rename" onClick={() => { onRename(stored); setOpen(false); }} /><MenuButton icon={Copy} label="Duplicate" onClick={() => { projectService.duplicate(stored.project.id); onRefresh(); setOpen(false); }} /><MenuButton icon={Trash2} label="Delete" danger onClick={() => { onDelete(stored); setOpen(false); }} /></div> : null}</div>;
}

function MenuButton({ icon: Icon, label, onClick, danger = false }: { icon: typeof Copy; label: string; onClick: () => void; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-panel cursor-pointer ${danger ? 'text-danger' : ''}`}><Icon size={14} />{label}</button>;
}

function EmptyProjectsState({ search, onCreate }: { search: boolean; onCreate: () => void }) {
  return <div className="rounded-xl border border-dashed border-border bg-panel p-10 text-center"><FileVideo size={24} className="mx-auto text-subtle" /><h2 className="text-lg font-medium mt-3">{search ? 'No projects found' : 'Your projects will appear here'}</h2><p className="text-sm text-muted mt-2">{search ? 'Try another search term.' : 'Create your first video and start editing.'}</p>{!search ? <Button variant="primary" className="mt-4" onClick={onCreate}><Plus size={16} />Create New Video</Button> : null}</div>;
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState('My New Video');
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<ProjectResolution>('1080p');
  const [error, setError] = useState('');
  async function create() { if (!name.trim()) { setError('Project name is required.'); return; } const created = await projectService.create({ name: name.trim(), source: 'blank', duration: 60, aspectRatio: ratio, resolution }); onCreated(created.project.id); }
  return <Dialog title="Create New Project" onClose={onClose}><Field label="Project name" error={error}><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(''); }} className="input-field" /></Field><SelectField label="Aspect ratio" value={ratio} onChange={(value) => setRatio(value as AspectRatio)} options={['16:9', '9:16', '1:1', '4:5']} /><SelectField label="Resolution" value={resolution} onChange={(value) => setResolution(value as ProjectResolution)} options={['720p', '1080p', '4K']} /><DialogActions onClose={onClose} onConfirm={create} confirmLabel="Create Project" /></Dialog>;
}

function AIProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState('AI Video'); const [prompt, setPrompt] = useState('Create a 60-second motivational video about students preparing for exams.'); const [duration, setDuration] = useState(60); const [ratio, setRatio] = useState<AspectRatio>('16:9'); const [language, setLanguage] = useState('English'); const [style, setStyle] = useState('Motivational');
  async function generate() { const created = await projectService.create({ name: name.trim() || 'AI Video', source: 'ai', duration, aspectRatio: ratio, prompt, language, style }); onCreated(created.project.id); }
  return <Dialog title="Create Video with AI" onClose={onClose}><Field label="Project name"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} className="input-field" /></Field><Field label="What do you want to create?"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} className="input-field resize-y" /></Field><SelectField label="Duration" value={`${duration} sec`} onChange={(value) => setDuration(Number(value.split(' ')[0]))} options={['15 sec', '30 sec', '60 sec', '90 sec']} /><div className="grid grid-cols-2 gap-3"><SelectField label="Aspect ratio" value={ratio} onChange={(value) => setRatio(value as AspectRatio)} options={['16:9', '9:16', '1:1']} /><SelectField label="Language" value={language} onChange={setLanguage} options={['English', 'Tamil', 'Hindi']} /></div><SelectField label="Style" value={style} onChange={setStyle} options={['Cinematic', 'Modern', 'Educational', 'Motivational', 'Social Media']} /><DialogActions onClose={onClose} onConfirm={generate} confirmLabel="Generate Video" /></Dialog>;
}

function RenameProjectModal({ project, onClose, onSaved }: { project: StoredProject; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(project.project.name); const [error, setError] = useState('');
  function save() { if (!name.trim()) { setError('Project name is required.'); return; } projectService.rename(project.project.id, name.trim()); onSaved(); }
  return <Dialog title="Rename Project" onClose={onClose}><Field label="Project name" error={error}><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(''); }} className="input-field" /></Field><DialogActions onClose={onClose} onConfirm={save} confirmLabel="Save" /></Dialog>;
}

function DeleteProjectDialog({ project, onClose, onDeleted }: { project: StoredProject; onClose: () => void; onDeleted: () => void }) {
  return <Dialog title="Delete project" onClose={onClose}><p className="text-sm text-muted">Delete <span className="text-fg font-medium">{project.project.name}</span>? This project will be removed from your dashboard.</p><DialogActions onClose={onClose} onConfirm={onDeleted} confirmLabel="Delete" danger /></Dialog>;
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 bg-black/70 p-4 grid place-items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl border border-border bg-app-elevated p-5 shadow-2xl"><div className="flex items-center justify-between mb-5"><h2 id="dialog-title" className="text-lg font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="h-8 w-8 grid place-items-center rounded-lg text-muted hover:bg-panel-hover cursor-pointer"><X size={16} /></button></div>{children}</div></div>;
}

function DialogActions({ onClose, onConfirm, confirmLabel, danger = false }: { onClose: () => void; onConfirm: () => void; confirmLabel: string; danger?: boolean }) {
  return <div className="flex justify-end gap-2 pt-5"><Button onClick={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{danger ? <Trash2 size={14} /> : <Check size={14} />}{confirmLabel}</Button></div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <label className="block mb-4"><span className="text-xs text-muted">{label}</span>{children}{error ? <span className="block text-xs text-danger mt-1">{error}</span> : null}</label>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <Field label={label}><select value={value} onChange={(event) => onChange(event.target.value)} className="input-field">{options.map((option) => <option key={option}>{option}</option>)}</select></Field>; }
function IconButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-label={label} onClick={onClick} className={`h-8 w-8 grid place-items-center rounded-md cursor-pointer ${active ? 'bg-panel-hover text-fg' : 'text-muted hover:text-fg'}`}>{children}</button>; }
function dateValue(value: string): number { const parsed = Date.parse(value); return Number.isNaN(parsed) ? 0 : parsed; }
function readViewMode(): ViewMode { try { return sessionStorage.getItem('vjeditor_dashboard_view') === 'list' ? 'list' : 'grid'; } catch { return 'grid'; } }

export function DashboardTemplatesPage() { return <SimpleDashboardPage title="Templates" body="Templates are ready to connect to project creation in a later phase." />; }
export function DashboardAiPage() { return <AiToolsDashboard />; }
export function DashboardMediaPage() { return <SimpleDashboardPage title="Media library" body="Media management begins in Phase 3." />; }
export function DashboardSettingsPage() { return <SimpleDashboardPage title="Settings" body="Workspace settings will be connected to the account service later." />; }
function SimpleDashboardPage({ title, body }: { title: string; body: string }) { return <div className="mx-auto max-w-6xl px-6 py-8"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-sm text-muted mt-2">{body}</p></div>; }
