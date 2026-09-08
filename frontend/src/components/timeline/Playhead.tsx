interface PlayheadProps {
  currentTime: number;
  pps: number;
}

export default function Playhead({ currentTime, pps }: PlayheadProps) {
  const left = currentTime * pps;

  return (
    <div
      id="timeline-playhead"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left,
        width: 2,
        background: "var(--color-primary)",
        pointerEvents: "none",
        zIndex: 20,
        boxShadow: "0 0 6px rgba(108,99,255,0.5)",
      }}
    >
      {/* Playhead head diamond */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "8px solid var(--color-primary)",
        }}
      />
    </div>
  );
}
