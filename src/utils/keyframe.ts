import type { AnimatableProperty, Keyframe, KeyframeEasing } from '@/types';

export function ease(t: number, easing: KeyframeEasing): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (easing) {
    case 'easeIn':
      return clamped * clamped * clamped;
    case 'easeOut':
      return 1 - Math.pow(1 - clamped, 3);
    case 'easeInOut':
      return clamped < 0.5
        ? 4 * clamped * clamped * clamped
        : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
    case 'linear':
    default:
      return clamped;
  }
}

export function interpolateKeyframes(
  keyframes: Keyframe[] | undefined,
  property: AnimatableProperty,
  clipTimeMs: number,
  defaultValue: number,
): number {
  if (!keyframes || keyframes.length === 0) return defaultValue;

  const propFrames = keyframes
    .filter((k) => k.property === property)
    .sort((a, b) => a.timeMs - b.timeMs);

  if (propFrames.length === 0) return defaultValue;
  if (propFrames.length === 1) return propFrames[0].value;

  // Before first keyframe
  if (clipTimeMs <= propFrames[0].timeMs) {
    return propFrames[0].value;
  }

  // After last keyframe
  if (clipTimeMs >= propFrames[propFrames.length - 1].timeMs) {
    return propFrames[propFrames.length - 1].value;
  }

  // Find surrounding pair
  for (let i = 0; i < propFrames.length - 1; i++) {
    const k1 = propFrames[i];
    const k2 = propFrames[i + 1];
    if (clipTimeMs >= k1.timeMs && clipTimeMs <= k2.timeMs) {
      const span = k2.timeMs - k1.timeMs;
      if (span === 0) return k1.value;
      const progress = (clipTimeMs - k1.timeMs) / span;
      const easedProgress = ease(progress, k2.easing);
      return k1.value + (k2.value - k1.value) * easedProgress;
    }
  }

  return defaultValue;
}
