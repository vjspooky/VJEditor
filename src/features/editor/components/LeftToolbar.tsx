import { useEditor, type LeftPanelId } from '@/features/editor/EditorProvider';
import { cx } from '@/utils/cx';
import {
  Blend,
  Captions,
  Clapperboard,
  Image,
  LayoutTemplate,
  Sparkles,
  Type,
  Volume2,
  WandSparkles,
} from 'lucide-react';

const tools: { id: LeftPanelId; label: string; icon: typeof Image }[] = [
  { id: 'media', label: 'Media', icon: Image },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'captions', label: 'Captions', icon: Captions },
  { id: 'transitions', label: 'Transitions', icon: Blend },
  { id: 'effects', label: 'Effects', icon: WandSparkles },
  { id: 'filters', label: 'Filters', icon: Sparkles },
  { id: 'ai', label: 'AI Tools', icon: Clapperboard },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
];

export function LeftToolbar() {
  const { state, dispatch } = useEditor();
  const active = state.ui.activeLeftPanel;

  return (
    <div className="w-14 shrink-0 border-r border-border bg-app-elevated flex flex-col items-center py-2 gap-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const selected = active === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            title={tool.label}
            onClick={() =>
              dispatch({
                type: 'set-panel',
                panel: selected && tool.id === active ? tool.id : tool.id,
              })
            }
            className={cx(
              'h-10 w-10 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer',
              selected ? 'bg-panel-hover text-fg' : 'text-muted hover:text-fg hover:bg-panel',
            )}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
