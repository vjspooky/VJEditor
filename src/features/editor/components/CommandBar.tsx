import { useEditor } from '@/features/editor/EditorProvider';
import {
  Clapperboard,
  Copy,
  Download,
  FolderOpen,
  Image,
  Magnet,
  Mic2,
  Play,
  Redo2,
  Save,
  Scissors,
  Search,
  Sparkles,
  Subtitles,
  Trash2,
  Type,
  Undo2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  icon: typeof Sparkles;
  action: () => void;
}

export function CommandBar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, dispatch, save } = useEditor();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = useMemo<CommandItem[]>(() => {
    return [
      {
        id: 'split',
        label: 'Split Clip at Playhead',
        category: 'Editing',
        shortcut: 'S',
        icon: Scissors,
        action: () => {
          if (state.ui.splitAllTracks) dispatch({ type: 'split-all-at-playhead' });
          else dispatch({ type: 'split-selected' });
        },
      },
      {
        id: 'play',
        label: state.ui.isPlaying ? 'Pause Timeline' : 'Play Timeline',
        category: 'Playback',
        shortcut: 'Space',
        icon: Play,
        action: () => dispatch({ type: 'toggle-play' }),
      },
      {
        id: 'undo',
        label: 'Undo Action',
        category: 'History',
        shortcut: '⌘Z',
        icon: Undo2,
        action: () => dispatch({ type: 'undo' }),
      },
      {
        id: 'redo',
        label: 'Redo Action',
        category: 'History',
        shortcut: '⌘⇧Z',
        icon: Redo2,
        action: () => dispatch({ type: 'redo' }),
      },
      {
        id: 'duplicate',
        label: 'Duplicate Selected Clip',
        category: 'Editing',
        shortcut: '⌘D',
        icon: Copy,
        action: () => dispatch({ type: 'duplicate-selected' }),
      },
      {
        id: 'delete',
        label: 'Delete Selected Clip',
        category: 'Editing',
        shortcut: 'Del',
        icon: Trash2,
        action: () => dispatch({ type: 'delete-selected' }),
      },
      {
        id: 'ai-studio',
        label: 'Open AI Studio',
        category: 'AI Tools',
        shortcut: 'AI',
        icon: Sparkles,
        action: () => dispatch({ type: 'set-panel', panel: 'ai' }),
      },
      {
        id: 'auto-captions',
        label: 'Generate Auto Captions',
        category: 'AI Tools',
        icon: Subtitles,
        action: () => {
          dispatch({ type: 'add-caption' });
          dispatch({ type: 'set-panel', panel: 'captions' });
        },
      },
      {
        id: 'ai-voice',
        label: 'Synthesize AI Voiceover (TTS)',
        category: 'AI Tools',
        icon: Mic2,
        action: () => dispatch({ type: 'set-panel', panel: 'audio' }),
      },
      {
        id: 'add-text',
        label: 'Add Dynamic Text Layer',
        category: 'Text',
        icon: Type,
        action: () => {
          dispatch({ type: 'add-text' });
          dispatch({ type: 'set-panel', panel: 'text' });
        },
      },
      {
        id: 'add-video-track',
        label: 'Add Video Track (V)',
        category: 'Timeline',
        icon: Image,
        action: () => dispatch({ type: 'add-track', kind: 'video' }),
      },
      {
        id: 'add-audio-track',
        label: 'Add Audio Track (A)',
        category: 'Timeline',
        icon: Mic2,
        action: () => dispatch({ type: 'add-track', kind: 'audio' }),
      },
      {
        id: 'toggle-snap',
        label: 'Toggle Timeline Snap',
        category: 'Timeline',
        icon: Magnet,
        action: () => dispatch({ type: 'toggle-frame-snap' }),
      },
      {
        id: 'save',
        label: 'Save Project',
        category: 'Project',
        shortcut: '⌘S',
        icon: Save,
        action: () => save(),
      },
      {
        id: 'export',
        label: 'Export Video (MP4 / WebM)',
        category: 'Project',
        shortcut: 'Export',
        icon: Download,
        action: () => {
          const exportBtn = document.querySelector('button[aria-label="Export project"]') as HTMLButtonElement | null;
          if (exportBtn) exportBtn.click();
        },
      },
      {
        id: 'dashboard',
        label: 'Back to Workspace Dashboard',
        category: 'Navigation',
        icon: FolderOpen,
        action: () => {
          save();
          navigate('/dashboard');
        },
      },
    ];
  }, [dispatch, navigate, save, state.ui.isPlaying, state.ui.splitAllTracks]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()),
    );
  }, [commands, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 grid place-items-center animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-app-elevated p-3 shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center gap-2.5 px-3 py-2 border-b border-border bg-panel rounded-xl">
          <Search size={16} className="text-accent shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tools... (e.g. Split, AI, Export)"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-fg cursor-pointer p-1 rounded-md hover:bg-panel-hover"
          >
            <X size={15} />
          </button>
        </div>

        {/* Command Items List */}
        <div className="mt-2 max-h-80 overflow-y-auto space-y-1 p-1">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-panel cursor-pointer transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-panel group-hover:bg-accent/15 group-hover:text-accent grid place-items-center text-muted transition">
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-fg">{item.label}</p>
                    <p className="text-[10px] text-muted">{item.category}</p>
                  </div>
                </div>
                {item.shortcut ? (
                  <span className="px-2 py-0.5 rounded bg-panel border border-border text-[10px] font-mono text-muted">
                    {item.shortcut}
                  </span>
                ) : null}
              </button>
            );
          })}
          {!filtered.length && (
            <div className="p-8 text-center text-xs text-muted">
              No matching command found. Try searching for "AI", "Split", or "Export".
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-3 text-[10px] text-subtle">
          <span>
            Press <kbd className="px-1 py-0.5 rounded bg-panel border border-border">Ctrl+K</kbd> anytime
          </span>
          <span className="flex items-center gap-1">
            <Clapperboard size={11} className="text-accent" /> VJEditor Command Palette
          </span>
        </div>
      </div>
    </div>
  );
}
