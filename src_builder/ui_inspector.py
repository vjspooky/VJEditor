# src_builder/ui_inspector.py

INSPECTOR_CONTENT = """
// Context-Sensitive Inspector Panel
function InspectorPanel({
  selectedClip,
  project,
  setProject,
  currentTime
}) {
  const [subTab, setSubTab] = React.useState('transform');

  if (!selectedClip) {
    return (
      <div className="w-80 bg-[#12141a] border-l border-[#202433] flex flex-col h-full p-4 select-none overflow-y-auto">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#202433]">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M9 3v18"></path>
          </svg>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Project Properties</h2>
        </div>

        <div className="space-y-4 pt-4">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Project Name</label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-[#181b24] text-xs font-semibold text-white px-3 py-2 rounded-lg border border-[#2b3147] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Canvas Resolution</label>
              <select
                value={project.resolution}
                onChange={(e) => setProject(p => ({ ...p, resolution: e.target.value }))}
                className="w-full bg-[#181b24] text-xs font-semibold text-cyan-400 px-2.5 py-2 rounded-lg border border-[#2b3147] outline-none"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD</option>
                <option value="4K">4K Ultra HD</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Framerate (FPS)</label>
              <select
                value={project.fps}
                onChange={(e) => setProject(p => ({ ...p, fps: parseInt(e.target.value) }))}
                className="w-full bg-[#181b24] text-xs font-semibold text-white px-2.5 py-2 rounded-lg border border-[#2b3147] outline-none"
              >
                <option value="24">24 FPS (Film)</option>
                <option value="30">30 FPS (Standard)</option>
                <option value="60">60 FPS (Smooth)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#181b24] border border-[#262b3d] rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Duration:</span>
              <span className="text-white font-mono font-bold">{project.duration}s</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Tracks:</span>
              <span className="text-white font-mono font-bold">{project.tracks.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Markers:</span>
              <span className="text-white font-mono font-bold">{project.markers.length}</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#181b24] to-[#12141a] border border-[#232838] rounded-xl text-center space-y-2">
            <svg className="w-8 h-8 text-slate-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
            <p className="text-xs font-semibold text-slate-300">No Clip Selected</p>
            <p className="text-[11px] text-slate-500">Click on any video, audio, text or subtitle clip on the timeline to edit its properties.</p>
          </div>
        </div>
      </div>
    );
  }

  // Update clip helper
  const updateClip = (updates) => {
    setProject(prev => {
      const newTracks = prev.tracks.map(t => {
        if (t.id !== selectedClip.trackId) return t;
        return {
          ...t,
          clips: t.clips.map(c => c.id === selectedClip.id ? { ...c, ...updates } : c)
        };
      });
      return { ...prev, tracks: newTracks };
    });
  };

  return (
    <div className="w-80 bg-[#12141a] border-l border-[#202433] flex flex-col h-full select-none overflow-hidden">
      {/* Header with Clip Name & Type */}
      <div className="h-12 border-b border-[#202433] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-bold text-white truncate max-w-[160px]">
            {selectedClip.name}
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#202535] text-cyan-400 border border-cyan-800/40">
          {selectedClip.type}
        </span>
      </div>

      {/* Sub Tabs for Video Clip */}
      {selectedClip.type === 'video' && (
        <div className="flex border-b border-[#202433] bg-[#0f1117] overflow-x-auto text-xs">
          {[
            { id: 'transform', label: 'Transform' },
            { id: 'speed', label: 'Speed' },
            { id: 'color', label: 'Color' },
            { id: 'chroma', label: 'GreenScreen' },
            { id: 'keyframes', label: 'Keyframes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-3 py-2.5 font-semibold whitespace-nowrap transition border-b-2 ${
                subTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-[#171a23]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* TRANSFORM TAB (Video & Images) */}
        {selectedClip.type === 'video' && subTab === 'transform' && (
          <div className="space-y-4">
            {/* Position X, Y */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Position (X, Y)</span>
                <span className="font-mono text-cyan-400">{Math.round(selectedClip.x || 0)}, {Math.round(selectedClip.y || 0)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={Math.round(selectedClip.x || 0)}
                  onChange={(e) => updateClip({ x: parseInt(e.target.value) || 0 })}
                  className="bg-[#181b24] text-xs font-mono text-white px-2.5 py-1.5 rounded border border-[#2b3147] outline-none"
                  placeholder="X"
                />
                <input
                  type="number"
                  value={Math.round(selectedClip.y || 0)}
                  onChange={(e) => updateClip({ y: parseInt(e.target.value) || 0 })}
                  className="bg-[#181b24] text-xs font-mono text-white px-2.5 py-1.5 rounded border border-[#2b3147] outline-none"
                  placeholder="Y"
                />
              </div>
            </div>

            {/* Scale */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Scale</span>
                <span className="font-mono text-cyan-400">{Math.round((selectedClip.scale || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.05"
                value={selectedClip.scale || 1}
                onChange={(e) => updateClip({ scale: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Rotation</span>
                <span className="font-mono text-cyan-400">{Math.round(selectedClip.rotation || 0)}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={selectedClip.rotation || 0}
                onChange={(e) => updateClip({ rotation: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Opacity</span>
                <span className="font-mono text-cyan-400">{Math.round((selectedClip.opacity !== undefined ? selectedClip.opacity : 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={selectedClip.opacity !== undefined ? selectedClip.opacity : 1}
                onChange={(e) => updateClip({ opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Flip Horizontal / Vertical */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => updateClip({ flipH: !selectedClip.flipH })}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                  selectedClip.flipH ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-[#181b24] border-[#2b3147] text-slate-300'
                }`}
              >
                Flip Horiz ⇄
              </button>
              <button
                onClick={() => updateClip({ flipV: !selectedClip.flipV })}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                  selectedClip.flipV ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-[#181b24] border-[#2b3147] text-slate-300'
                }`}
              >
                Flip Vert ⇅
              </button>
            </div>
          </div>
        )}

        {/* SPEED TAB (Video) */}
        {selectedClip.type === 'video' && subTab === 'speed' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Playback Speed</span>
                <span className="font-mono text-cyan-400 font-bold">{selectedClip.speed || 1.0}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="8.0"
                step="0.1"
                value={selectedClip.speed || 1.0}
                onChange={(e) => updateClip({ speed: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Curve Speed Presets */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 block">Curve Speed Ramping</span>
              <div className="grid grid-cols-3 gap-1.5">
                {['Hero', 'Bullet', 'Montage', 'Jump Cut', 'Flash In', 'Flash Out'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => updateClip({ speedCurve: preset.toLowerCase() })}
                    className={`py-2 px-1 text-[10px] font-bold rounded-lg border transition ${
                      selectedClip.speedCurve === preset.toLowerCase()
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-[#181b24] text-slate-300 border-[#2b3147] hover:border-slate-500'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Curve Graph Visualization */}
              <div className="h-24 bg-[#141720] border border-[#232838] rounded-xl p-2 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-cyan-400">Speed Profile Graph</span>
                <svg className="w-full h-14" viewBox="0 0 200 60">
                  <path
                    d={
                      selectedClip.speedCurve === 'hero' ? 'M 10 50 Q 80 10, 100 10 T 190 50' :
                      selectedClip.speedCurve === 'bullet' ? 'M 10 10 L 80 50 L 120 50 L 190 10' :
                      'M 10 50 L 60 10 L 140 10 L 190 50'
                    }
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                  />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#334155" strokeDasharray="3 3" />
                </svg>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0.0s</span>
                  <span>Duration</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLOR GRADING TAB */}
        {selectedClip.type === 'video' && subTab === 'color' && (
          <div className="space-y-3">
            {[
              { label: 'Brightness', prop: 'brightness', min: 0.5, max: 1.8, step: 0.05, def: 1.0 },
              { label: 'Contrast', prop: 'contrast', min: 0.5, max: 2.0, step: 0.05, def: 1.0 },
              { label: 'Saturation', prop: 'saturation', min: 0.0, max: 2.5, step: 0.05, def: 1.0 },
              { label: 'Color Temperature', prop: 'temperature', min: -0.5, max: 0.5, step: 0.02, def: 0.0 }
            ].map(ctrl => {
              const cg = selectedClip.colorGrading || {};
              const val = cg[ctrl.prop] !== undefined ? cg[ctrl.prop] : ctrl.def;
              return (
                <div key={ctrl.prop}>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>{ctrl.label}</span>
                    <span className="font-mono text-cyan-400">{val}</span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={val}
                    onChange={(e) => {
                      const newVal = parseFloat(e.target.value);
                      updateClip({
                        colorGrading: { ...cg, [ctrl.prop]: newVal }
                      });
                    }}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* CHROMA KEY TAB (Green Screen Studio) */}
        {selectedClip.type === 'video' && subTab === 'chroma' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#181b24] border border-[#282e42] rounded-xl">
              <div>
                <p className="text-xs font-bold text-white">Chroma Key / Green Screen</p>
                <p className="text-[10px] text-slate-400">Remove solid studio background</p>
              </div>
              <input
                type="checkbox"
                checked={selectedClip.chromaKey && selectedClip.chromaKey.enabled}
                onChange={(e) => {
                  const curr = selectedClip.chromaKey || {};
                  updateClip({
                    chromaKey: { ...curr, enabled: e.target.checked }
                  });
                }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {selectedClip.chromaKey && selectedClip.chromaKey.enabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Target Key Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedClip.chromaKey.keyColor || '#2b9849'}
                      onChange={(e) => {
                        const curr = selectedClip.chromaKey;
                        updateClip({ chromaKey: { ...curr, keyColor: e.target.value } });
                      }}
                      className="w-9 h-9 rounded border border-[#2b3147] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedClip.chromaKey.keyColor || '#2b9849'}
                      onChange={(e) => {
                        const curr = selectedClip.chromaKey;
                        updateClip({ chromaKey: { ...curr, keyColor: e.target.value } });
                      }}
                      className="bg-[#181b24] text-xs font-mono text-white px-3 py-2 rounded-lg border border-[#2b3147] flex-1"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Similarity (Tolerance)</span>
                    <span className="font-mono text-cyan-400">{selectedClip.chromaKey.similarity || 0.38}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.02"
                    value={selectedClip.chromaKey.similarity || 0.38}
                    onChange={(e) => {
                      const curr = selectedClip.chromaKey;
                      updateClip({ chromaKey: { ...curr, similarity: parseFloat(e.target.value) } });
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Smoothness (Edge Feather)</span>
                    <span className="font-mono text-cyan-400">{selectedClip.chromaKey.smoothness || 0.15}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.4"
                    step="0.01"
                    value={selectedClip.chromaKey.smoothness || 0.15}
                    onChange={(e) => {
                      const curr = selectedClip.chromaKey;
                      updateClip({ chromaKey: { ...curr, smoothness: parseFloat(e.target.value) } });
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* KEYFRAMES TAB (Video) */}
        {selectedClip.type === 'video' && subTab === 'keyframes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">Parametric Keyframes</span>
              <button
                onClick={() => {
                  const localTime = currentTime - selectedClip.startTime;
                  const newKf = {
                    time: Math.max(0, localTime),
                    property: 'scale',
                    value: selectedClip.scale || 1.0,
                    easing: 'ease-out'
                  };
                  updateClip({
                    keyframes: [...(selectedClip.keyframes || []), newKf]
                  });
                }}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-lg"
              >
                + Add Keyframe
              </button>
            </div>

            <div className="space-y-2">
              {(selectedClip.keyframes || []).map((kf, i) => (
                <div key={i} className="bg-[#181b24] border border-[#2b3147] rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-cyan-400">{kf.property}</span>
                    <span className="text-slate-400 font-mono ml-2">@{kf.time.toFixed(2)}s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-300 font-bold">{kf.value}</span>
                    <button
                      onClick={() => {
                        const next = selectedClip.keyframes.filter((_, idx) => idx !== i);
                        updateClip({ keyframes: next });
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEXT / CAPTION INSPECTOR */}
        {(selectedClip.type === 'text' || selectedClip.type === 'caption') && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Content Text</label>
              <textarea
                value={selectedClip.content || ''}
                onChange={(e) => updateClip({ content: e.target.value })}
                rows={3}
                className="w-full bg-[#181b24] text-xs text-white p-2.5 rounded-lg border border-[#2b3147] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Font Family</label>
              <select
                value={selectedClip.font || 'Inter'}
                onChange={(e) => updateClip({ font: e.target.value })}
                className="w-full bg-[#181b24] text-xs font-semibold text-white px-3 py-2 rounded-lg border border-[#2b3147] outline-none"
              >
                <option value="Montserrat">Montserrat (Bold Header)</option>
                <option value="Playfair Display">Playfair Display (Cinematic)</option>
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Bebas Neue">Bebas Neue (Poster / Neon)</option>
                <option value="JetBrains Mono">JetBrains Mono (Typewriter)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Font Size</span>
                <span className="font-mono text-cyan-400">{selectedClip.fontSize || 42}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="100"
                step="2"
                value={selectedClip.fontSize || 42}
                onChange={(e) => updateClip({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Font Color</label>
              <input
                type="color"
                value={selectedClip.color || '#ffffff'}
                onChange={(e) => updateClip({ color: e.target.value })}
                className="w-full h-8 rounded border border-[#2b3147] bg-transparent cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Motion Animation</label>
              <select
                value={selectedClip.animation || 'none'}
                onChange={(e) => updateClip({ animation: e.target.value })}
                className="w-full bg-[#181b24] text-xs font-semibold text-white px-3 py-2 rounded-lg border border-[#2b3147] outline-none"
              >
                <option value="none">None (Static)</option>
                <option value="pop">Pop Scale</option>
                <option value="bounce">Bounce In</option>
                <option value="typewriter">Typewriter Letter-by-Letter</option>
                <option value="fade">Smooth Dissolve</option>
                <option value="glitch">Cyberpunk Glitch</option>
              </select>
            </div>
          </div>
        )}

        {/* AUDIO CLIP INSPECTOR */}
        {selectedClip.type === 'audio' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Track Volume</span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round((selectedClip.volume || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={selectedClip.volume || 1}
                onChange={(e) => updateClip({ volume: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Pan (Stereo L/R)</span>
                <span className="font-mono text-cyan-400">{selectedClip.pan || 0}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={selectedClip.pan || 0}
                onChange={(e) => updateClip({ pan: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Fade In (sec)</label>
                <input
                  type="number"
                  step="0.2"
                  value={selectedClip.fadeIn || 0}
                  onChange={(e) => updateClip({ fadeIn: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#181b24] text-xs text-white px-2.5 py-1.5 rounded border border-[#2b3147]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Fade Out (sec)</label>
                <input
                  type="number"
                  step="0.2"
                  value={selectedClip.fadeOut || 0}
                  onChange={(e) => updateClip({ fadeOut: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#181b24] text-xs text-white px-2.5 py-1.5 rounded border border-[#2b3147]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"""
