import { useEffect, useRef } from "react";

export function usePlayback(
  isPlaying: boolean,
  setCurrentTime: (updateFn: (prev: number) => number) => void
) {
  const lastTime = useRef(performance.now());

  useEffect(() => {
    if (!isPlaying) {
      lastTime.current = performance.now();
      return;
    }

    lastTime.current = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const delta = (now - lastTime.current) / 1000;
      lastTime.current = now;

      setCurrentTime((prev) => prev + delta);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, setCurrentTime]);
}
