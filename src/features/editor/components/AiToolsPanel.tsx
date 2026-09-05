import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
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
import { useState } from 'react';

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
  const { dispatch, state } = useEditor();
  const [prompt, setPrompt] = useState('A cinematic product launch with a confident, energetic tone.');
  const [status, setStatus] = useState('Choose an AI tool to add a draft to your timeline.');

  function runTool(name: string) {
    if (name === 'AI Video Generator') {
      dispatch({
        type: 'add-media',
        asset: {
          id: crypto.randomUUID(),
          name: 'AI generated scene',
          type: 'video',
          durationMs: 8000,
          thumbnailColor: '#234f67',
          createdAt: new Date().toISOString(),
        },
      });
      setStatus('AI scene added to the video track.');
      return;
    }
    if (name === 'AI Script') {
      dispatch({
        type: 'add-text',
        preset: {
          name: 'AI Script',
          text: prompt.slice(0, 90),
          fontSize: 38,
          fontWeight: 600,
        },
      });
      setStatus('AI script draft added as a text layer.');
      return;
    }
    if (name === 'AI Voice') {
      dispatch({
        type: 'add-media',
        asset: {
          id: crypto.randomUUID(),
          name: 'AI voiceover draft.wav',
          type: 'audio',
          durationMs: 8000,
          thumbnailColor: '#1f4a3c',
          createdAt: new Date().toISOString(),
        },
      });
      setStatus('AI voiceover draft added to the audio track.');
      return;
    }
    if (name === 'Auto Captions') {
      dispatch({ type: 'add-caption' });
      setStatus('Caption draft added at the current playhead.');
      return;
    }
    if (name === 'AI Auto Edit') {
      dispatch({ type: 'set-zoom', zoom: Math.min(160, state.ui.zoom + 8) });
      setStatus('Auto-edit preview applied: timeline zoom tightened.');
      return;
    }
    setStatus(`${name} is ready for an AI provider connection.`);
  }

  return (
    <div className="p-3 space-y-2 overflow-auto h-full">
      <div className="rounded-xl border border-accent/40 bg-accent-soft p-3">
        <label className="text-xs text-muted">
          AI prompt
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-border bg-panel px-2 py-1.5 text-sm text-fg outline-none focus:border-accent"
          />
        </label>
        <p className="mt-2 text-xs text-accent" role="status">{status}</p>
      </div>
      {tools.map((tool) => (
        <article key={tool.name} className="rounded-xl border border-border bg-panel p-3">
          <div className="flex items-start gap-2">
            <tool.icon size={16} className="text-accent mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{tool.name}</p>
              <p className="text-xs text-muted mt-1">{tool.description}</p>
              <Button size="sm" className="mt-2 h-7 text-xs" onClick={() => runTool(tool.name)}>
                {tool.name === 'AI Video Generator' || tool.name === 'AI Script' ? 'Generate draft' : 'Apply'}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
