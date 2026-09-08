export function timeToFrame(timeSeconds: number, fps = 30): number {
  return Math.round(timeSeconds * fps);
}

export function frameToTime(frame: number, fps = 30): number {
  return frame / fps;
}

export function snapToFrame(timeSeconds: number, fps = 30): number {
  return frameToTime(timeToFrame(timeSeconds, fps), fps);
}
