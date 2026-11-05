import type { MediaType } from '@/types';

export const MAX_MEDIA_FILE_SIZE = 500 * 1024 * 1024;

const supportedExtensions: Record<MediaType, string[]> = {
  video: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  image: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
  audio: ['mp3', 'wav', 'm4a', 'aac', 'ogg'],
};

export function getMediaType(file: Pick<File, 'type' | 'name'>): MediaType | null {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  const extension = getFileExtension(file.name);
  for (const type of Object.keys(supportedExtensions) as MediaType[]) {
    if (supportedExtensions[type].includes(extension)) return type;
  }
  return null;
}

export function validateMediaFile(file: File): string | null {
  if (file.size > MAX_MEDIA_FILE_SIZE) return 'File is too large. Maximum allowed size is 500 MB.';
  if (!getMediaType(file)) return 'This file type is not supported.';
  return null;
}

export function getFileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export function formatFileSize(bytes = 0): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatMediaDuration(seconds?: number): string {
  if (seconds === undefined || !Number.isFinite(seconds)) return '--:--';
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}