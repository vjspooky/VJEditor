import { projectService } from '@/services/projectService';
import { readJson, writeJson } from '@/services/storage';
import type { MediaAsset, MediaStatus, MediaType } from '@/types';
import { createId } from '@/utils/id';
import { getMediaType } from '@/utils/media';

const MEDIA_KEY = 'media-assets';
const sessionUrls = new Map<string, string>();

export interface MediaStorageProvider {
  create(file: File): MediaAsset;
  list(): MediaAsset[];
  get(id: string): MediaAsset | undefined;
  update(id: string, patch: Partial<MediaAsset>): MediaAsset | undefined;
  remove(id: string): void;
}

function storedAssets(): MediaAsset[] {
  const value = readJson<unknown>(MEDIA_KEY, []);
  return Array.isArray(value) ? value.filter(isMediaAsset).map(normalizeAsset) : [];
}

function persistAssets(assets: MediaAsset[]): void {
  writeJson(MEDIA_KEY, assets.map(({ url: _url, src: _src, thumbnail: _thumbnail, ...asset }) => asset));
}

function normalizeAsset(asset: MediaAsset): MediaAsset {
  return {
    ...asset,
    status: asset.status ?? 'ready',
    projectIds: asset.projectIds ?? [],
    updatedAt: asset.updatedAt ?? asset.createdAt,
    url: sessionUrls.get(asset.id),
  };
}

function allAssets(): MediaAsset[] {
  const byId = new Map<string, MediaAsset>();
  for (const asset of storedAssets()) byId.set(asset.id, normalizeAsset(asset));
  for (const project of projectService.list()) {
    for (const asset of project.media) {
      const existing = byId.get(asset.id);
      byId.set(asset.id, normalizeAsset({
        ...asset,
        ...(existing ?? {}),
        projectIds: [...new Set([...(existing?.projectIds ?? []), project.project.id])],
      }));
    }
  }
  return [...byId.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export const mediaService: MediaStorageProvider & {
  addToProject: (mediaId: string, projectId: string) => boolean;
  removeFromProject: (mediaId: string, projectId: string) => boolean;
} = {
  create(file) {
    const now = new Date().toISOString();
    const type = getMediaType(file) ?? 'video';
    const url = URL.createObjectURL(file);
    const asset: MediaAsset = {
      id: createId('media'),
      name: file.name,
      type,
      mimeType: file.type,
      size: file.size,
      url,
      src: url,
      thumbnailColor: type === 'audio' ? '#1f4a3c' : type === 'image' ? '#2a3f66' : '#1e3a5f',
      createdAt: now,
      updatedAt: now,
      status: 'ready',
      projectIds: [],
    };
    sessionUrls.set(asset.id, url);
    persistAssets([...storedAssets(), asset]);
    return asset;
  },

  list: allAssets,

  get(id) {
    return allAssets().find((asset) => asset.id === id);
  },

  update(id, patch) {
    const assets = storedAssets();
    const index = assets.findIndex((asset) => asset.id === id);
    if (index < 0) return undefined;
    const next = { ...normalizeAsset(assets[index]), ...patch, updatedAt: new Date().toISOString() };
    assets[index] = next;
    persistAssets(assets);
    return next;
  },

  remove(id) {
    const url = sessionUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    sessionUrls.delete(id);
    persistAssets(storedAssets().filter((asset) => asset.id !== id));
    for (const project of projectService.list()) {
      if (!project.media.some((asset) => asset.id === id)) continue;
      projectService.save({ ...project, media: project.media.filter((asset) => asset.id !== id) });
    }
  },

  addToProject(mediaId, projectId) {
    const asset = allAssets().find((item) => item.id === mediaId);
    const project = projectService.get(projectId);
    if (!asset || !project) return false;
    const media = project.media.some((item) => item.id === mediaId)
      ? project.media
      : [asset, ...project.media];
    projectService.save({ ...project, media });
    const stored = storedAssets();
    const index = stored.findIndex((item) => item.id === mediaId);
    if (index >= 0) {
      stored[index] = { ...stored[index], projectIds: [...new Set([...(stored[index].projectIds ?? []), projectId])] };
      persistAssets(stored);
    }
    return true;
  },

  removeFromProject(mediaId, projectId) {
    const project = projectService.get(projectId);
    if (!project) return false;
    projectService.save({ ...project, media: project.media.filter((asset) => asset.id !== mediaId) });
    const stored = storedAssets();
    const index = stored.findIndex((item) => item.id === mediaId);
    if (index >= 0) {
      stored[index] = { ...stored[index], projectIds: (stored[index].projectIds ?? []).filter((id: string) => id !== projectId) };
      persistAssets(stored);
    }
    return true;
  },
};

function isMediaAsset(value: unknown): value is MediaAsset {
  if (!value || typeof value !== 'object') return false;
  const asset = value as Partial<MediaAsset>;
  return typeof asset.id === 'string' && typeof asset.name === 'string' && isMediaType(asset.type) && typeof asset.createdAt === 'string';
}

function isMediaType(value: unknown): value is MediaType {
  return value === 'video' || value === 'image' || value === 'audio';
}

export function mediaStatus(value: MediaStatus | undefined): MediaStatus {
  return value ?? 'ready';
}