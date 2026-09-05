import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import { Type } from 'lucide-react';

const presets = [
  { name: 'Title', text: 'NEW TITLE', fontSize: 64, fontWeight: 700 },
  { name: 'Subtitle', text: 'Supporting line', fontSize: 28, fontWeight: 500 },
  { name: 'Lower third', text: 'Name  ·  Role', fontSize: 22, fontWeight: 600 },
];

export function TextPanel() {
  const { dispatch } = useEditor();

  return (
    <div className="p-3 space-y-3">
      <Button variant="primary" className="w-full" onClick={() => dispatch({ type: 'add-text' })}>
        <Type size={14} />
        Add text layer
      </Button>
      {presets.map((preset) => (
        <button
          key={preset.name}
          type="button"
          className="w-full rounded-xl border border-border bg-panel p-3 text-left cursor-pointer hover:border-border-strong"
          onClick={() => {
            dispatch({ type: 'add-text', preset });
          }}
        >
          <p className="text-xs text-muted">{preset.name}</p>
          <p className="text-sm mt-1" style={{ fontWeight: preset.fontWeight, fontSize: 16 }}>
            {preset.text}
          </p>
        </button>
      ))}
    </div>
  );
}
