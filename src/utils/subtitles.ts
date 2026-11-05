import type { Caption } from '@/types';
import { createId } from '@/utils/id';

function formatSrtTime(ms: number): string {
  const safe = Math.max(0, ms);
  const hours = Math.floor(safe / 3600000);
  const minutes = Math.floor((safe % 3600000) / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  const milliseconds = safe % 1000;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

function parseSrtTimestamp(str: string): number {
  const match = str.trim().match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
  if (!match) return 0;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = parseInt(match[3], 10);
  const ms = parseInt(match[4], 10);
  return h * 3600000 + m * 60000 + s * 1000 + ms;
}

export function exportToSrt(captions: Caption[]): string {
  const sorted = [...captions].sort((a, b) => a.startMs - b.startMs);
  return sorted
    .map((caption, index) => {
      const start = formatSrtTime(caption.startMs);
      const end = formatSrtTime(caption.startMs + caption.durationMs);
      return `${index + 1}\n${start} --> ${end}\n${caption.text}\n`;
    })
    .join('\n');
}

export function exportToVtt(captions: Caption[]): string {
  const srt = exportToSrt(captions);
  return `WEBVTT\n\n${srt.replace(/,/g, '.')}`;
}

export function parseSrt(content: string, trackId: string): Caption[] {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);
  const captions: Caption[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    // Line 1 might be index or timestamp
    let timeLine = lines[0];
    let textLines = lines.slice(1);

    if (lines[0].match(/^\d+$/) && lines.length >= 3) {
      timeLine = lines[1];
      textLines = lines.slice(2);
    }

    const timeMatch = timeLine.match(/(.+?)\s*-->\s*(.+)/);
    if (!timeMatch) continue;

    const startMs = parseSrtTimestamp(timeMatch[1]);
    const endMs = parseSrtTimestamp(timeMatch[2]);
    const durationMs = Math.max(500, endMs - startMs);
    const text = textLines.join('\n').trim();

    if (text) {
      captions.push({
        id: createId('cap'),
        trackId,
        kind: 'caption',
        name: 'Caption',
        startMs,
        durationMs,
        text,
        style: 'boxed',
        position: 'bottom',
      });
    }
  }

  return captions;
}
