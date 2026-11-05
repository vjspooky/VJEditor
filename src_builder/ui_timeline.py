# src_builder/ui_timeline.py

TIMELINE_CONTENT = """
// Professional Multi-Track Timeline Component
function Timeline({
  project,
  setProject,
  currentTime,
  setCurrentTime,
  selectedClipId,
  setSelectedClipId,
  pixelsPerSecond,
  setPixelsPerSecond,
  isSnapping,
  setIsSnapping
}) {
  const rulerRef = React.useRef(null);
  const timelineBodyRef = React.useRef(null);
  const [draggingClip, setDraggingClip] = React.useState(null); // { clipId, trackId, startX, originalStartTime, originalDuration, isTrimLeft, isTrimRight }

  // Seek on ruler click
  const handleRulerClick = (e) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + rulerRef.current.scrollLeft;
    const newTime = Math.max(0, Math.min(project.duration, clickX / pixelsPerSecond));
    setCurrentTime(newTime);
  };

  // Split Clip at Playhead
  const handleSplitAtPlayhead = () => {
    if (!selectedClipId) return;
    setProject(prev => {
      let splitSuccess = false;
      const newTracks = prev.tracks.map(t => {
        const clipIdx = t.clips.findIndex(c => c.id === selectedClipId);
        if (clipIdx === -1) return t;

        const clip = t.clips[clipIdx];
        const localTime = currentTime - clip.startTime;
        if (localTime <= 0.1 || localTime >= clip.duration - 0.1) return t;

        splitSuccess = true;
        const firstClip = {
          ...clip,
          duration: localTime
        };
        const secondClip = {
          ...clip,
          id: 'clip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: clip.name + ' (Part 2)',
          startTime: currentTime,
          duration: clip.duration - localTime,
          sourceStartTime: (clip.sourceStartTime || 0) + localTime
        };

        const updatedClips = [...t.clips];
        updatedClips.splice(clipIdx, 1, firstClip, secondClip);
        return { ...t, clips: updatedClips };
      });

      if (splitSuccess) {
        if (window.showToast) window.showToast('Clip split at playhead!');
      }
      return { ...prev, tracks: newTracks };
    });
  };

  // Delete Selected Clip
  const handleDeleteClip = () => {
    if (!selectedClipId) return;
    setProject(prev => {
      const newTracks = prev.tracks.map(t => ({
        ...t,
        clips: t.clips.filter(c => c.id !== selectedClipId)
      }));
      return { ...prev, tracks: newTracks };
    });
    setSelectedClipId(null);
  };

  // Duplicate Selected Clip
  const handleDuplicateClip = () => {
    if (!selectedClipId) return;
    setProject(prev => {
      const newTracks = prev.tracks.map(t => {
        const clip = t.clips.find(c => c.id === selectedClipId);
        if (!clip) return t;
        const dup = {
          ...clip,
          id: 'clip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: clip.name + ' (Copy)',
          startTime: clip.startTime + clip.duration
        };
        return { ...t, clips: [...t.clips, dup] };
      });
      return { ...prev, tracks: newTracks };
    });
  };

  // Add Marker at Playhead
  const handleAddMarker = () => {
    const colors = ['#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#a855f7'];
    const newMarker = {
      id: 'marker-' + Date.now(),
      time: currentTime,
      label: `Marker ${project.markers.length + 1}`,
      color: colors[project.markers.length % colors.length]
    };
    setProject(prev => ({
      ...prev,
      markers: [...prev.markers, newMarker]
    }));
  };

  // Dragging & Trimming Clips (Mouse Listeners)
  const handleClipMouseDown = (e, clip, trackId, mode = 'move') => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setDraggingClip({
      clipId: clip.id,
      trackId: trackId,
      startX: e.clientX,
      originalStartTime: clip.startTime,
      originalDuration: clip.duration,
      mode: mode // 'move', 'trim-left', 'trim-right'
    });
  };

  React.useEffect(() => {
    if (!draggingClip) return;

    const handleMouseMove = (e) => {
      const deltaPx = e.clientX - draggingClip.startX;
      const deltaTime = deltaPx / pixelsPerSecond;

      setProject(prev => {
        const newTracks = prev.tracks.map(t => {
          if (t.id !== draggingClip.trackId) return t;
          return {
            ...t,
            clips: t.clips.map(c => {
              if (c.id !== draggingClip.clipId) return c;

              if (draggingClip.mode === 'move') {
                let newStart = Math.max(0, draggingClip.originalStartTime + deltaTime);
                // Magnetic snap to playhead if close
                if (isSnapping && Math.abs(newStart - currentTime) < 0.15) {
                  newStart = currentTime;
                }
                return { ...c, startTime: newStart };
              } else if (draggingClip.mode === 'trim-left') {
                const newStart = Math.max(0, Math.min(draggingClip.originalStartTime + draggingClip.originalDuration - 0.2, draggingClip.originalStartTime + deltaTime));
                const newDuration = draggingClip.originalDuration - (newStart - draggingClip.originalStartTime);
                return { ...c, startTime: newStart, duration: newDuration };
              } else if (draggingClip.mode === 'trim-right') {
                const newDuration = Math.max(0.2, draggingClip.originalDuration + deltaTime);
                return { ...c, duration: newDuration };
              }
              return c;
            })
          };
        });
        return { ...prev, tracks: newTracks };
      });
    };

    const handleMouseUp = () => {
      setDraggingClip(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingClip, pixelsPerSecond, isSnapping, currentTime]);

  const timelineWidth = Math.max(1200, (project.duration + 5) * pixelsPerSecond);

  return (
    <div className="h-72 bg-[#0e1015] border-t border-[#202433] flex flex-col select-none relative z-10">
      {/* Timeline Toolbar Header */}
      <div className="h-10 bg-[#12141a] border-b border-[#202433] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Split (S) */}
          <button
            onClick={handleSplitAtPlayhead}
            disabled={!selectedClipId}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#181b24] hover:bg-[#202534] text-slate-300 hover:text-white border border-[#262b3d] text-xs font-medium transition disabled:opacity-40"
            title="Split Clip at Playhead (S)"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="2" x2="12" y2="22"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>Split (S)</span>
          </button>

          {/* Delete (Del) */}
          <button
            onClick={handleDeleteClip}
            disabled={!selectedClipId}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#181b24] hover:bg-[#202534] text-slate-300 hover:text-rose-400 border border-[#262b3d] text-xs font-medium transition disabled:opacity-40"
            title="Delete Selected Clip (Del)"
          >
            <svg className="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete</span>
          </button>

          {/* Duplicate (Ctrl+D) */}
          <button
            onClick={handleDuplicateClip}
            disabled={!selectedClipId}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#181b24] hover:bg-[#202534] text-slate-300 hover:text-white border border-[#262b3d] text-xs font-medium transition disabled:opacity-40"
            title="Duplicate Selected Clip (Ctrl+D)"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="13" height="13" x="9" y="9" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Duplicate</span>
          </button>

          <div className="h-4 w-px bg-[#262b3d]"></div>

          {/* Marker (M) */}
          <button
            onClick={handleAddMarker}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#181b24] hover:bg-[#202534] text-slate-300 hover:text-cyan-400 border border-[#262b3d] text-xs font-medium transition"
            title="Add Timeline Marker (M)"
          >
            <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            <span>Marker (M)</span>
          </button>

          {/* Snapping Toggle */}
          <button
            onClick={() => setIsSnapping(!isSnapping)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium border transition ${
              isSnapping
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-400'
                : 'bg-[#181b24] border-[#262b3d] text-slate-400 hover:text-white'
            }`}
            title="Magnetic Timeline Snapping"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 15c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H6Z"></path>
              <path d="M16 15c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-2Z"></path>
            </svg>
            <span>Snap</span>
          </button>
        </div>

        {/* Timeline Zoom Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-medium">Zoom:</span>
          <input
            type="range"
            min="20"
            max="120"
            value={pixelsPerSecond}
            onChange={(e) => setPixelsPerSecond(parseInt(e.target.value))}
            className="w-24"
            title="Timeline Zoom Level"
          />
          <span className="text-[10px] font-mono text-slate-400 w-8">{pixelsPerSecond}px/s</span>
        </div>
      </div>

      {/* Tracks & Ruler Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Column) */}
        <div className="w-48 bg-[#111319] border-r border-[#202433] flex flex-col flex-shrink-0 z-20">
          {/* Header Spacer for Ruler */}
          <div className="h-7 bg-[#0d0f14] border-b border-[#202433] flex items-center px-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tracks</span>
          </div>

          {/* Track Labels & Controls */}
          <div className="flex-1 overflow-y-auto">
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="h-14 border-b border-[#1c1f2b] px-3 flex items-center justify-between bg-[#111319]"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${track.type === 'video' ? 'bg-cyan-400' : track.type === 'audio' ? 'bg-emerald-400' : 'bg-purple-400'}`}></span>
                  <span className="text-xs font-semibold text-slate-300 truncate">{track.name}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Eye Toggle (Visibility) */}
                  <button
                    onClick={() => {
                      setProject(p => ({
                        ...p,
                        tracks: p.tracks.map(t => t.id === track.id ? { ...t, isVisible: !t.isVisible } : t)
                      }));
                    }}
                    className={`p-1 rounded ${track.isVisible ? 'text-slate-400 hover:text-white' : 'text-slate-600'}`}
                    title={track.isVisible ? 'Hide Track' : 'Show Track'}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={() => {
                      setProject(p => ({
                        ...p,
                        tracks: p.tracks.map(t => t.id === track.id ? { ...t, isLocked: !t.isLocked } : t)
                      }));
                    }}
                    className={`p-1 rounded ${track.isLocked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title={track.isLocked ? 'Unlock Track' : 'Lock Track'}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Timeline Area (Ruler & Clips) */}
        <div
          ref={timelineBodyRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#0a0b0e] timeline-grid"
        >
          {/* Playhead Needle (Extends through all tracks) */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none"
            style={{ left: `${currentTime * pixelsPerSecond}px` }}
          >
            {/* Playhead Head Marker */}
            <div className="w-3.5 h-4 bg-cyan-400 -ml-[7px] flex items-center justify-center clip-playhead shadow-md shadow-cyan-500/50">
              <div className="w-1 h-2 bg-slate-950"></div>
            </div>
            {/* Playhead Vertical Line */}
            <div className="w-0.5 bg-cyan-400 h-full shadow-sm shadow-cyan-400"></div>
          </div>

          <div style={{ width: `${timelineWidth}px` }} className="relative">
            {/* Time Ruler */}
            <div
              ref={rulerRef}
              onClick={handleRulerClick}
              className="h-7 bg-[#0e1015] border-b border-[#202433] relative cursor-pointer select-none"
            >
              {/* Ticks along ruler */}
              {[...Array(Math.ceil(project.duration + 5))].map((_, sec) => (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 border-l border-slate-700/60 flex items-end pl-1 pb-0.5"
                  style={{ left: `${sec * pixelsPerSecond}px` }}
                >
                  <span className="text-[9px] font-mono font-medium text-slate-400">
                    {sec}s
                  </span>
                </div>
              ))}

              {/* Markers on Ruler */}
              {project.markers.map((mk) => (
                <div
                  key={mk.id}
                  className="absolute top-0 z-20 cursor-pointer group"
                  style={{ left: `${mk.time * pixelsPerSecond}px` }}
                  title={`${mk.label} (${mk.time}s)`}
                  onClick={(e) => { e.stopPropagation(); setCurrentTime(mk.time); }}
                >
                  <div
                    className="w-2.5 h-2.5 rotate-45 -ml-[5px] mt-1 shadow-sm"
                    style={{ backgroundColor: mk.color }}
                  ></div>
                  <div className="hidden group-hover:block absolute top-6 -left-12 bg-black/90 text-[10px] text-white px-2 py-0.5 rounded whitespace-nowrap border border-slate-700 z-30">
                    {mk.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Track Lanes */}
            <div className="relative">
              {project.tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-14 border-b border-[#181a24] relative bg-[#0c0d12]/60 hover:bg-[#0f1118]/80 transition-colors"
                >
                  {/* Clips on this track */}
                  {track.clips.map((clip) => {
                    const isSelected = clip.id === selectedClipId;
                    const leftPos = clip.startTime * pixelsPerSecond;
                    const widthPx = Math.max(20, clip.duration * pixelsPerSecond);

                    // Colors by type
                    const bgClass = clip.type === 'video'
                      ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-600/70 text-cyan-200'
                      : clip.type === 'audio'
                      ? 'bg-gradient-to-r from-emerald-950 to-teal-950 border-emerald-600/70 text-emerald-200'
                      : clip.type === 'text'
                      ? 'bg-gradient-to-r from-purple-950 to-indigo-950 border-purple-600/70 text-purple-200'
                      : 'bg-gradient-to-r from-amber-950 to-orange-950 border-amber-600/70 text-amber-200';

                    return (
                      <div
                        key={clip.id}
                        onMouseDown={(e) => handleClipMouseDown(e, clip, track.id, 'move')}
                        style={{
                          left: `${leftPos}px`,
                          width: `${widthPx}px`
                        }}
                        className={`absolute top-1.5 bottom-1.5 rounded-lg border flex items-center px-2 cursor-grab active:cursor-grabbing overflow-hidden shadow-sm transition-shadow ${bgClass} ${
                          isSelected ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-md shadow-cyan-500/30' : 'hover:border-slate-400'
                        }`}
                      >
                        {/* Trim Left Handle */}
                        <div
                          onMouseDown={(e) => handleClipMouseDown(e, clip, track.id, 'trim-left')}
                          className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-cyan-400/40 z-10"
                        ></div>

                        {/* Clip Content Label & Keyframe diamonds */}
                        <div className="flex-1 min-w-0 flex items-center space-x-1.5 pointer-events-none">
                          <span className="text-[11px] font-bold truncate">
                            {clip.name}
                          </span>
                          <span className="text-[9px] font-mono opacity-60">
                            {clip.duration.toFixed(1)}s
                          </span>

                          {/* Keyframes indicator */}
                          {clip.keyframes && clip.keyframes.length > 0 && (
                            <div className="flex space-x-1 pl-1">
                              {clip.keyframes.map((kf, ki) => (
                                <div key={ki} className="keyframe-diamond"></div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Trim Right Handle */}
                        <div
                          onMouseDown={(e) => handleClipMouseDown(e, clip, track.id, 'trim-right')}
                          className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-cyan-400/40 z-10"
                        ></div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
