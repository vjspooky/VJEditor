interface TimelineRulerProps {
  pps: number;        // pixels per second
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function TimelineRuler({ pps, duration, currentTime, onSeek }: TimelineRulerProps) {
  const totalWidth = duration * pps;
  const tickInterval = pps >= 120 ? 1 : pps >= 40 ? 5 : 10; // seconds per tick

  const ticks: number[] = [];
  for (let t = 0; t <= duration; t += tickInterval) {
    ticks.push(t);
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onSeek(Math.max(0, Math.min(duration, x / pps)));
  }

  return (
    <div
      id="timeline-ruler"
      role="slider"
      aria-label="Timeline position"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      onClick={handleClick}
      style={{
        height: 32,
        width: totalWidth,
        minWidth: "100%",
        position: "relative",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {ticks.map((t) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: t * pps,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            paddingBottom: 3,
          }}
        >
          <div style={{ height: 8, width: 1, background: "var(--color-border)" }} />
          <span style={{ fontSize: "0.6rem", color: "var(--color-text-dim)", marginLeft: 2, lineHeight: 1 }}>
            {t}s
          </span>
        </div>
      ))}
    </div>
  );
}
