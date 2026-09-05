import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import { seedMedia } from '@/data/seedMedia';

export function AudioPanel() {
  const { dispatch, state } = useEditor();
  const audio = [...state.snapshot.media, ...seedMedia].filter((item) => item.type === 'audio');
  const unique = [...new Map(audio.map((item) => [item.id, item])).values()];

  return (
    <div className="p-3 space-y-2 overflow-auto h-full">
      <p className="text-xs text-muted px-1">Click to place audio at the playhead.</p>
      {unique.map((asset) => (
        <div key={asset.id} className="rounded-xl border border-border bg-panel p-3">
          <p className="text-sm truncate">{asset.name}</p>
          <Button size="sm" className="mt-2 h-7 text-xs" onClick={() => dispatch({ type: 'add-media', asset })}>
            Add to A1
          </Button>
        </div>
      ))}
    </div>
  );
}
