export type MediaType = "video" | "image" | "audio";

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
  size: number;
  createdAt: string;
}
