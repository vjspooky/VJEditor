# src_builder/ui_canvas_view.py

CANVAS_VIEW_CONTENT = """
// Center Video Preview & Playback Controls
function formatTimecode(seconds, fps = 30) {
  const s = Math.max(0, seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const frames = Math.floor((s % 1) * fps);

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

function CanvasPreview({
  canvasRef,
  project,
  setProject,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  aspectRatio,
  setAspectRatio,
  zoomLevel,
  setZoomLevel,
  showSafeZones,
  setShowSafeZones,
  isLooping,
  setIsLooping,
  volume,
  setVolume,
  isMuted,
  setIsMuted
}) {
  const [audioMeter, setAudioMeter] = React.useState({ left: 0, right: 0, peak: -60 });
  const [visualizerMode, setVisualizerMode] = React.useState('bars');

  // Audio meter polling
  React.useEffect(() => {
    let animId;
    const poll = () => {
      if (isPlaying) {
        setAudioMeter(audioEngine.getAudioLevels());
      } else {
        setAudioMeter({ left: 0, right: 0, peak: -60 });
      }
      animId = requestAnimationFrame(poll);
    };
    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Frame Stepping
  const stepFrame = (deltaFrames) => {
    const fps = project.fps || 30;
    const newTime = Math.max(0, Math.min(project.duration, currentTime + deltaFrames / fps));
    setCurrentTime(newTime);
  };

  // Determine Aspect Ratio Container CSS
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '9:16': return 'w-[320px] h-[568px]';
      case '1:1': return 'w-[480px] h-[480px]';
      case '4:5': return 'w-[420px] h-[525px]';
      case '4:3': return 'w-[560px] h-[420px]';
      case '21:9': return 'w-[700px] h-[300px]';
      case '16:9':
      default: return 'w-[640px] h-[360px] max-w-full';
    }
  };

  const getCanvasResolution = () => {
    switch (aspectRatio) {
      case '9:16': return { w: 1080, h: 1920 };
      case '1:1': return { w: 1080, h: 1080 };
      case '4:5': return { w: 1080, h: 1350 };
      case '4:3': return { w: 1440, h: 1080 };
      case '21:9': return { w: 2560, h: 1080 };
      case '16:9':
      default: return { w: 1920, h: 1080 };
    }
  };

  const res = getCanvasResolution();

  return (
    <div className="flex-1 flex flex-col bg-[#0b0c10] overflow-hidden select-none relative">
      {/* Viewport Top Bar (Aspect Ratio, Zoom, Safe Zones) */}
      <div className="h-10 bg-[#12141a] border-b border-[#202433] px-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 font-medium">Aspect:</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-[#1b1f2d] text-cyan-400 font-semibold px-2 py-1 rounded border border-[#2b3147] text-xs outline-none cursor-pointer"
            >
              <option value="16:9">16:9 (Landscape YouTube)</option>
              <option value="9:16">9:16 (Shorts / Reels / TikTok)</option>
              <option value="1:1">1:1 (Square Feed)</option>
              <option value="4:5">4:5 (Instagram Portrait)</option>
              <option value="4:3">4:3 (Classic Television)</option>
              <option value="21:9">21:9 (Cinematic Ultrawide)</option>
            </select>
          </div>

          <div className="h-4 w-px bg-[#262b3d]"></div>

          {/* Zoom Level */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 font-medium">Zoom:</span>
            <select
              value={zoomLevel}
              onChange={(e) => setZoomLevel(e.target.value)}
              className="bg-[#1b1f2d] text-slate-200 font-medium px-2 py-1 rounded border border-[#2b3147] text-xs outline-none cursor-pointer"
            >
              <option value="fit">Fit Viewport</option>
              <option value="50%">50% Scale</option>
              <option value="75%">75% Scale</option>
              <option value="100%">100% 1:1 Pixel</option>
              <option value="150%">150% Detail</option>
            </select>
          </div>
        </div>

        {/* Safe Zones & Quality */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium border transition ${
              showSafeZones 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400' 
                : 'bg-[#181b24] border-[#292f44] text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Action & Title Safe Zones"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M3 9h18"></path>
              <path d="M9 21V9"></path>
            </svg>
            <span>Safe Zones</span>
          </button>

          <span className="text-[11px] font-mono text-slate-400 bg-[#171a23] px-2 py-0.5 rounded border border-[#232838]">
            {res.w} × {res.h} • {project.fps} FPS
          </span>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
        <div
          className={`relative bg-black rounded-lg shadow-2xl border border-[#232838] overflow-hidden flex items-center justify-center transition-all ${getAspectClass()}`}
          style={{
            transform: zoomLevel === 'fit' ? 'scale(1)' : `scale(${parseFloat(zoomLevel) / 100})`,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)'
          }}
        >
          <canvas
            ref={canvasRef}
            width={res.w}
            height={res.h}
            className="w-full h-full object-contain block"
          />
        </div>
      </div>

      {/* Transport Controls Bottom Bar */}
      <div className="h-14 bg-[#12141a] border-t border-[#202433] px-6 flex items-center justify-between z-10">
        {/* Left: Timecode Readout */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#171a23] border border-[#232838] px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-cyan-400 font-mono-time text-sm font-bold tracking-wider">
              {formatTimecode(currentTime, project.fps)}
            </span>
            <span className="text-slate-500 font-mono text-xs">/</span>
            <span className="text-slate-400 font-mono-time text-xs font-semibold">
              {formatTimecode(project.duration, project.fps)}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 pl-1">
            Frame: {Math.floor(currentTime * (project.fps || 30))}
          </div>
        </div>

        {/* Center: Play, Pause, Frame Stepping */}
        <div className="flex items-center space-x-2">
          {/* Jump to start */}
          <button
            onClick={() => setCurrentTime(0)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c202d] transition"
            title="Jump to Start (Home)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>

          {/* Previous Frame */}
          <button
            onClick={() => stepFrame(-1)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c202d] transition"
            title="Previous Frame (Left Arrow)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* PLAY / PAUSE */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 transition transform active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          {/* Next Frame */}
          <button
            onClick={() => stepFrame(1)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c202d] transition"
            title="Next Frame (Right Arrow)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Jump to end */}
          <button
            onClick={() => setCurrentTime(project.duration)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c202d] transition"
            title="Jump to End"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>

          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg transition ${
              isLooping ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-400 hover:text-white hover:bg-[#1c202d]'
            }`}
            title="Loop Playback"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </button>
        </div>

        {/* Right: Playback Speed, Volume, Stereo Meter */}
        <div className="flex items-center space-x-4">
          {/* Speed Selector */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-400 font-medium">Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-[#1b1f2d] text-slate-200 font-semibold px-2 py-1 rounded border border-[#2b3147] text-xs outline-none cursor-pointer"
            >
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
              <option value="4">4.0x</option>
            </select>
          </div>

          {/* Master Volume */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const nextMute = !isMuted;
                setIsMuted(nextMute);
                audioEngine.setMasterVolume(nextMute ? 0 : volume);
              }}
              className="text-slate-400 hover:text-white transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                setIsMuted(false);
                audioEngine.setMasterVolume(val);
              }}
              className="w-18"
              title="Master Volume"
            />
          </div>

          {/* Real-time 12-segment Stereo Peak dB Meter */}
          <div className="flex items-center space-x-1 bg-[#171a23] border border-[#232838] px-2 py-1 rounded" title={`Audio Peak: ${audioMeter.peak} dB`}>
            {/* Left channel */}
            <div className="flex flex-col space-y-0.5 w-1.5 h-7 justify-end">
              {[...Array(8)].map((_, i) => {
                const threshold = (8 - i) / 8;
                const isLit = audioMeter.left >= threshold;
                const color = i < 2 ? 'active-red' : i < 4 ? 'active-yellow' : 'active-green';
                return (
                  <div key={i} className={`meter-led ${isLit ? color : ''}`}></div>
                );
              })}
            </div>

            {/* Right channel */}
            <div className="flex flex-col space-y-0.5 w-1.5 h-7 justify-end">
              {[...Array(8)].map((_, i) => {
                const threshold = (8 - i) / 8;
                const isLit = audioMeter.right >= threshold;
                const color = i < 2 ? 'active-red' : i < 4 ? 'active-yellow' : 'active-green';
                return (
                  <div key={i} className={`meter-led ${isLit ? color : ''}`}></div>
                );
              })}
            </div>

            <span className="text-[9px] font-mono font-bold text-slate-400 pl-1">
              {audioMeter.peak > -60 ? `${audioMeter.peak}dB` : '-∞'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
