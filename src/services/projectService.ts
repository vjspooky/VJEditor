/**
 * Frontend service boundary with a Spring Boot-ready persistence shim.
 * The app still works locally when the backend is unavailable, but project metadata
 * is synced through the API when VITE_API_URL is configured.
 */
import { api } from '@/services/api';
import { seedMedia } from '@/data/seedMedia';
import { seedStoredProjects } from '@/data/seedProjects';
import { readJson, writeJson } from '@/services/storage';
import type { CreateProjectInput, MediaAsset, StoredProject, TimelineTrack } from '@/types';
import { createId } from '@/utils/id';

const PROJECTS_KEY = 'projects';
const API_ENABLED = Boolean(import.meta.env.VITE_API_URL);

function loadAll(): StoredProject[] {
  const existing = readJson<unknown>(PROJECTS_KEY, null);
  if (Array.isArray(existing) && existing.every(isStoredProject)) return existing;
  const seeded = seedStoredProjects();
  writeJson(PROJECTS_KEY, seeded);
  return seeded;
}

function persist(all: StoredProject[]): void {
  writeJson(PROJECTS_KEY, all);
}

export const projectService = {
  list(): StoredProject[] {
    return loadAll().sort(
      (a, b) => new Date(b.project.updatedAt).getTime() - new Date(a.project.updatedAt).getTime(),
    );
  },

  get(id: string): StoredProject | undefined {
    return loadAll().find((item) => item.project.id === id);
  },

  async create(input: CreateProjectInput): Promise<StoredProject> {
    const now = new Date().toISOString();
    const created: StoredProject = {
      project: {
        id: createId('proj'),
        name: input.name,
        duration: input.duration,
        aspectRatio: input.aspectRatio,
        resolution: input.resolution ?? '1080p',
        thumbnailColor: colorForSource(input.source),
        createdAt: now,
        updatedAt: now,
        prompt: input.prompt,
        source: input.source,
        language: input.language,
        voice: input.voice,
        style: input.style,
      },
      tracks: emptyTracks(),
      media: [...seedMedia],
    };

    const all = loadAll();
    all.unshift(created);
    persist(all);

    if (!API_ENABLED) return created;

    try {
      const remote = await api.createProject(input);
      const synced: StoredProject = { ...created, project: remote };
      const current = loadAll();
      const index = current.findIndex((item) => item.project.id === created.project.id);
      if (index >= 0) current[index] = synced;
      persist(current);
      return synced;
    } catch {
      return created;
    }
  },

  save(stored: StoredProject): StoredProject {
    const next: StoredProject = {
      ...stored,
      project: { ...stored.project, updatedAt: new Date().toISOString() },
    };
    const all = loadAll();
    const index = all.findIndex((item) => item.project.id === next.project.id);
    if (index === -1) all.unshift(next);
    else all[index] = next;
    persist(all);
    void syncProjectMetadata(next, 'update');
    return next;
  },

  duplicate(id: string): StoredProject | undefined {
    const source = this.get(id);
    if (!source) return undefined;
    const now = new Date().toISOString();
    const copy: StoredProject = structuredClone(source);
    copy.project.id = createId('proj');
    copy.project.name = `${source.project.name} Copy`;
    copy.project.createdAt = now;
    copy.project.updatedAt = now;
    const all = loadAll();
    all.unshift(copy);
    persist(all);
    void syncProjectMetadata(copy, 'create');
    return copy;
  },

  remove(id: string): void {
    const all = loadAll().filter((item) => item.project.id !== id);
    persist(all);
    void syncProjectMetadataDelete(id);
  },

  rename(id: string, name: string): StoredProject | undefined {
    const stored = this.get(id);
    if (!stored) return undefined;
    stored.project.name = name;
    return this.save(stored);
  },
};

async function syncProjectMetadata(value: StoredProject, mode: 'create' | 'update') {
  if (!API_ENABLED) return;

  try {
    const payload = {
      name: value.project.name,
      duration: value.project.duration,
      aspectRatio: value.project.aspectRatio,
      source: value.project.source,
      prompt: value.project.prompt,
      language: value.project.language,
      voice: value.project.voice,
      style: value.project.style,
    };

    if (mode === 'create') {
      await api.createProject(payload);
      return;
    }

    await api.updateProject(value.project.id, payload);
  } catch {
    // Gracefully fall back to local persistence when the API is unavailable.
  }
}

async function syncProjectMetadataDelete(id: string) {
  if (!API_ENABLED) return;

  try {
    await api.deleteProject(id);
  } catch {
    // Ignore remote deletes when the Spring service is offline.
  }
}

function colorForSource(source: CreateProjectInput['source']): string {
  if (source === 'ai') return '#1f4a3c';
  if (source === 'import') return '#1e3a5f';
  if (source === 'template') return '#3a2a4a';
  return '#2a2d38';
}

function emptyTracks(): TimelineTrack[] {
  return [
    { id: 'track_v1', kind: 'video', name: 'V1', locked: false, muted: false, hidden: false, items: [] },
    { id: 'track_a1', kind: 'audio', name: 'A1', locked: false, muted: false, hidden: false, items: [] },
    { id: 'track_t1', kind: 'text', name: 'T1', locked: false, muted: false, hidden: false, items: [] },
    { id: 'track_c1', kind: 'caption', name: 'CC', locked: false, muted: false, hidden: false, items: [] },
  ];
}

export function appendMedia(project: StoredProject, asset: MediaAsset): StoredProject {
  return { ...project, media: [asset, ...project.media] };
}

function isStoredProject(value: unknown): value is StoredProject {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StoredProject>;
  return Boolean(
    candidate.project &&
      typeof candidate.project === 'object' &&
      typeof candidate.project.id === 'string' &&
      typeof candidate.project.name === 'string' &&
      Array.isArray(candidate.tracks) &&
      Array.isArray(candidate.media),
  );
}
