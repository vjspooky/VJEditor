const waveformCache = new Map<string, number[]>();

/**
 * Extracts normalized peak amplitudes (0 to 1) from an audio/video URL or generates a deterministic fallback
 */
export async function getOrGenerateWaveform(
  mediaId: string,
  url?: string,
  samples = 70,
): Promise<number[]> {
  if (waveformCache.has(mediaId)) {
    return waveformCache.get(mediaId)!;
  }

  if (url && typeof window !== 'undefined' && (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(channelData.length / samples);
      const peaks: number[] = [];

      for (let i = 0; i < samples; i++) {
        const start = i * blockSize;
        let max = 0;
        for (let j = 0; j < blockSize; j += 4) {
          const val = Math.abs(channelData[start + j] || 0);
          if (val > max) max = val;
        }
        peaks.push(Math.min(1, Math.max(0.1, max)));
      }

      waveformCache.set(mediaId, peaks);
      void audioCtx.close();
      return peaks;
    } catch {
      // Fall through to deterministic pseudo-waveform
    }
  }

  // Deterministic realistic waveform based on mediaId string hash
  const peaks: number[] = [];
  let hash = 0;
  for (let i = 0; i < mediaId.length; i++) {
    hash = (hash << 5) - hash + mediaId.charCodeAt(i);
    hash |= 0;
  }

  for (let i = 0; i < samples; i++) {
    const pseudoRand = Math.abs(Math.sin((i + 1) * 0.2 + hash) * Math.cos(i * 0.35 + 1.2));
    const val = 0.15 + 0.8 * pseudoRand;
    peaks.push(Math.round(val * 100) / 100);
  }

  waveformCache.set(mediaId, peaks);
  return peaks;
}
