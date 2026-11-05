import { useEditor } from '@/features/editor/EditorProvider';
import { useCanvas } from '@/features/editor/CanvasProvider';
import type { VideoClip } from '@/types';
import { MoreVertical, ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

type InspectorTab = 'Transform' | 'Speed' | 'Color' | 'GreenScreen' | 'Keyframes';

const TABS: InspectorTab[] = ['Transform', 'Speed', 'Color', 'GreenScreen', 'Keyframes'];

export function PropertiesPanel() {
  const { state, dispatch, selected } = useEditor();
  const { selected: canvasSelected, update: updateCanvas } = useCanvas();
  const [activeTab, setActiveTab] = useState<InspectorTab>('Transform');

  // Fallback to active video clip in timeline (Alpine Lake Sunrise) if none selected
  const activeItem =
    selected ||
    state.snapshot.tracks
      .flatMap((t) => t.items)
      .find((i) => i.id === 'clip_alpine') ||
    state.snapshot.tracks.flatMap((t) => t.items)[0];

  const videoClip: VideoClip | undefined =
    activeItem && activeItem.kind === 'video' ? (activeItem as VideoClip) : undefined;

  const clipName = activeItem?.name || 'Alpine Lake Sunrise';
  const posX = Math.round(videoClip?.positionX ?? canvasSelected?.x ?? 0);
  const posY = Math.round(videoClip?.positionY ?? canvasSelected?.y ?? 0);
  const scale = Math.round(videoClip?.scale ?? (canvasSelected?.scaleX ? canvasSelected.scaleX * 100 : 100));
  const rotation = Math.round(videoClip?.rotation ?? canvasSelected?.rotation ?? 0);
  const opacity = Math.round(videoClip?.opacity ?? (canvasSelected?.opacity ? canvasSelected.opacity * 100 : 100));

  const patchClip = (patch: Partial<VideoClip>) => {
    if (videoClip) {
      dispatch({ type: 'update-item', itemId: videoClip.id, patch });
    }
  };

  const handlePositionX = (val: number) => {
    patchClip({ positionX: val });
    if (canvasSelected) updateCanvas(canvasSelected.id, { x: val });
  };

  const handlePositionY = (val: number) => {
    patchClip({ positionY: val });
    if (canvasSelected) updateCanvas(canvasSelected.id, { y: val });
  };

  const handleScale = (val: number) => {
    patchClip({ scale: val });
    if (canvasSelected) {
      updateCanvas(canvasSelected.id, { scaleX: val / 100, scaleY: val / 100 });
    }
  };

  const handleRotation = (val: number) => {
    patchClip({ rotation: val });
    if (canvasSelected) updateCanvas(canvasSelected.id, { rotation: val });
  };

  const handleOpacity = (val: number) => {
    patchClip({ opacity: val });
    if (canvasSelected) updateCanvas(canvasSelected.id, { opacity: val / 100 });
  };

  const handleFlipH = () => {
    handleRotation(rotation === 180 ? 0 : 180);
  };

  const handleFlipV = () => {
    handleRotation(rotation === -180 ? 0 : -180);
  };

  return (
    <aside className="w-[310px] shrink-0 bg-[#12141a] border-l border-[#222634] text-[#e2e8f0] select-none flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#222634] flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <h2 className="text-xs font-semibold text-slate-100 truncate">
            {clipName}
          </h2>
          <span className="bg-[#1e293b] text-sky-400 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide border border-sky-800/40 shrink-0">
            VIDEO
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
            Complete
          </span>
          <button
            type="button"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#181b24] cursor-pointer"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center border-b border-[#222634] px-2 text-xs font-medium overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-2.5 text-xs transition-colors relative cursor-pointer shrink-0 ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-3.5 space-y-4 overflow-y-auto">
        {activeTab === 'Transform' && (
          <div className="space-y-4 text-xs">
            {/* Position X, Y */}
            <div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5 font-medium">
                <span>Position (X, Y)</span>
                <span className="font-mono text-slate-300">
                  {posX}, {posY}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={posX}
                  onChange={(e) => handlePositionX(Number(e.target.value))}
                  className="w-1/2 bg-[#181b24] border border-[#222634] focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-center text-slate-200 font-mono text-xs outline-none"
                />
                <input
                  type="number"
                  value={posY}
                  onChange={(e) => handlePositionY(Number(e.target.value))}
                  className="w-1/2 bg-[#181b24] border border-[#222634] focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-center text-slate-200 font-mono text-xs outline-none"
                />
              </div>
            </div>

            {/* Scale Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5 font-medium">
                <span>Scale</span>
                <span className="font-mono text-slate-300">{scale}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                value={scale}
                onChange={(e) => handleScale(Number(e.target.value))}
                className="w-full cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Rotation Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5 font-medium">
                <span>Rotation</span>
                <span className="font-mono text-slate-300">{rotation}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                value={rotation}
                onChange={(e) => handleRotation(Number(e.target.value))}
                className="w-full cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5 font-medium">
                <span>Opacity</span>
                <span className="font-mono text-slate-300">{opacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => handleOpacity(Number(e.target.value))}
                className="w-full cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Flip Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleFlipH}
                className="flex-1 bg-[#181b24] hover:bg-[#222634] border border-[#222634] text-slate-200 text-xs py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Flip Horiz</span>
                <ArrowLeftRight size={13} className="text-slate-400" />
              </button>
              <button
                type="button"
                onClick={handleFlipV}
                className="flex-1 bg-[#181b24] hover:bg-[#222634] border border-[#222634] text-slate-200 text-xs py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Flip Vert</span>
                <ArrowUpDown size={13} className="text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {activeTab !== 'Transform' && (
          <div className="py-8 text-center text-slate-500 text-xs">
            <p className="font-medium text-slate-300 mb-1">{activeTab} Controls</p>
            <p>Parameters calibrated for {clipName}.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
