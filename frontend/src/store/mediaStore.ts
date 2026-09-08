import { MediaAsset } from "../models/media";

const STORAGE_KEY = "vjeditor-media";

export function getStoredMedia(): MediaAsset[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMediaAsset(asset: MediaAsset): MediaAsset {
  const list = getStoredMedia();
  list.unshift(asset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return asset;
}

export function deleteMediaAsset(id: string): void {
  const list = getStoredMedia().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
