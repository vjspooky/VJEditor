# src_builder/ui_header.py

HEADER_CONTENT = """
// Top Toolbar Component
function TopToolbar({
  project,
  setProject,
  undo,
  redo,
  canUndo,
  canRedo,
  autosaveStatus,
  onOpenExport,
  onOpenAIStudio,
  onOpenCommandBar,
  onOpenProjects,
  onOpenRecord,
  onOpenShortcuts,
  onOpenSettings
}) {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameVal, setNameVal] = React.useState(project.name);

  React.useEffect(() => {
    setNameVal(project.name);
  }, [project.name]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameVal.trim() && nameVal !== project.name) {
      setProject(prev => ({ ...prev, name: nameVal.trim() }));
    }
  };

  return (
    <header className="h-14 bg-[#111319] border-b border-[#202433] px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Project Name */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onOpenProjects}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                VJEditor
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                Studio AI
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-[#262b3d]"></div>

        {/* Project Name Editable */}
        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              autoFocus
              className="bg-[#181b24] text-sm font-medium text-white px-2.5 py-1 rounded border border-cyan-500 outline-none w-64"
            />
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="flex items-center space-x-1.5 text-sm font-medium text-slate-200 hover:text-white px-2 py-1 rounded hover:bg-[#1a1e2b] cursor-pointer transition"
              title="Click to rename project"
            >
              <span className="max-w-[220px] truncate">{project.name}</span>
              <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
          )}

          {/* Autosave status indicator */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 pl-2">
            <span className={`w-2 h-2 rounded-full ${autosaveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            <span className="text-[11px] font-medium text-slate-400">
              {autosaveStatus === 'saving' ? 'Saving...' : 'Saved'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Operations: Undo, Redo, Command Palette */}
      <div className="flex items-center space-x-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-lg flex items-center justify-center transition ${canUndo ? 'text-slate-300 hover:text-white hover:bg-[#1e2230]' : 'text-slate-600 cursor-not-allowed'}`}
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-lg flex items-center justify-center transition ${canRedo ? 'text-slate-300 hover:text-white hover:bg-[#1e2230]' : 'text-slate-600 cursor-not-allowed'}`}
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>

        <div className="h-5 w-px bg-[#262b3d]"></div>

        {/* Global Command Bar Shortcut */}
        <button
          onClick={onOpenCommandBar}
          className="flex items-center space-x-2 bg-[#171a23] hover:bg-[#1e2330] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-[#272c3d] text-xs font-medium transition shadow-sm"
          title="Global Search & Quick Actions"
        >
          <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Command Palette</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#232838] text-slate-300 rounded font-mono border border-slate-700">⌘K</kbd>
        </button>
      </div>

      {/* Right Controls: AI Assistant, Record, Projects, Export */}
      <div className="flex items-center space-x-3">
        {/* Record studio button */}
        <button
          onClick={onOpenRecord}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#181b24] hover:bg-[#202534] text-rose-400 border border-rose-900/30 transition shadow-sm"
          title="Record Webcam, Screen, or Mic"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Record</span>
        </button>

        {/* AI Assistant Drawer Trigger */}
        <button
          onClick={onOpenAIStudio}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-950 to-purple-950 text-indigo-300 hover:text-white border border-indigo-700/50 hover:border-indigo-500 transition shadow-sm shadow-indigo-950/50"
          title="Open AI Creative Assistant (Auto Edit, Voiceover, Color grade)"
        >
          <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
          </svg>
          <span>AI Studio</span>
        </button>

        {/* Project Switcher */}
        <button
          onClick={onOpenProjects}
          className="p-2 text-slate-400 hover:text-white hover:bg-[#1a1e2b] rounded-lg transition"
          title="Manage Projects"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 text-slate-400 hover:text-white hover:bg-[#1a1e2b] rounded-lg transition"
          title="Keyboard Shortcuts"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-cyan-500/25 transition transform active:scale-95"
          title="Render & Download Video"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
}
"""
