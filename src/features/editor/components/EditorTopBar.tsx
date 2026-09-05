import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useEditor } from '@/features/editor/EditorProvider';
import { Download, Redo2, Save, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function EditorTopBar() {
  const { state, dispatch, save } = useEditor();
  const [editing, setEditing] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const navigate = useNavigate();

  function exportProject() {
    const payload = {
      exportedAt: new Date().toISOString(),
      project: {
        id: state.projectId,
        name: state.snapshot.name,
        duration: state.snapshot.duration,
        aspectRatio: state.aspectRatio,
      },
      tracks: state.snapshot.tracks,
      media: state.snapshot.media,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${slugify(state.snapshot.name || 'vjeditor-project')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  return (
    <header className="h-12 shrink-0 border-b border-border bg-app-elevated flex items-center gap-3 px-3">
      <Logo compact to="/dashboard" />
      <div className="w-px h-5 bg-border" />
      {editing ? (
        <input
          autoFocus
          value={state.snapshot.name}
          onChange={(e) => dispatch({ type: 'rename', name: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setEditing(false);
          }}
          className="h-8 min-w-[180px] rounded-md border border-border bg-panel px-2 text-sm outline-none"
        />
      ) : (
        <button
          type="button"
          className="text-sm font-medium px-2 h-8 rounded-md hover:bg-panel cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {state.snapshot.name}
          {!state.ui.isSaved ? <span className="text-muted font-normal"> • Unsaved</span> : null}
        </button>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          size="icon"
          variant="ghost"
          disabled={state.past.length === 0}
          onClick={() => dispatch({ type: 'undo' })}
          aria-label="Undo"
        >
          <Undo2 size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={state.future.length === 0}
          onClick={() => dispatch({ type: 'redo' })}
          aria-label="Redo"
        >
          <Redo2 size={16} />
        </Button>
        <Button size="sm" onClick={save}>
          <Save size={14} />
          Save
        </Button>
        <div className="relative">
          <Button variant="primary" size="sm" onClick={() => setExportOpen((v) => !v)}>
            <Download size={14} />
            Export
          </Button>
          {exportOpen ? (
            <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-border bg-app-elevated p-3 shadow-xl">
              <p className="text-xs text-muted mb-2">Project package ready for handoff.</p>
              <p className="text-sm">JSON export • local project snapshot</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  save();
                  exportProject();
                }}
              >
                Export JSON
              </Button>
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  save();
                  setExportOpen(false);
                  navigate('/dashboard');
                }}
              >
                Save & close
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'vjeditor-project';
}
