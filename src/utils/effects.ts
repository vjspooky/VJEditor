import type { ClipEffect } from '@/types';

export function buildCssFilter(effects?: ClipEffect[]): string {
  if (!effects || effects.length === 0) return '';
  const parts: string[] = [];

  for (const eff of effects) {
    if (!eff.enabled) continue;
    switch (eff.type) {
      case 'blur':
        parts.push(`blur(${eff.intensity * 0.2}px)`);
        break;
      case 'brightness':
        parts.push(`brightness(${eff.intensity}%)`);
        break;
      case 'contrast':
        parts.push(`contrast(${eff.intensity}%)`);
        break;
      case 'saturation':
        parts.push(`saturate(${eff.intensity}%)`);
        break;
      case 'grayscale':
        parts.push(`grayscale(${eff.intensity}%)`);
        break;
      case 'sepia':
        parts.push(`sepia(${eff.intensity}%)`);
        break;
      case 'hue-rotate':
        parts.push(`hue-rotate(${eff.intensity}deg)`);
        break;
      case 'invert':
        parts.push(`invert(${eff.intensity}%)`);
        break;
      case 'vignette':
        // Handled via overlay gradient if needed
        break;
    }
  }

  return parts.join(' ');
}
