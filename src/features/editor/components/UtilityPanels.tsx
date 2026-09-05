import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';

export function CaptionsPanel() {
  const { dispatch } = useEditor();
  return (
    <div className="p-3 space-y-3">
      <p className="text-xs text-muted">
        Automatic speech-to-text arrives with the AI services. You can still place caption blocks
        on the CC track.
      </p>
      <Button variant="primary" className="w-full" onClick={() => dispatch({ type: 'add-caption' })}>
        Add caption
      </Button>
    </div>
  );
}

export function PlaceholderPanel({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xs text-muted mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
