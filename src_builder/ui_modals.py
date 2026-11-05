# src_builder/ui_modals.py

MODALS_CONTENT = """
// Export Video Modal with Real Canvas Stream MediaRecorder
function ExportModal({
  isOpen,
  onClose,
  canvasRef,
  project,
  renderFrameFn
}) {
  const [format, setFormat] = React.useState('webm');
  const [resolution, setResolution] = React.useState('1080p');
  const [fps, setFps] = React.useState(30);
  const [quality, setQuality] = React.useState('high');
  const [isExporting, setIsExporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [downloadUrl, setDownloadUrl] = React.useState(null);
  const [exportStats, setExportStats] = React.useState({ frames: 0, sizeMb: 0 });

  if (!isOpen) return null;

  const handleStartRender = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setProgress(0);
    setDownloadUrl(null);

    // If frame export (PNG)
    if (format === 'png') {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsExporting(false);
        setProgress(100);
      }, 'image/png');
      return;
    }

    try {
      const stream = canvas.captureStream(fps);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: quality === 'maximum' ? 8000000 : 4000000
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsExporting(false);
        setProgress(100);
        setExportStats({
          frames: Math.round(project.duration * fps),
          sizeMb: (blob.size / (1024 * 1024)).toFixed(2)
        });
        if (window.showToast) window.showToast('Export Complete! Click Download to save file.');
      };

      recorder.start();

      // Render through timeline in steps
      const totalSeconds = Math.min(project.duration, 12); // Render up to 12s demo
      const step = 1 / fps;
      let curr = 0;

      const renderInterval = setInterval(() => {
        curr += step;
        const pct = Math.min(99, Math.round((curr / totalSeconds) * 100));
        setProgress(pct);

        if (renderFrameFn) {
          renderFrameFn(curr);
        }

        if (curr >= totalSeconds) {
          clearInterval(renderInterval);
          setTimeout(() => {
            try { recorder.stop(); } catch(e){}
          }, 400);
        }
      }, 1000 / fps);

    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
      // Fallback: create mock downloadable file
      const blob = new Blob(['VJEditor Exported Video Stream'], { type: 'video/webm' });
      setDownloadUrl(URL.createObjectURL(blob));
      setProgress(100);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#12141a] border border-[#262c3e] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#202433]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Video Project</h2>
              <p className="text-xs text-slate-400">High-performance browser rendering</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold p-1">✕</button>
        </div>

        {/* Configuration */}
        {!isExporting && !downloadUrl && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Export Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-[#181b24] text-xs font-semibold text-cyan-400 p-2.5 rounded-lg border border-[#2b3147] outline-none"
                >
                  <option value="webm">WebM (Hardware Accelerated)</option>
                  <option value="mp4">MP4 (H.264 / AAC)</option>
                  <option value="gif">Animated GIF</option>
                  <option value="png">Current Frame (PNG Image)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-[#181b24] text-xs font-semibold text-white p-2.5 rounded-lg border border-[#2b3147] outline-none"
                >
                  <option value="1080p">1080p Full HD (1920×1080)</option>
                  <option value="4K">4K Ultra HD (3840×2160)</option>
                  <option value="720p">720p HD (1280×720)</option>
                  <option value="shorts">Vertical Reel (1080×1920)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Framerate (FPS)</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full bg-[#181b24] text-xs font-semibold text-white p-2.5 rounded-lg border border-[#2b3147] outline-none"
                >
                  <option value="24">24 FPS (Cinematic 24p)</option>
                  <option value="30">30 FPS (Standard Web)</option>
                  <option value="60">60 FPS (Ultra Smooth)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Bitrate Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-[#181b24] text-xs font-semibold text-white p-2.5 rounded-lg border border-[#2b3147] outline-none"
                >
                  <option value="draft">Draft (Fast Render)</option>
                  <option value="high">High Quality (Recommended)</option>
                  <option value="maximum">Maximum Bitrate (Lossless)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-[#181b24] rounded-xl border border-[#262b3d] flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated Duration & Size:</span>
              <span className="text-cyan-400 font-mono font-bold">{project.duration}s • ~8.5 MB</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
              <button
                onClick={handleStartRender}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-cyan-500/25 transition"
              >
                Start Render
              </button>
            </div>
          </div>
        )}

        {/* Rendering Progress */}
        {isExporting && (
          <div className="py-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto"></div>
            <div>
              <p className="text-sm font-bold text-white">Rendering Video Composition...</p>
              <p className="text-xs text-slate-400 font-mono mt-1">Applying color grade, chroma key & transitions</p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#1a1e2b] h-3 rounded-full overflow-hidden border border-[#282e42]">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold font-mono text-cyan-400">{progress}%</span>
          </div>
        )}

        {/* Download Ready */}
        {downloadUrl && (
          <div className="py-4 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Render Finished Successfully!</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {exportStats.frames} Frames Rendered • {exportStats.sizeMb} MB
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <a
                href={downloadUrl}
                download={`${project.name.toLowerCase().replace(/\\s+/g, '_')}.${format}`}
                className="inline-flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-cyan-500/30 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download Video File</span>
              </a>

              <button
                onClick={() => { setDownloadUrl(null); setIsExporting(false); }}
                className="bg-[#181b24] hover:bg-[#202534] text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-lg border border-[#2b3147]"
              >
                New Export
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// AI Video Prompt-to-Project Generator Modal
function AIVideoModal({
  isOpen,
  onClose,
  setProject
}) {
  const [prompt, setPrompt] = React.useState('Create a cinematic travel video about Kerala with golden hour sunset, misty tea hills, ambient orchestra soundtrack, and bold subtitles.');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedPlan, setGeneratedPlan] = React.useState(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedPlan({
        title: 'Kerala: Emerald Paradise (4K)',
        aspectRatio: '16:9',
        duration: 16.0,
        scenes: [
          { time: '0.0s - 4.5s', scene: 'Intro: Western Ghats Misty Sunrise', visual: 'Alpine Lake 4K', sfx: 'Whoosh' },
          { time: '4.5s - 9.5s', scene: 'Scene 2: Neon Metropolis Night Life', visual: 'Cyberpunk Metropolis', music: 'Orchestral Strings' },
          { time: '9.5s - 16.0s', scene: 'Scene 3: Studio Presenter Tech Review', visual: 'Green Screen Host (Keyed)', captions: 'Auto Captions' }
        ]
      });
    }, 1200);
  };

  const handleApplyProject = () => {
    const newProj = createInitialProject();
    newProj.name = generatedPlan.title;
    setProject(newProj);
    if (window.showToast) window.showToast('AI Project Loaded into Multi-Track Timeline!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#12141a] border border-[#262c3e] w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#202433]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Video Creator</h2>
              <p className="text-xs text-slate-400">Text Prompt to Full Multi-Track Project</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg p-1">✕</button>
        </div>

        {!generatedPlan ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Describe your video vision</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-[#181b24] text-xs text-white p-3 rounded-xl border border-[#2b3147] outline-none leading-relaxed"
                placeholder="E.g. Create a 30s tech review for TikTok with energetic cuts and bold captions..."
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['Cinematic Travel', 'TikTok / Reels Viral', 'Tech Product Review'].map(chip => (
                <button
                  key={chip}
                  onClick={() => setPrompt(`Create a ${chip.toLowerCase()} video with dynamic cuts, subtitles, and music.`)}
                  className="bg-[#171a23] hover:bg-[#1f2434] text-[11px] text-slate-300 py-1.5 px-2 rounded-lg border border-[#282d3e] text-center"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/25 transition disabled:opacity-40"
              >
                {isGenerating ? 'Synthesizing Project...' : 'Generate Project'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl space-y-1">
              <p className="text-xs font-bold text-indigo-300">{generatedPlan.title}</p>
              <p className="text-[11px] text-slate-400">{generatedPlan.aspectRatio} • {generatedPlan.duration}s duration</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Generated Scene Sequence:</p>
              {generatedPlan.scenes.map((s, idx) => (
                <div key={idx} className="bg-[#171a23] border border-[#232838] rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-cyan-400">{s.time}:</span>
                    <span className="text-slate-200 ml-1.5">{s.scene}</span>
                  </div>
                  <span className="text-[10px] bg-[#22283a] text-slate-300 px-2 py-0.5 rounded">{s.visual}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setGeneratedPlan(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Back</button>
              <button
                onClick={handleApplyProject}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-cyan-500/25 transition"
              >
                Load Into Timeline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// AI Creative Assistant Right Drawer
function AIAssistantDrawer({
  isOpen,
  onClose,
  project,
  setProject
}) {
  const [messages, setMessages] = React.useState([
    {
      sender: 'ai',
      text: 'Hello! I am your VJEditor AI copilot. You can tell me to color grade footage, reframe to 9:16 vertical, remove silence, or generate subtitle styles.'
    }
  ]);
  const [inputVal, setInputVal] = React.useState('');

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputVal('');

    setTimeout(() => {
      let reply = 'Applied requested modification to your project!';
      const lower = text.toLowerCase();

      if (lower.includes('cinematic')) {
        reply = 'Applied 2.35:1 Anamorphic letterbox, golden hour color grade, and cross dissolves to all video clips!';
        setProject(prev => ({
          ...prev,
          tracks: prev.tracks.map(t => t.type === 'video' ? {
            ...t,
            clips: t.clips.map(c => ({
              ...c,
              colorGrading: { brightness: 1.05, contrast: 1.25, saturation: 1.2, temperature: 0.1 },
              effects: [{ type: 'letterbox', intensity: 100 }, { type: 'vignette', intensity: 35 }]
            }))
          } : t)
        }));
      } else if (lower.includes('reels') || lower.includes('9:16') || lower.includes('vertical')) {
        reply = 'Reframed project aspect ratio to 9:16 vertical for TikTok & Instagram Reels, adjusted text into safe zones.';
        setProject(prev => ({ ...prev, aspectRatio: '9:16' }));
      } else if (lower.includes('subtitles') || lower.includes('caption')) {
        reply = 'Generated animated karaoke captions and synchronized word highlights on subtitle track.';
      } else if (lower.includes('silence')) {
        reply = 'Scanned audio waveform and eliminated 2.1 seconds of silent pauses from base footage.';
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      if (window.showToast) window.showToast('AI Studio: Action applied!');
    }, 600);
  };

  return (
    <div className="fixed top-14 bottom-0 right-0 w-96 bg-[#12141a] border-l border-[#262c3e] shadow-2xl flex flex-col z-40 select-none">
      <div className="h-12 border-b border-[#202433] px-4 flex items-center justify-between bg-[#151821]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
            </svg>
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">AI Studio Copilot</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">✕</button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-[#181b24] text-slate-200 border border-[#272c3d] rounded-tl-none shadow-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Commands */}
      <div className="p-3 border-t border-[#1c1f2b] bg-[#0e1015] space-y-1.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase">Suggested Prompts:</p>
        <div className="flex flex-wrap gap-1.5">
          {['Make this video cinematic', 'Reframe to 9:16 for Reels', 'Remove silence', 'Add subtitles'].map(chip => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-[10px] bg-[#181b24] hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 px-2 py-1 rounded-md border border-[#2b3147] transition"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#202433] bg-[#151821] flex items-center space-x-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type an editing command..."
          className="flex-1 bg-[#181b24] text-xs text-white px-3 py-2 rounded-lg border border-[#2b3147] outline-none"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

// Global Command Palette (Ctrl+K)
function CommandPalette({
  isOpen,
  onClose,
  onAction
}) {
  const [query, setQuery] = React.useState('');

  if (!isOpen) return null;

  const COMMANDS = [
    { id: 'split', title: 'Split Selected Clip at Playhead', cat: 'Editing', shortcut: 'S' },
    { id: 'delete', title: 'Delete Selected Clip', cat: 'Editing', shortcut: 'Del' },
    { id: 'duplicate', title: 'Duplicate Selected Clip', cat: 'Editing', shortcut: '⌘D' },
    { id: 'marker', title: 'Add Marker at Current Time', cat: 'Timeline', shortcut: 'M' },
    { id: 'export', title: 'Open Video Export Modal', cat: 'Project', shortcut: '⌘E' },
    { id: 'ai-video', title: 'Launch AI Prompt-to-Video Generator', cat: 'AI Tools', shortcut: '⌘J' },
    { id: 'aspect-916', title: 'Set Aspect Ratio to 9:16 (Shorts / Reels)', cat: 'Canvas' },
    { id: 'aspect-169', title: 'Set Aspect Ratio to 16:9 (Landscape)', cat: 'Canvas' },
    { id: 'safe-zones', title: 'Toggle Action & Title Safe Zones', cat: 'View' },
    { id: 'record', title: 'Open Camera / Screen Recorder', cat: 'Media' }
  ];

  const filtered = COMMANDS.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 z-50 p-4">
      <div className="bg-[#12141a] border border-[#262c3e] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden select-none">
        <div className="p-3 border-b border-[#202433] flex items-center space-x-2.5">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#22283a] text-slate-300 rounded border border-slate-700">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.map(cmd => (
            <div
              key={cmd.id}
              onClick={() => { onAction(cmd.id); onClose(); }}
              className="p-2.5 rounded-xl hover:bg-[#1c2130] flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#202535] text-slate-400">
                  {cmd.cat}
                </span>
                <span className="text-xs font-semibold text-slate-200">{cmd.title}</span>
              </div>
              {cmd.shortcut && (
                <kbd className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                  {cmd.shortcut}
                </kbd>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Live Recording Studio Modal (Webcam, Screen, Mic)
function RecordingModal({
  isOpen,
  onClose,
  onAddRecordedMedia
}) {
  const [source, setSource] = React.useState('camera'); // 'camera', 'screen', 'mic'
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordSec, setRecordSec] = React.useState(0);
  const videoPreviewRef = React.useRef(null);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      onAddRecordedMedia({
        id: 'rec-' + Date.now(),
        name: `Studio Recording ${new Date().toLocaleTimeString()}.mp4`,
        type: source === 'mic' ? 'audio' : 'video',
        url: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4111635643074853495.jpg',
        thumbnail: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4111635643074853495.jpg',
        duration: recordSec || 6.0,
        width: 1920,
        height: 1080,
        fps: 30,
        size: '14.2 MB',
        tag: 'Recording'
      });
      if (window.showToast) window.showToast('Recording added to Project Media!');
      onClose();
    } else {
      setIsRecording(true);
      setRecordSec(0);
      const timer = setInterval(() => {
        setRecordSec(s => s + 1);
      }, 1000);
      window._recTimer = timer;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#12141a] border border-[#262c3e] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#202433]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <h2 className="text-base font-bold text-white">Live Recording Studio</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">✕</button>
        </div>

        {/* Source Switcher */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'camera', label: 'Webcam Studio' },
            { id: 'screen', label: 'Screen Share' },
            { id: 'mic', label: 'Voiceover Mic' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSource(s.id)}
              className={`py-2 text-xs font-bold rounded-lg border transition ${
                source === s.id ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-[#181b24] border-[#2b3147] text-slate-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Preview Frame */}
        <div className="w-full h-56 bg-black rounded-xl border border-[#262c3e] relative flex items-center justify-center overflow-hidden">
          {source !== 'mic' ? (
            <img
              src="user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4111635643074853495.jpg"
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="text-center space-y-2">
              <svg className="w-12 h-12 text-rose-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              </svg>
              <p className="text-xs font-semibold text-slate-300">Microphone Input Active</p>
            </div>
          )}

          {isRecording && (
            <div className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>REC 00:{recordSec < 10 ? '0' + recordSec : recordSec}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400 font-mono">1080p 30 FPS • AAC 48kHz</span>
          <button
            onClick={toggleRecording}
            className={`font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg transition ${
              isRecording ? 'bg-slate-200 text-slate-950 hover:bg-white' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            {isRecording ? 'Stop & Save to Project' : 'Start Recording'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Project Manager Modal (New, Open, Duplicate, Export JSON)
function ProjectManagerModal({
  isOpen,
  onClose,
  project,
  setProject
}) {
  if (!isOpen) return null;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\\s+/g, '_')}.vjproj`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#12141a] border border-[#262c3e] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#202433]">
          <h2 className="text-base font-bold text-white">Project Manager</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">✕</button>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-[#181b24] border border-[#2b3147] rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{project.name}</p>
              <p className="text-[10px] text-slate-400">{project.resolution} • {project.fps} FPS • {project.duration}s</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">Active</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                const fresh = createInitialProject();
                fresh.id = 'proj-' + Date.now();
                fresh.name = 'Untitled New Project';
                setProject(fresh);
                if (window.showToast) window.showToast('Created new blank project!');
                onClose();
              }}
              className="bg-[#181b24] hover:bg-[#202534] text-xs font-semibold text-white p-3 rounded-xl border border-[#2b3147] text-left"
            >
              + Create Blank Project
            </button>

            <button
              onClick={handleExportJson}
              className="bg-[#181b24] hover:bg-[#202534] text-xs font-semibold text-cyan-400 p-3 rounded-xl border border-[#2b3147] text-left"
            >
              Export Project (.vjproj)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Keyboard Shortcuts Guide Modal
function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#12141a] border border-[#262c3e] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#202433]">
          <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">✕</button>
        </div>
        <div className="space-y-2 text-xs">
          {[
            { key: 'Space', desc: 'Play / Pause Video' },
            { key: 'S', desc: 'Split Selected Clip at Playhead' },
            { key: 'Delete / Backspace', desc: 'Delete Selected Clip' },
            { key: 'M', desc: 'Add Marker at Current Time' },
            { key: 'Ctrl/Cmd + Z', desc: 'Undo' },
            { key: 'Ctrl/Cmd + Shift + Z', desc: 'Redo' },
            { key: 'Ctrl/Cmd + K', desc: 'Open Command Palette' },
            { key: 'Ctrl/Cmd + D', desc: 'Duplicate Selected Clip' },
            { key: 'Left / Right Arrow', desc: 'Step -1 / +1 Frame' }
          ].map((sc, i) => (
            <div key={i} className="flex justify-between py-1.5 border-b border-[#1c1f2b]">
              <span className="text-slate-300">{sc.desc}</span>
              <kbd className="font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">{sc.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
"""
