import React, { useRef } from "react";
import { TextElement } from "../../models/text";

interface TextCanvasElementProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
}

export default function TextCanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdatePosition,
}: TextCanvasElementProps) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const elemPosRef = useRef({ x: element.x, y: element.y });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);

    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    elemPosRef.current = { x: element.x, y: element.y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - startPosRef.current.x;
      const dy = moveEvent.clientY - startPosRef.current.y;
      onUpdatePosition(element.id, elemPosRef.current.x + dx, elemPosRef.current.y + dy);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
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
        onSelect(element.id);
      }}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: element.width ? `${element.width}px` : "auto",
        transform: `rotate(${element.rotation}deg) scale(${element.scale})`,
        transformOrigin: "center center",
        cursor: "move",
        userSelect: "none",
        border: isSelected ? "2px dashed var(--color-primary, #6366F1)" : "1px dashed transparent",
        borderRadius: element.borderRadius ? `${element.borderRadius}px` : "0px",
        backgroundColor: element.backgroundColor || "transparent",
        opacity: element.opacity,
        padding: element.padding ? `${element.padding}px` : "4px",
        zIndex: isSelected ? 50 : 10,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: element.fontFamily,
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          color: element.color,
          textAlign: element.alignment,
          letterSpacing: `${element.letterSpacing}px`,
          lineHeight: element.lineHeight,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          textShadow: element.shadow ? `0 2px 8px ${element.shadowColor || "rgba(0,0,0,0.8)"}` : "none",
          WebkitTextStroke: element.strokeWidth && element.strokeColor ? `${element.strokeWidth}px ${element.strokeColor}` : undefined,
        }}
      >
        {element.content}
      </div>

      {isSelected && (
        <div
          style={{
            position: "absolute",
            bottom: -20,
            right: 0,
            fontSize: 10,
            color: "#6366F1",
            background: "rgba(15, 23, 42, 0.8)",
            padding: "1px 4px",
            borderRadius: 3,
            pointerEvents: "none",
          }}
        >
          {Math.round(element.width)}x{Math.round(element.height)}
        </div>
      )}
    </div>
  );
}
