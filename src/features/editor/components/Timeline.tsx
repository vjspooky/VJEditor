import { useEditor } from '@/features/editor/EditorProvider';
import {
  Scissors,
  Trash2,
  Copy,
  Bookmark,
  Magnet,
  Eye,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { useCallback, useRef, useState, type PointerEvent } from 'react';

const TRACK_DOT_COLORS: Record<string, string> = {
  track_t1: 'bg-purple-500',
  track_c1: 'bg-amber-500',
  track_v2: 'bg-blue-500',
  track_v1: 'bg-cyan-400',
};

const INITIAL_KEYFRAME_DIAMONDS = [
  { timeSec: 0, color: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' },
  { timeSec: 4.5, color: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' },
  { timeSec: 9.5, color: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' },
];

export function Timeline() {
  const { state, dispatch, durationMs } = useEditor();
  const { playheadMs, selectedItemId, zoom } = state.ui;
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [diamonds, setDiamonds] = useState(INITIAL_KEYFRAME_DIAMONDS);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const pixelsPerSecond = zoom || 45;
  const totalSeconds = Math.max(16, Math.ceil(durationMs / 1000));
  const totalTimelineWidth = totalSeconds * pixelsPerSecond + 100;

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const rect = scrollerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clientX - rect.left + scrollerRef.current!.scrollLeft;
      const targetSec = Math.max(0, x / pixelsPerSecond);
      dispatch({ type: 'set-playhead', ms: targetSec * 1000 });
    },
    [dispatch, pixelsPerSecond],
  );

  const handleRulerPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    seekFromClientX(e.clientX);
    const onMove = (moveEvt: globalThis.PointerEvent) => seekFromClientX(moveEvt.clientX);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const handleAddMarker = () => {
    const timeSec = Number((playheadMs / 1000).toFixed(1));
    setDiamonds((prev) => [
      ...prev,
      { timeSec, color: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' },
    ]);
  };

  const playheadLeftPx = (playheadMs / 1000) * pixelsPerSecond;

  return (
    <div className="flex flex-col h-full bg-[#0b0c10] text-[#e2e8f0] select-none border-t border-[#222634] overflow-hidden">
      {/* 1. TOP TOOLBAR */}
      <div className="h-10 shrink-0 bg-[#12141a] border-b border-[#222634] px-3 flex items-center justify-between gap-3">
        {/* Left Action Buttons Group */}
        <div className="flex items-center gap-2">
          {/* Split (S) */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'split-selected' })}
            className="bg-[#181b24] hover:bg-[#222634] border border-[#222634] text-cyan-400 text-xs py-1 px-3 rounded-lg flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
          >
            <Scissors size={13} />
            <span>Split (S)</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'delete-selected' })}
            className="bg-[#181b24] hover:bg-[#222634] border border-[#222634] text-rose-400 text-xs py-1 px-3 rounded-lg flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'duplicate-selected' })}
            className="bg-[#181b24] hover:bg-[#222634] border border-[#222634] text-slate-300 text-xs py-1 px-3 rounded-lg flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
          >
            <Copy size={13} />
            <span>Duplicate</span>
          </button>

          {/* Marker (M) */}
          <button
            type="button"
            onClick={handleAddMarker}
            className="bg-[#181b24] hover:bg-[#222634] border border-[#222634] text-amber-400 text-xs py-1 px-3 rounded-lg flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
          >
            <Bookmark size={13} />
            <span>Marker (M)</span>
          </button>

          {/* Snap */}
          <button
            type="button"
            onClick={() => setSnapEnabled((v) => !v)}
            className={`border text-xs py-1 px-3 rounded-lg flex items-center gap-1.5 font-medium cursor-pointer transition-colors ${
              snapEnabled
                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'border-[#222634] text-slate-400 bg-[#181b24]'
            }`}
          >
            <Magnet size={13} />
            <span>Snap</span>
          </button>
        </div>

        {/* Right Zoom Control */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium">Zoom:</span>
          <input
            type="range"
            min={20}
            max={100}
            value={pixelsPerSecond}
            onChange={(e) => dispatch({ type: 'set-zoom', zoom: Number(e.target.value) })}
            className="w-24 cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-slate-300 text-[11px] w-12 text-right">
            {pixelsPerSecond}px/s
          </span>
        </div>
      </div>

      {/* 2. TIMELINE TRACKS & RULER AREA */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Track Headers Column (w-[180px]) */}
        <div className="w-[180px] shrink-0 bg-[#12141a] border-r border-[#222634] flex flex-col z-20">
          {/* Header Label */}
          <div className="h-7 border-b border-[#222634] flex items-center px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Tracks
          </div>

          {/* Track Headers List */}
          <div className="flex-1 flex flex-col justify-around py-1">
            {state.snapshot.tracks.map((track) => {
              const dotColor = TRACK_DOT_COLORS[track.id] || 'bg-cyan-400';
              return (
                <div
                  key={track.id}
                  className="h-10 px-3 flex items-center justify-between text-xs text-slate-200 border-b border-[#181b24] last:border-b-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                    <span className="truncate font-medium text-[11px]">{track.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                    <Eye size={12} className="cursor-pointer hover:text-slate-300" />
                    <Lock size={12} className="cursor-pointer hover:text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Scrollable Timeline Grid & Ruler */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#0b0c10] select-none"
        >
          <div
            className="relative h-full"
            style={{ width: `${totalTimelineWidth}px` }}
          >
            {/* TIME RULER */}
            <div
              onPointerDown={handleRulerPointerDown}
              className="h-7 border-b border-[#222634] bg-[#12141a] relative cursor-pointer"
            >
              {Array.from({ length: totalSeconds + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-white/10 text-[10px] font-mono text-slate-400 pl-1 pt-1 pointer-events-none"
                  style={{ left: `${i * pixelsPerSecond}px` }}
                >
                  {i}s
                </div>
              ))}

              {/* Keyframe Diamond Markers */}
              {diamonds.map((kf, index) => (
                <div
                  key={index}
                  className={`absolute top-2 w-2.5 h-2.5 rotate-45 ${kf.color} z-30 pointer-events-none transform -translate-x-1/2`}
                  style={{ left: `${kf.timeSec * pixelsPerSecond}px` }}
                />
              ))}
            </div>

            {/* TRACKS LANES */}
            <div className="flex flex-col justify-around h-[calc(100%-28px)] py-1 relative">
              {/* Background Second Grid Lines */}
              {Array.from({ length: totalSeconds + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-white/5 pointer-events-none"
                  style={{ left: `${i * pixelsPerSecond}px` }}
                />
              ))}

              {/* Track Rows */}
              {state.snapshot.tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-10 relative flex items-center border-b border-[#181b24] last:border-b-0"
                >
                  {track.items.map((item) => {
                    const isSelected = selectedItemId === item.id;
                    const leftPx = (item.startMs / 1000) * pixelsPerSecond;
                    const widthPx = Math.max(30, (item.durationMs / 1000) * pixelsPerSecond);
                    const durationSec = (item.durationMs / 1000).toFixed(1);

                    // Track specific clip styling matching prototype
                    let clipStyle =
                      'bg-gradient-to-r from-teal-800 to-cyan-600 border border-cyan-400 text-white';
                    if (track.id === 'track_t1') {
                      clipStyle =
                        'bg-gradient-to-r from-purple-900 to-purple-600 border border-purple-400/50 text-white';
                    } else if (track.id === 'track_c1') {
                      clipStyle =
                        'bg-gradient-to-r from-amber-900 to-amber-700 border border-amber-500/50 text-amber-100';
                    } else if (track.id === 'track_v2') {
                      clipStyle =
                        'bg-gradient-to-r from-blue-950 to-blue-700 border border-blue-500/50 text-blue-100';
                    } else if (track.id === 'track_v1' && item.id === 'clip_alpine') {
                      clipStyle =
                        'bg-gradient-to-r from-cyan-900 to-cyan-500 border border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] text-white';
                    } else if (track.id === 'track_v1') {
                      clipStyle =
                        'bg-gradient-to-r from-slate-900 to-teal-950 border border-teal-800 text-slate-300';
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: 'select', itemId: item.id });
                        }}
                        className={`absolute h-8 rounded-lg px-2.5 flex items-center justify-between text-xs font-semibold cursor-pointer transition-all shadow-md overflow-hidden ${clipStyle} ${
                          isSelected ? 'ring-2 ring-cyan-300 ring-offset-1 ring-offset-black' : ''
                        }`}
                        style={{
                          left: `${leftPx}px`,
                          width: `${widthPx}px`,
                        }}
                      >
                        <span className="truncate mr-1 text-[11px] drop-shadow">
                          {item.name}
                        </span>
                        <span className="text-[10px] opacity-80 font-mono shrink-0">
                          {durationSec}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* SCRUBBER PLAYHEAD LINE WITH DOWNWARD ARROW BADGE */}
              <div
                className="absolute top-0 bottom-0 z-40 pointer-events-none"
                style={{ left: `${playheadLeftPx}px` }}
              >
                {/* Vertical Line */}
                <div className="w-[2px] h-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] -translate-x-1/2 relative">
                  {/* Downward Arrow Scrubber Handle at Bottom */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#181b24] border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-lg">
                    <ChevronDown size={14} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
