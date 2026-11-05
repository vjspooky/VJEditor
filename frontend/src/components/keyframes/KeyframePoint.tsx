import React from "react";
import { Keyframe } from "../../models/keyframe";

interface KeyframePointProps {
  keyframe: Keyframe;
  isSelected?: boolean;
  pps?: number;
  onSelect?: (id: string) => void;
  onDragTime?: (id: string, newTime: number) => void;
  onDelete?: (id: string) => void;
}

export default function KeyframePoint({
  keyframe,
  isSelected = false,
  pps = 40,
  onSelect = () => {},
  onDragTime,
  onDelete,
}: KeyframePointProps) {
  const left = keyframe.time * pps;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(keyframe.id);

    if (!onDragTime) return;

    const startX = e.clientX;
    const startTime = keyframe.time;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / pps;
      const newTime = Math.max(0, startTime + deltaTime);
      onDragTime(keyframe.id, Number(newTime.toFixed(2)));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(keyframe.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onDelete) onDelete(keyframe.id);
      }}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: "50%",
        transform: "translate(-50%, -50%) rotate(45deg)",
        width: 10,
        height: 10,
        background: isSelected ? "#F59E0B" : "var(--color-primary, #6366F1)",
        border: "1.5px solid #FFFFFF",
        cursor: "ew-resize",
        zIndex: isSelected ? 20 : 10,
        transition: "transform 0.1s ease, background 0.15s ease",
        boxShadow: isSelected ? "0 0 8px rgba(245, 158, 11, 0.8)" : "none",
      }}
      title={`${keyframe.property} @ ${keyframe.time.toFixed(2)}s (${keyframe.easing})`}
    />
  );
}
