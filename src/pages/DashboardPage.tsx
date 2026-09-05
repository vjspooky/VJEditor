import { Button } from '@/components/ui/Button';
import { projectService } from '@/services/projectService';
import type { StoredProject } from '@/types';
import { formatDuration, formatRelativeTime } from '@/utils/format';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export function DashboardHomePage() {
  const [searchParams] = useSearchParams();
  const search = (searchParams.get('q') ?? '').trim().toLowerCase();
  const projects = useMemo(
    () => projectService.list().filter((stored) => matchesSearch(stored.project.name, search)),
    [search],
  );
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-muted">Welcome back</p>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">What are you making today?</h1>
        </div>
        <Button variant="primary" onClick={() => navigate('/projects/new')}>
          <Plus size={16} />
          Create New Video
        </Button>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          title={search ? 'No projects match this search' : 'No projects yet'}
          body={
            search
              ? `Try another keyword or create a new project to get started.`
              : 'Create a project to start building your next video.'
          }
          actionLabel="Create New Video"
          onAction={() => navigate('/projects/new')}
        />
      ) : (
        <ProjectGrid
          projects={projects}
          onOpen={(id) => navigate(`/editor/${id}`)}
        />
      )}
    </div>
  );
}

export function DashboardProjectsPage() {
  const [searchParams] = useSearchParams();
  const search = (searchParams.get('q') ?? '').trim().toLowerCase();
  const projects = useMemo(
    () => projectService.list().filter((stored) => matchesSearch(stored.project.name, search)),
    [search],
  );
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Projects</h1>
      {projects.length === 0 ? (
        <EmptyState
          title={search ? 'No matching projects' : 'No projects yet'}
          body={
            search
              ? 'Try a different term to find the project you want.'
              : 'Create a video project to begin editing.'
          }
          actionLabel="Create project"
          onAction={() => navigate('/projects/new')}
        />
      ) : (
        <ProjectGrid projects={projects} onOpen={(id) => navigate(`/editor/${id}`)} />
      )}
    </div>
  );
}

