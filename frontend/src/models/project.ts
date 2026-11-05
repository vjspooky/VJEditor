export type ProjectType = "blank" | "ai" | "template";

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  duration: number;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  resolution: "720p" | "1080p" | "4K";
  type: ProjectType;
  createdAt: string;
  updatedAt: string;
}
