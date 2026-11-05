import { useEffect, useRef } from "react";

export function useAutosave<T>(data: T, onSave: (data: T) => void, delayMs = 1000) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      onSave(data);
    }, delayMs);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [data, onSave, delayMs]);
}
