# src_builder/ui_sidebar.py

SIDEBAR_CONTENT = """
// Left Sidebar with 13 Professional Tabs
const SIDEBAR_TABS = [
  { id: 'media', label: 'Media', icon: 'FolderOpen' },
  { id: 'audio', label: 'Audio', icon: 'Music' },
  { id: 'text', label: 'Text', icon: 'Type' },
  { id: 'stickers', label: 'Stickers', icon: 'Smile' },
  { id: 'effects', label: 'Effects', icon: 'Sparkles' },
  { id: 'transitions', label: 'Transitions', icon: 'Layers' },
  { id: 'filters', label: 'Filters', icon: 'Sliders' },
  { id: 'templates', label: 'Templates', icon: 'LayoutTemplate' },
  { id: 'ai', label: 'AI Tools', icon: 'Cpu' },
  { id: 'captions', label: 'Captions', icon: 'Subtitles' },
  { id: 'elements', label: 'Elements', icon: 'Shapes' },
  { id: 'stock', label: 'Stock', icon: 'Film' },
  { id: 'brand', label: 'Brand Kit', icon: 'Crown' }
];

function SidebarTabIcon({ id, active }) {
  const color = active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200';
  if (id === 'media') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
      </svg>
    );
  }
  if (id === 'audio') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    );
  }
  if (id === 'text') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 7 4 4 20 4 20 7"></polyline>
        <line x1="9" y1="20" x2="15" y2="20"></line>
        <line x1="12" y1="4" x2="12" y2="20"></line>
      </svg>
    );
  }
  if (id === 'stickers') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    );
  }
  if (id === 'effects') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      </svg>
    );
  }
  if (id === 'transitions') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    );
  }
  if (id === 'filters') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="21" x2="4" y2="14"></line>
        <line x1="4" y1="10" x2="4" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="3"></line>
        <line x1="20" y1="21" x2="20" y2="16"></line>
        <line x1="20" y1="12" x2="20" y2="3"></line>
        <line x1="1" y1="14" x2="7" y2="14"></line>
        <line x1="9" y1="8" x2="15" y2="8"></line>
        <line x1="17" y1="16" x2="23" y2="16"></line>
      </svg>
    );
  }
  if (id === 'templates') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M3 9h18"></path>
        <path d="M9 21V9"></path>
      </svg>
    );
  }
  if (id === 'ai') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="16" height="16" x="4" y="4" rx="2"></rect>
        <rect width="6" height="6" x="9" y="9" rx="1"></rect>
        <path d="M15 2v2"></path>
        <path d="M15 20v2"></path>
        <path d="M2 15h2"></path>
        <path d="M2 9h2"></path>
        <path d="M20 15h2"></path>
        <path d="M20 9h2"></path>
        <path d="M9 2v2"></path>
        <path d="M9 20v2"></path>
      </svg>
    );
  }
  if (id === 'captions') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="14" x="2" y="5" rx="2"></rect>
        <line x1="6" y1="12" x2="10" y2="12"></line>
        <line x1="14" y1="12" x2="18" y2="12"></line>
      </svg>
    );
  }
  if (id === 'elements') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8.3 10a.7.7 0 0 1-.626-.379L5.347 5.25A.7.7 0 0 1 5.973 4.25h4.693a.7.7 0 0 1 .626 1l-2.327 4.371a.7.7 0 0 1-.665.379z"></path>
        <rect width="7" height="7" x="14" y="14" rx="1"></rect>
        <circle cx="8" cy="17.5" r="3.5"></circle>
      </svg>
    );
  }
  if (id === 'stock') {
    return (
      <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"></rect>
        <line x1="7" y1="2" x2="7" y2="22"></line>
        <line x1="17" y1="2" x2="17" y2="22"></line>
        <line x1="2" y1="12" x2="22" y2="12"></line>
      </svg>
    );
  }
  return (
    <svg className={`w-5 h-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
    </svg>
  );
}

function Sidebar({
  activeTab,
  setActiveTab,
  project,
  setProject,
  onAddMediaClip,
  onAddTextClip,
  onAddStickerClip,
  onAddAudioClip,
  onAddCaptionClip,
  onApplyTemplate,
  onOpenRecord,
  onOpenAIVideoModal,
  selectedClip
}) {
  const [mediaList, setMediaList] = React.useState(DEFAULT_MEDIA);
  const [audioCategory, setAudioCategory] = React.useState('All');
  const [audioPlayingId, setAudioPlayingId] = React.useState(null);
  const fileInputRef = React.useRef(null);

  // File Upload Handler (video, audio, image)
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const newMedia = {
        id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: file.name,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        url: url,
        thumbnail: url,
        duration: isVideo ? 10.0 : isAudio ? 15.0 : 5.0,
        width: 1920,
        height: 1080,
        fps: 30,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        tag: 'User Upload'
      };
      setMediaList(prev => [newMedia, ...prev]);
    });
  };

  // Sound Preview Player
  const toggleAudioPreview = (item, isMusic = true) => {
    if (audioPlayingId === item.id) {
      audioEngine.stopMusic();
      setAudioPlayingId(null);
    } else {
      audioEngine.stopMusic();
      setAudioPlayingId(item.id);
      if (isMusic) {
        audioEngine.startMusicLoop(item.category.toLowerCase(), 0.6);
      } else {
        audioEngine.playSFX(item.id.replace('sfx-', ''), 0.8);
      }
    }
  };

  return (
    <div className="flex h-full bg-[#12141a] border-r border-[#202433] select-none z-20">
      {/* Tab Nav Column */}
      <div className="w-18 bg-[#0e1015] border-r border-[#1c1f2b] flex flex-col items-center py-3 space-y-1 overflow-y-auto">
        {SIDEBAR_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-14 h-13 rounded-xl flex flex-col items-center justify-center transition group relative ${
                isActive ? 'bg-[#1e2332] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#151821]'
              }`}
              title={tab.label}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full"></div>
              )}
              <SidebarTabIcon id={tab.id} active={isActive} />
              <span className={`text-[10px] font-medium mt-1 tracking-tight ${isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="w-80 bg-[#12141a] flex flex-col h-full border-r border-[#202433] overflow-hidden">
        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Media Assets</h2>
              <span className="text-xs text-slate-400 font-medium">{mediaList.length} items</span>
            </div>

            {/* Upload & Record Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="flex items-center justify-center space-x-1.5 bg-[#1b1f2d] hover:bg-[#24293c] text-white font-medium text-xs py-2.5 px-3 rounded-lg border border-[#2b3147] transition shadow-sm"
              >
                <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Import Files</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={onOpenRecord}
                className="flex items-center justify-center space-x-1.5 bg-[#1b1f2d] hover:bg-[#24293c] text-rose-300 font-medium text-xs py-2.5 px-3 rounded-lg border border-rose-900/30 transition shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Record Studio</span>
              </button>
            </div>

            {/* Media Items List */}
            <div className="space-y-3 pt-1">
              {mediaList.map((media) => (
                <div
                  key={media.id}
                  className="bg-[#171a23] hover:bg-[#1d212d] border border-[#232838] hover:border-cyan-500/50 rounded-xl p-2.5 flex items-center space-x-3 transition group cursor-pointer shadow-sm"
                  onClick={() => onAddMediaClip(media)}
                >
                  <div className="w-20 h-14 bg-slate-900 rounded-lg overflow-hidden relative flex-shrink-0 border border-slate-800">
                    <img src={media.thumbnail} alt={media.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 font-mono text-white px-1 rounded">
                      {media.duration}s
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-400 transition">
                      {media.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-[#202535] text-slate-300 font-medium">{media.tag}</span>
                      <span>{media.fps} FPS</span>
                      <span>{media.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddMediaClip(media); }}
                    className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                    title="Insert to Timeline"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIO TAB */}
        {activeTab === 'audio' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Audio Library</h2>
              <span className="text-xs text-slate-400">10 Genres & SFX</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1">
              {['All', 'Cinematic', 'Lo-fi', 'Travel', 'Vlog', 'SFX'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setAudioCategory(cat)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                    audioCategory === cat ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-[#1b1f2d] text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Music Tracks */}
            {audioCategory !== 'SFX' && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Royalty-Free Music</p>
                {MUSIC_LIBRARY.filter(m => audioCategory === 'All' || m.category === audioCategory).map((track) => (
                  <div
                    key={track.id}
                    className="bg-[#171a23] hover:bg-[#1d212d] border border-[#232838] rounded-xl p-2.5 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <button
                        onClick={() => toggleAudioPreview(track, true)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                          audioPlayingId === track.id ? 'bg-cyan-500 text-slate-950' : 'bg-[#22283a] text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400'
                        }`}
                      >
                        {audioPlayingId === track.id ? (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{track.name}</p>
                        <p className="text-[10px] text-slate-400">{track.category} • {track.bpm} BPM • {track.duration}s</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onAddAudioClip(track, 'music')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold px-2 py-1 rounded hover:bg-cyan-950/50"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SFX Tracks */}
            {(audioCategory === 'All' || audioCategory === 'SFX') && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cinematic Sound Effects</p>
                {SFX_LIBRARY.map((sfx) => (
                  <div
                    key={sfx.id}
                    className="bg-[#171a23] hover:bg-[#1d212d] border border-[#232838] rounded-xl p-2.5 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <button
                        onClick={() => toggleAudioPreview(sfx, false)}
                        className="w-8 h-8 rounded-lg bg-[#22283a] text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center transition"
                      >
                        <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </button>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{sfx.name}</p>
                        <p className="text-[10px] text-slate-400">{sfx.category} • {sfx.duration}s</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onAddAudioClip(sfx, 'sfx')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold px-2 py-1 rounded hover:bg-amber-950/50"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Text & Titles</h2>
              <span className="text-xs text-cyan-400 font-semibold">Motion Titles</span>
            </div>

            <div className="space-y-3">
              {TEXT_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onAddTextClip(preset)}
                  className="bg-[#171a23] hover:bg-[#1d212d] border border-[#232838] hover:border-cyan-500/50 rounded-xl p-3.5 cursor-pointer transition group shadow-sm"
                >
                  <div className="h-12 bg-black/40 rounded-lg flex items-center justify-center mb-2 px-2 overflow-hidden">
                    <span style={{ fontFamily: preset.font, color: preset.color, fontWeight: preset.weight }} className="text-base truncate">
                      {preset.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">{preset.font} • {preset.anim}</span>
                    <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">+ Insert</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STICKERS TAB */}
        {activeTab === 'stickers' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Motion Stickers & Badges</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {STICKERS_LIBRARY.map((stk) => (
                <button
                  key={stk.id}
                  onClick={() => onAddStickerClip(stk)}
                  className="bg-[#171a23] hover:bg-[#1f2434] border border-[#232838] rounded-xl p-3 flex flex-col items-center justify-center space-y-1.5 transition group hover:border-cyan-500/40"
                >
                  <span className="text-3xl transform group-hover:scale-110 transition">{stk.emoji || '★'}</span>
                  <span className="text-[10px] font-semibold text-slate-300 text-center">{stk.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EFFECTS TAB */}
        {activeTab === 'effects' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Video Effects</h2>
              <span className="text-xs text-slate-400">Cinematic & Glitch</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {EFFECTS_LIBRARY.map((eff) => (
                <div
                  key={eff.id}
                  onClick={() => {
                    if (selectedClip && selectedClip.type === 'video') {
                      setProject(prev => {
                        const newTracks = prev.tracks.map(t => ({
                          ...t,
                          clips: t.clips.map(c => c.id === selectedClip.id ? {
                            ...c,
                            effects: [...(c.effects || []), { type: eff.id, intensity: eff.intensity }]
                          } : c)
                        }));
                        return { ...prev, tracks: newTracks };
                      });
                    }
                  }}
                  className="bg-[#171a23] hover:bg-[#1f2434] border border-[#232838] hover:border-indigo-500/40 rounded-xl p-3 flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-200">{eff.name}</span>
                  <span className="text-[9px] text-slate-400 uppercase">{eff.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSITIONS TAB */}
        {activeTab === 'transitions' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Transitions Library</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {TRANSITIONS_LIBRARY.map((trans) => (
                <div
                  key={trans.id}
                  onClick={() => {
                    if (selectedClip && selectedClip.type === 'video') {
                      setProject(prev => {
                        const newTracks = prev.tracks.map(t => ({
                          ...t,
                          clips: t.clips.map(c => c.id === selectedClip.id ? {
                            ...c,
                            transitionOut: { type: trans.id, duration: trans.duration }
                          } : c)
                        }));
                        return { ...prev, tracks: newTracks };
                      });
                    }
                  }}
                  className="bg-[#171a23] hover:bg-[#1f2434] border border-[#232838] hover:border-cyan-500/40 rounded-xl p-3 flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-200">{trans.name}</span>
                  <span className="text-[9px] text-slate-400">{trans.duration}s • {trans.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FILTERS TAB */}
        {activeTab === 'filters' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Color Grading Filters</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {FILTERS_LIBRARY.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    if (selectedClip && selectedClip.type === 'video') {
                      setProject(prev => {
                        const newTracks = prev.tracks.map(t => ({
                          ...t,
                          clips: t.clips.map(c => c.id === selectedClip.id ? {
                            ...c,
                            colorGrading: {
                              brightness: f.brightness,
                              contrast: f.contrast,
                              saturation: f.saturation,
                              temperature: f.temp === 'warm' ? 0.12 : f.temp === 'cool' ? -0.15 : 0
                            }
                          } : c)
                        }));
                        return { ...prev, tracks: newTracks };
                      });
                    }
                  }}
                  className="bg-[#171a23] hover:bg-[#1f2434] border border-[#232838] hover:border-amber-500/40 rounded-xl p-3 flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition text-center"
                >
                  <div className="w-full h-12 rounded-lg bg-gradient-to-r from-teal-900 via-amber-900 to-indigo-900 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white px-1 shadow">{f.category}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-200 truncate w-full">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Project Templates</h2>
              <span className="text-xs text-slate-400">Multi-Track</span>
            </div>
            <div className="space-y-3">
              {PROJECT_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-[#171a23] border border-[#232838] rounded-xl p-3.5 flex flex-col space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{tpl.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                      {tpl.aspectRatio}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tpl.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">{tpl.duration}s • {tpl.placeholders} Placeholders</span>
                    <button
                      onClick={() => onApplyTemplate(tpl)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                    >
                      Apply Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI TOOLS TAB */}
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">AI Creation Suite</h2>
              <span className="text-xs font-bold text-indigo-400">Neural Studio</span>
            </div>

            {/* AI Video Gen Trigger */}
            <div
              onClick={onOpenAIVideoModal}
              className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-indigo-700/50 hover:border-indigo-400 rounded-xl p-3.5 cursor-pointer transition shadow-md group"
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <span className="text-xs font-bold text-white group-hover:text-indigo-300">Prompt-to-Video Generator</span>
              </div>
              <p className="text-[11px] text-slate-300">Enter a prompt like "Cinematic travel video about Kerala" to auto-build full scenes, captions, audio, and transitions.</p>
            </div>

            {/* Other AI Workflows */}
            <div className="space-y-2">
              {[
                { title: 'AI Auto-Edit & Silence Removal', desc: 'Auto-cuts dead air and aligns cuts to music beat drops.', action: 'auto-cut' },
                { title: 'AI Script & Scene Planner', desc: 'Generates formatted YouTube/Shorts video scripts with voiceover.', action: 'script' },
                { title: 'AI Highlight Reel (15s/30s/60s)', desc: 'Extracts the most engaging moments into viral vertical clips.', action: 'highlight' },
                { title: 'AI Face & Object Tracking Blur', desc: 'Detects and tracks faces to apply Gaussian/Mosaic pixelation.', action: 'tracking' },
                { title: 'AI Neural Voiceover (TTS)', desc: 'Converts text into studio-grade voiceover audio on timeline.', action: 'tts' }
              ].map((tool, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (tool.action === 'auto-cut') {
                      if (window.showToast) window.showToast('AI Auto-Edit: Removed 2.4s of silence & synced cuts to beats!');
                    } else if (tool.action === 'tts') {
                      onAddCaptionClip('Welcome to the next generation of video editing.');
                    } else {
                      onOpenAIVideoModal();
                    }
                  }}
                  className="bg-[#171a23] hover:bg-[#1d212d] border border-[#232838] rounded-xl p-3 cursor-pointer transition"
                >
                  <p className="text-xs font-semibold text-slate-200">{tool.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAPTIONS TAB */}
        {activeTab === 'captions' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Auto Captions & Subtitles</h2>
            <button
              onClick={() => {
                onAddCaptionClip('Experience the majestic landscapes of India in 4K.');
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition shadow-md shadow-cyan-500/20"
            >
              + Generate Automatic Captions
            </button>

            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Caption Styles</p>
              {['Karaoke Pop Highlight', 'Bold Social Media Pill', 'Minimalist Clean Bar', 'Cinematic Anamorphic'].map((style, idx) => (
                <div
                  key={idx}
                  className="bg-[#171a23] hover:bg-[#1f2434] border border-[#232838] rounded-xl p-3 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs text-slate-200 font-medium">{style}</span>
                  <span className="text-xs text-cyan-400 font-bold">Select</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ELEMENTS TAB */}
        {activeTab === 'elements' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Shapes & Vectors</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {SHAPES_LIBRARY.map((sh) => (
                <button
                  key={sh.id}
                  onClick={() => onAddTextClip({ name: sh.name, font: 'Inter', color: sh.fill, anim: 'pop' })}
                  className="bg-[#171a23] hover:bg-[#1f2434] border border-[#232838] rounded-xl p-3 flex flex-col items-center justify-center space-y-1.5 transition"
                >
                  <div className="w-8 h-8 rounded border border-cyan-400/50 bg-cyan-950/40 flex items-center justify-center text-cyan-400">
                    ▲
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300">{sh.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Curated Stock Library</h2>
            <div className="space-y-2.5">
              {DEFAULT_MEDIA.map(m => (
                <div key={m.id} className="bg-[#171a23] border border-[#232838] rounded-xl p-2.5 flex items-center space-x-3">
                  <img src={m.thumbnail} className="w-16 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.width}x{m.height} • 4K HDR</p>
                  </div>
                  <button onClick={() => onAddMediaClip(m)} className="text-xs text-cyan-400 font-bold px-2 py-1">+ Use</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRAND KIT TAB */}
        {activeTab === 'brand' && (
          <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Brand Kit & Watermark</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Watermark Overlay Text / Logo</label>
                <input
                  type="text"
                  value={project.brandKit.logoName}
                  onChange={(e) => setProject(prev => ({
                    ...prev,
                    brandKit: { ...prev.brandKit, logoName: e.target.value }
                  }))}
                  className="w-full bg-[#181b24] text-xs text-white px-3 py-2 rounded-lg border border-[#2b3147] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Watermark Position</label>
                <select
                  value={project.brandKit.watermarkPosition}
                  onChange={(e) => setProject(prev => ({
                    ...prev,
                    brandKit: { ...prev.brandKit, watermarkPosition: e.target.value }
                  }))}
                  className="w-full bg-[#181b24] text-xs text-white px-3 py-2 rounded-lg border border-[#2b3147] outline-none"
                >
                  <option value="top-right">Top Right</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-300 font-medium">Enable Watermark</span>
                <input
                  type="checkbox"
                  checked={project.brandKit.watermarkEnabled}
                  onChange={(e) => setProject(prev => ({
                    ...prev,
                    brandKit: { ...prev.brandKit, watermarkEnabled: e.target.checked }
                  }))}
                  className="w-4 h-4 accent-cyan-500 rounded"
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
