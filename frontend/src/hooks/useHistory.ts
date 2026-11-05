import { useState, useCallback } from "react";

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setHistory((prev) => {
        const resolved = typeof newState === "function" ? (newState as (prev: T) => T)(prev[index]) : newState;
        const nextHistory = prev.slice(0, index + 1);
        return [...nextHistory, resolved];
      });
      setIndex((prev) => prev + 1);
    },
    [index]
  );

  const undo = useCallback(() => {
    if (index > 0) setIndex((prev) => prev - 1);
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) setIndex((prev) => prev + 1);
  }, [index, history.length]);

  return { state: history[index], set, undo, redo, canUndo: index > 0, canRedo: index < history.length - 1 };
}
