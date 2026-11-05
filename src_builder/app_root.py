# src_builder/app_root.py

APP_ROOT_CONTENT = """
// Root Application Component
function App() {
  const [project, setProjectState] = React.useState(createInitialProject);
  const [history, setHistory] = React.useState({ past: [], future: [] });
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1.0);
  const [aspectRatio, setAspectRatio] = React.useState('16:9');
  const [zoomLevel, setZoomLevel] = React.useState('fit');
  const [showSafeZones, setShowSafeZones] = React.useState(false);
  const [isLooping, setIsLooping] = React.useState(true);
  const [volume, setVolume] = React.useState(0.8);
  const [isMuted, setIsMuted] = React.useState(false);
  const [selectedClipId, setSelectedClipId] = React.useState('clip-v1');
  const [activeTab, setActiveTab] = React.useState('media');
  const [pixelsPerSecond, setPixelsPerSecond] = React.useState(45);
  const [isSnapping, setIsSnapping] = React.useState(true);
  const [autosaveStatus, setAutosaveStatus] = React.useState('saved');
  const [toastMessage, setToastMessage] = React.useState(null);

  // Modals state
  const [exportOpen, setExportOpen] = React.useState(false);
  const [aiVideoOpen, setAiVideoOpen] = React.useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = React.useState(false);
  const [commandBarOpen, setCommandBarOpen] = React.useState(false);
  const [recordOpen, setRecordOpen] = React.useState(false);
  const [projectsOpen, setProjectsOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  const canvasRef = React.useRef(null);
  const lastTimeRef = React.useRef(performance.now());

  // In-page Toast Notification Helper
  const showToast = React.useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  React.useEffect(() => {
    window.showToast = showToast;
  }, [showToast]);

  // Set Project with Undo History Tracking
  const setProject = React.useCallback((updater) => {
    setProjectState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setHistory((h) => ({
        past: [prev, ...h.past.slice(0, 40)],
        future: []
      }));
      setAutosaveStatus('saving');
      return next;
    });
  }, []);

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[0];
    const newPast = history.past.slice(1);
    setHistory((h) => ({
      past: newPast,
      future: [project, ...h.future]
    }));
    setProjectState(previous);
    showToast('Undo');
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    setHistory((h) => ({
      past: [project, ...h.past],
      future: newFuture
    }));
    setProjectState(next);
    showToast('Redo');
  };

  // Autosave to localStorage
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('vjeditor_current_project', JSON.stringify(project));
      } catch (e) {}
      setAutosaveStatus('saved');
    }, 1200);
    return () => clearTimeout(timer);
  }, [project]);

  // Keyboard Shortcuts Listener
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        // trigger split
        const splitBtn = document.querySelector('button[title*="Split"]');
        if (splitBtn) splitBtn.click();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const delBtn = document.querySelector('button[title*="Delete"]');
        if (delBtn) delBtn.click();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const mkBtn = document.querySelector('button[title*="Marker"]');
        if (btn) btn.click();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen((v) => !v);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 1 / (project.fps || 30)));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(project.duration, t + 1 / (project.fps || 30)));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project.fps, project.duration, history]);

  // Find currently selected clip object
  const selectedClip = React.useMemo(() => {
    if (!selectedClipId) return null;
    for (const track of project.tracks) {
      const found = track.clips.find((c) => c.id === selectedClipId);
      if (found) return found;
    }
    return null;
  }, [project.tracks, selectedClipId]);

  // Authoritative Playback Render Loop (Single Timeline Clock)
  React.useEffect(() => {
    let animId;

    const renderLoop = (now) => {
      if (isPlaying) {
        const delta = (now - lastTimeRef.current) / 1000;
        setCurrentTime((curr) => {
          let next = curr + delta * playbackSpeed;
          if (next >= project.duration) {
            if (isLooping) {
              next = 0;
            } else {
              setIsPlaying(false);
              next = project.duration;
            }
          }
          return next;
        });
      }
      lastTimeRef.current = now;

      // Draw canvas frame
      if (canvasRef.current) {
        renderVideoFrame({
          canvas: canvasRef.current,
          project,
          currentTime,
          selectedClipId,
          showSafeZones,
          aspectRatio
        });
      }

      animId = requestAnimationFrame(renderLoop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, project, currentTime, selectedClipId, showSafeZones, aspectRatio, isLooping]);

  // Synchronize Audio Playback
  React.useEffect(() => {
    if (isPlaying) {
      audioEngine.startMusicLoop('cinematic', volume);
    } else {
      audioEngine.stopMusic();
    }
  }, [isPlaying, volume]);

  // Action Helpers for Sidebar / Commands
  const handleAddMediaClip = (media) => {
    const track = project.tracks.find((t) => t.type === 'video');
    if (!track) return;
    const newClip = {
      id: 'clip-' + Date.now(),
      trackId: track.id,
      name: media.name,
      type: media.type === 'audio' ? 'audio' : 'video',
      mediaId: media.id,
      mediaUrl: media.url,
      startTime: currentTime,
      duration: media.duration || 6.0,
      sourceStartTime: 0,
      sourceDuration: media.duration || 6.0,
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      speed: 1.0,
      keyframes: []
    };
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, newClip] } : t))
    }));
    setSelectedClipId(newClip.id);
    showToast(`Added ${media.name} to timeline`);
  };

  const handleAddTextClip = (preset) => {
    const track = project.tracks.find((t) => t.type === 'text');
    if (!track) return;
    const newClip = {
      id: 'clip-text-' + Date.now(),
      trackId: track.id,
      name: preset.name || 'Title Text',
      type: 'text',
      content: preset.name.toUpperCase() || 'TITLE TEXT',
      font: preset.font || 'Montserrat',
      fontSize: preset.size || 48,
      fontWeight: preset.weight || '700',
      color: preset.color || '#ffffff',
      shadow: !!preset.shadow,
      stroke: preset.stroke || '',
      strokeWidth: preset.strokeWidth || 0,
      bg: preset.bg || '',
      animation: preset.anim || 'pop',
      startTime: currentTime,
      duration: 4.0,
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0
    };
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, newClip] } : t))
    }));
    setSelectedClipId(newClip.id);
    showToast('Added Text Title to timeline');
  };

  const handleAddStickerClip = (sticker) => {
    const track = project.tracks.find((t) => t.type === 'text') || project.tracks[0];
    const newClip = {
      id: 'clip-stk-' + Date.now(),
      trackId: track.id,
      name: sticker.label,
      type: 'text',
      content: sticker.emoji || sticker.label,
      font: 'Inter',
      fontSize: sticker.emoji ? 54 : 32,
      fontWeight: '700',
      color: '#ffffff',
      bg: sticker.badge ? sticker.color || '#ef4444' : '',
      animation: sticker.anim || 'bounce',
      startTime: currentTime,
      duration: 3.5,
      x: 0,
      y: 120,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0
    };
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, newClip] } : t))
    }));
    setSelectedClipId(newClip.id);
    showToast(`Added sticker: ${sticker.label}`);
  };

  const handleAddAudioClip = (item, type = 'music') => {
    const targetTrackId = type === 'music' ? 'track-audio-bgm' : 'track-audio-sfx';
    const track = project.tracks.find((t) => t.id === targetTrackId) || project.tracks[project.tracks.length - 1];
    const newClip = {
      id: 'clip-aud-' + Date.now(),
      trackId: track.id,
      name: item.name,
      type: 'audio',
      musicGenre: item.category ? item.category.toLowerCase() : 'cinematic',
      sfxType: item.id.replace('sfx-', ''),
      startTime: currentTime,
      duration: item.duration || 6.0,
      volume: 0.8,
      pan: 0
    };
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, newClip] } : t))
    }));
    setSelectedClipId(newClip.id);
    showToast(`Added ${item.name} to audio track`);
  };

  const handleAddCaptionClip = (text) => {
    const track = project.tracks.find((t) => t.type === 'caption');
    if (!track) return;
    const newClip = {
      id: 'clip-cap-' + Date.now(),
      trackId: track.id,
      name: 'Subtitle',
      type: 'caption',
      content: text,
      style: 'karaoke',
      fontSize: 32,
      color: '#ffffff',
      startTime: currentTime,
      duration: 4.0
    };
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, newClip] } : t))
    }));
    setSelectedClipId(newClip.id);
    showToast('Generated Subtitle Caption');
  };

  const handleApplyTemplate = (tpl) => {
    const fresh = createInitialProject();
    fresh.name = tpl.name;
    fresh.aspectRatio = tpl.aspectRatio;
    fresh.duration = tpl.duration;
    setAspectRatio(tpl.aspectRatio);
    setProject(fresh);
    showToast(`Applied ${tpl.name} template!`);
  };

  const handleCommandAction = (cmdId) => {
    if (cmdId === 'split') {
      const btn = document.querySelector('button[title*="Split"]');
      if (btn) btn.click();
    } else if (cmdId === 'delete') {
      const btn = document.querySelector('button[title*="Delete"]');
      if (btn) btn.click();
    } else if (cmdId === 'duplicate') {
      const btn = document.querySelector('button[title*="Duplicate"]');
      if (btn) btn.click();
    } else if (cmdId === 'marker') {
      const btn = document.querySelector('button[title*="Marker"]');
      if (btn) btn.click();
    } else if (cmdId === 'export') {
      setExportOpen(true);
    } else if (cmdId === 'ai-video') {
      setAiVideoOpen(true);
    } else if (cmdId === 'aspect-916') {
      setAspectRatio('9:16');
      showToast('Set aspect ratio to 9:16');
    } else if (cmdId === 'aspect-169') {
      setAspectRatio('16:9');
      showToast('Set aspect ratio to 16:9');
    } else if (cmdId === 'safe-zones') {
      setShowSafeZones((v) => !v);
    } else if (cmdId === 'record') {
      setRecordOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0c10] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Main Toolbar */}
      <TopToolbar
        project={project}
        setProject={setProject}
        undo={undo}
        redo={redo}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        autosaveStatus={autosaveStatus}
        onOpenExport={() => setExportOpen(true)}
        onOpenAIStudio={() => setAiAssistantOpen(true)}
        onOpenCommandBar={() => setCommandBarOpen(true)}
        onOpenProjects={() => setProjectsOpen(true)}
        onOpenRecord={() => setRecordOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenSettings={() => setProjectsOpen(true)}
      />

      {/* Main Workspace (Sidebar + Canvas + Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (13 tabs) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          project={project}
          setProject={setProject}
          onAddMediaClip={handleAddMediaClip}
          onAddTextClip={handleAddTextClip}
          onAddStickerClip={handleAddStickerClip}
          onAddAudioClip={handleAddAudioClip}
          onAddCaptionClip={handleAddCaptionClip}
          onApplyTemplate={handleApplyTemplate}
          onOpenRecord={() => setRecordOpen(true)}
          onOpenAIVideoModal={() => setAiVideoOpen(true)}
          selectedClip={selectedClip}
        />

        {/* Center Preview Viewport */}
        <CanvasPreview
          canvasRef={canvasRef}
          project={project}
          setProject={setProject}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          showSafeZones={showSafeZones}
          setShowSafeZones={setShowSafeZones}
          isLooping={isLooping}
          setIsLooping={setIsLooping}
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />

        {/* Right Inspector Panel */}
        <InspectorPanel
          selectedClip={selectedClip}
          project={project}
          setProject={setProject}
          currentTime={currentTime}
        />
      </div>

      {/* Bottom Multi-Track Professional Timeline */}
      <Timeline
        project={project}
        setProject={setProject}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        selectedClipId={selectedClipId}
        setSelectedClipId={setSelectedClipId}
        pixelsPerSecond={pixelsPerSecond}
        setPixelsPerSecond={setPixelsPerSecond}
        isSnapping={isSnapping}
        setIsSnapping={setIsSnapping}
      />

      {/* In-Page Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161a25] border border-cyan-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2.5 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        canvasRef={canvasRef}
        project={project}
        renderFrameFn={(t) => {
          if (canvasRef.current) {
            renderVideoFrame({
              canvas: canvasRef.current,
              project,
              currentTime: t,
              selectedClipId: null,
              showSafeZones: false,
              aspectRatio
            });
          }
        }}
      />

      <AIVideoModal
        isOpen={aiVideoOpen}
        onClose={() => setAiVideoOpen(false)}
        setProject={setProject}
      />

      <AIAssistantDrawer
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        project={project}
        setProject={setProject}
      />

      <CommandPalette
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onAction={handleCommandAction}
      />

      <RecordingModal
        isOpen={recordOpen}
        onClose={() => setRecordOpen(false)}
        onAddRecordedMedia={(m) => handleAddMediaClip(m)}
      />

      <ProjectManagerModal
        isOpen={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        project={project}
        setProject={setProject}
      />

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
"""
