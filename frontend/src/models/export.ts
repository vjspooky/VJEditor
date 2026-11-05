export interface ExportSettings {
  format: "mp4" | "webm";
  resolution: "720p" | "1080p" | "4K";
  fps: 24 | 25 | 30 | 50 | 60;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  quality: "draft" | "standard" | "high" | "maximum";
}