export function DashboardTemplatesPage() {
  const [searchParams] = useSearchParams();
  const search = (searchParams.get('q') ?? '').trim().toLowerCase();
  const navigate = useNavigate();
  const templates = [
    { id: 'tpl_ads', name: 'Product Ad 15s', ratio: '9:16', color: '#3a2a4a' },
    { id: 'tpl_yt', name: 'YouTube Intro', ratio: '16:9', color: '#1e3a5f' },
    { id: 'tpl_reel', name: 'Travel Reel', ratio: '9:16', color: '#1f4a3c' },
    { id: 'tpl_lesson', name: 'Course Lesson', ratio: '16:9', color: '#3d4a28' },
  ];
  const visibleTemplates = templates.filter((tpl) => matchesSearch(`${tpl.name} ${tpl.ratio}`, search));
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Templates</h1>
      {visibleTemplates.length === 0 ? (
        <EmptyState
          title={search ? 'No templates match your search' : 'No templates available'}
          body={search ? 'Try a broader keyword to explore the template library.' : 'Check back soon for more presets.'}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleTemplates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() =>
                navigate('/projects/new', { state: { source: 'template', templateId: tpl.id } })
              }
              className="text-left rounded-2xl border border-border bg-panel overflow-hidden cursor-pointer hover:border-border-strong"
            >
              <div className="h-28" style={{ background: tpl.color }} />
              <div className="p-3">
                <p className="text-sm font-medium">{tpl.name}</p>
                <p className="text-xs text-muted mt-1">{tpl.ratio}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardAiPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">AI Tools</h1>
      <p className="text-sm text-muted mb-6">
        Generation jobs connect in a later phase. Open a project to use these panels in the editor.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          'AI Video Generator',
          'AI Script',
          'AI Voice',
          'Auto Captions',
          'AI Auto Edit',
          'Background Removal',
          'Video Translation',
          'Highlight Detection',
        ].map((name) => (
          <div key={name} className="rounded-2xl border border-border bg-panel p-4">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted mt-2">Available in the editor AI panel.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardMediaPage() {
  const [searchParams] = useSearchParams();
  const search = (searchParams.get('q') ?? '').trim().toLowerCase();
  const media = projectService.list().flatMap((p) => p.media);
  const unique = useMemo(() => {
    const map = new Map(media.map((item) => [item.id, item]));
    return [...map.values()].filter((asset) => matchesSearch(`${asset.name} ${asset.type}`, search));
  }, [media, search]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Media library</h1>
      {unique.length === 0 ? (
        <EmptyState
          title={search ? 'No media matches your search' : 'No media uploaded yet'}
          body={
            search
              ? 'Try another keyword or add media to this project.'
              : 'Upload clips or images to build your library.'
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {unique.map((asset) => (
            <article key={asset.id} className="rounded-2xl border border-border bg-panel overflow-hidden">
              <div className="h-24" style={{ background: asset.thumbnailColor }} />
              <div className="p-3">
                <p className="text-sm truncate">{asset.name}</p>
                <p className="text-xs text-muted mt-1 capitalize">{asset.type}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardSettingsPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Settings</h1>
      <div className="rounded-2xl border border-border bg-panel p-5 space-y-4">
        <label className="block">
          <span className="text-xs text-muted">Display name</span>
          <input
            defaultValue="Vaibhav"
            className="mt-1 w-full h-9 rounded-lg border border-border bg-app px-3 text-sm outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Default export</span>
          <select className="mt-1 w-full h-9 rounded-lg border border-border bg-app px-3 text-sm outline-none">
            <option>1080p H.264</option>
            <option>4K H.264</option>
            <option>720p Draft</option>
          </select>
        </label>
        <p className="text-xs text-muted">Account sync requires the Spring Boot backend in Phase 2.</p>
      </div>
    </div>
  );
}

function matchesSearch(text: string, query: string): boolean {
  if (!query) return true;
  return text.toLowerCase().includes(query);
}

function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-8 text-center">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm text-muted mt-2">{body}</p>
      {actionLabel && onAction ? (
        <Button variant="primary" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function ProjectGrid({
  projects,
  onOpen,
}: {
  projects: StoredProject[];
  onOpen: (id: string) => void;
}) {
  const [, setTick] = useState(0);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {projects.map((stored) => (
        <article
          key={stored.project.id}
          className="group rounded-2xl border border-border bg-panel overflow-hidden"
        >
          <button
            type="button"
            onClick={() => onOpen(stored.project.id)}
            className="block w-full text-left cursor-pointer"
          >
            <div
              className="h-32 relative"
              style={{ background: stored.project.thumbnailColor }}
            >
              <span className="absolute bottom-2 right-2 text-[11px] bg-app/80 px-1.5 py-0.5 rounded">
                {formatDuration(stored.project.duration)}
              </span>
            </div>
          </button>
          <div className="p-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{stored.project.name}</p>
              <p className="text-xs text-muted mt-1">
                Last edited {formatRelativeTime(stored.project.updatedAt)}
              </p>
            </div>
            <ProjectMenu
              id={stored.project.id}
              onChange={() => setTick((n) => n + 1)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function ProjectMenu({ id, onChange }: { id: string; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        type="button"
        className="h-7 w-7 rounded-md text-muted hover:bg-panel-hover cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-label="More"
      >
        <MoreHorizontal size={16} className="mx-auto" />
      </button>
      {open ? (
        <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-border bg-app-elevated p-1 text-sm shadow-xl">
          <Link
            to={`/editor/${id}`}
            className="block px-2 py-1.5 rounded hover:bg-panel no-underline text-fg"
          >
            Open
          </Link>
          <button
            type="button"
            className="block w-full text-left px-2 py-1.5 rounded hover:bg-panel cursor-pointer"
            onClick={() => {
              projectService.duplicate(id);
              setOpen(false);
              onChange();
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="block w-full text-left px-2 py-1.5 rounded hover:bg-panel cursor-pointer"
            onClick={() => {
              const name = window.prompt('Project name');
              if (name) {
                projectService.rename(id, name);
                onChange();
              }
              setOpen(false);
            }}
          >
            Rename
          </button>
          <button
            type="button"
            className="block w-full text-left px-2 py-1.5 rounded hover:bg-panel text-danger cursor-pointer"
            onClick={() => {
              projectService.remove(id);
              setOpen(false);
              onChange();
              navigate('/dashboard/projects');
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
