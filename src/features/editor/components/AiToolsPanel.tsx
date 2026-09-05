import { Button } from '@/components/ui/Button';
import {
  Captions,
  Eraser,
  Languages,
  Mic2,
  Scissors,
  Sparkles,
  Subtitles,
  WandSparkles,
} from 'lucide-react';

const tools = [
  {
    icon: Sparkles,
    name: 'AI Video Generator',
    description: 'Turn a prompt into a first-cut timeline.',
  },
  {
    icon: WandSparkles,
    name: 'AI Script',
    description: 'Draft scene-by-scene copy for the voice track.',
  },
  {
    icon: Mic2,
    name: 'AI Voice',
    description: 'Generate narration in the selected voice.',
  },
  {
    icon: Subtitles,
    name: 'Auto Captions',
    description: 'Speech-to-text captions locked to the playhead.',
  },
  {
    icon: Scissors,
    name: 'AI Auto Edit',
    description: 'Tighten pauses and jump-cut filler automatically.',
  },
  {
    icon: Eraser,
    name: 'Background Removal',
    description: 'Isolate talent from the current video clip.',
  },
  {
    icon: Languages,
    name: 'Video Translation',
    description: 'Translate captions and rebuild dubbed audio.',
  },
  {
    icon: Captions,
    name: 'Highlight Detection',
    description: 'Mark the strongest moments for short-form cuts.',
  },
];

export function AiToolsPanel() {
  return (
    <div className="p-3 space-y-2 overflow-auto h-full">
      {tools.map((tool) => (
        <article key={tool.name} className="rounded-xl border border-border bg-panel p-3">
          <div className="flex items-start gap-2">
            <tool.icon size={16} className="text-accent mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{tool.name}</p>
              <p className="text-xs text-muted mt-1">{tool.description}</p>
              <Button size="sm" className="mt-2 h-7 text-xs" disabled>
                Coming in Phase 2
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
