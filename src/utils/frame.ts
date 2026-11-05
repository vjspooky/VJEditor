export type FrameRate = 24 | 25 | 30 | 50 | 60;

export function frameToTime(frame: number, fps: FrameRate): number {
  return frame / fps;
}

export function timeToFrame(time: number, fps: FrameRate): number {
  return Math.round(time * fps);
}

export function snapTimeToFrame(time: number, fps: FrameRate): number {
  return frameToTime(timeToFrame(Math.max(0, time), fps), fps);
}

export function snapMsToFrame(timeMs: number, fps: FrameRate): number {
  return Math.round(snapTimeToFrame(timeMs / 1000, fps) * 1000);
}

/**
 * Formats seconds into mm:ss.ms (e.g. 01:23.456)
 */
export function formatPreciseTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const wholeSec = Math.floor(safe % 60);
  const ms = Math.floor((safe % 1) * 1000);
  return `${String(minutes).padStart(2, '0')}:${String(wholeSec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

/**
 * Formats a delta in milliseconds with +/- sign into mm:ss.ms
 */
export function formatDeltaTime(deltaMs: number): string {
  const sign = deltaMs >= 0 ? '+' : '-';
  const absSeconds = Math.abs(deltaMs) / 1000;
  const minutes = Math.floor(absSeconds / 60);
  const wholeSec = Math.floor(absSeconds % 60);
  const ms = Math.floor((absSeconds % 1) * 1000);
  return `${sign}${String(minutes).padStart(2, '0')}:${String(wholeSec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

/**
 * Parses a timecode string like "01:23.456", "23.456", or "1200" (ms or seconds) into milliseconds
 */
export function parsePreciseTimeToMs(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(':');
  if (parts.length === 2) {
    const min = parseFloat(parts[0]);
    const sec = parseFloat(parts[1]);
    if (isNaN(min) || isNaN(sec)) return null;
    return Math.max(0, Math.round((min * 60 + sec) * 1000));
  }
  const val = parseFloat(trimmed);
  if (isNaN(val)) return null;
  return Math.max(0, Math.round(val));
}

