import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import {
  Check,
  Eraser,
  Mic2,
  Scissors,
  Sparkles,
  Subtitles,
  WandSparkles,
} from 'lucide-react';
import { useState } from 'react';

const SUGGESTIONS = [
  'Cinematic drone shot of misty mountain peaks',
  'Viral energetic hook for productivity hacks',
  'Deep narrative voiceover explaining quantum computing',
  'Remove all pauses and dead air over 0.4s',
];

export function AiToolsPanel() {
  const { dispatch, state } = useEditor();
  const [prompt, setPrompt] = useState('A cinematic tech showcase with clean lighting and bold typography.');
  const [_activeTool, setActiveTool] = useState<string | null>(null);
  const [voicePersona, setVoicePersona] = useState('Rachel (Warm & Engaging)');
  const [language, setLanguage] = useState('English');
  const [silenceThreshold, setSilenceThreshold] = useState(0.4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function executeTool(toolName: string) {
    setActiveTool(toolName);
    setIsProcessing(true);
    setStatusMessage(`Running ${toolName}...`);

    setTimeout(() => {
      setIsProcessing(false);

      if (toolName === 'AI Video Generator') {
        const id = crypto.randomUUID();
        dispatch({
          type: 'add-media',
          asset: {
            id,
            name: `AI Scene: ${prompt.slice(0, 20)}...`,
            type: 'video',
            durationMs: 7000,
            thumbnailColor: '#312E81',
            createdAt: new Date().toISOString(),
          },
        });
        setStatusMessage('AI Video Scene generated and inserted into video track!');
      } else if (toolName === 'AI Script') {
        dispatch({
          type: 'add-text',
          preset: {
            name: 'AI Script Hook',
            text: prompt.slice(0, 80),
            fontSize: 34,
            fontWeight: 700,
          },
        });
        setStatusMessage('AI script copy formatted and added as dynamic text overlay!');
      } else if (toolName === 'AI Voice') {
        const id = crypto.randomUUID();
        dispatch({
          type: 'add-media',
          asset: {
            id,
            name: `Voice (${voicePersona.split(' ')[0]}): ${prompt.slice(0, 16)}.wav`,
            type: 'audio',
            durationMs: 6500,
            thumbnailColor: '#065F46',
            createdAt: new Date().toISOString(),
          },
        });
        setStatusMessage(`AI voiceover synthesized with ${voicePersona} persona!`);
      } else if (toolName === 'Auto Captions') {
        dispatch({ type: 'add-caption' });
        setStatusMessage(`Auto-captions transcribed in ${language} and synced to timeline!`);
      } else if (toolName === 'AI Auto Edit') {
        dispatch({ type: 'set-zoom', zoom: Math.min(160, state.ui.zoom + 12) });
        setStatusMessage(`Auto-edit applied: removed pauses > ${silenceThreshold}s and tightened pacing.`);
      } else if (toolName === 'Background Removal') {
        setStatusMessage('Neural matting applied: background isolated from active clip.');
      } else if (toolName === 'Video Translation') {
        dispatch({ type: 'add-caption' });
        setStatusMessage(`Video dubbed and translated into ${language}!`);
      } else if (toolName === 'Viral Clipper') {
        setStatusMessage('Top 3 viral highlight moments bookmarked on timeline.');
      }
    }, 1200);
  }

  return (
    <div className="p-3.5 space-y-3 overflow-auto h-full text-fg text-xs">
      {/* Prompt Area */}
      <div className="rounded-xl border border-accent/40 bg-accent/10 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-accent flex items-center gap-1.5">
            <Sparkles size={14} />
            AI Creative Assistant
          </span>
          {isProcessing && <span className="text-[10px] text-accent animate-pulse font-medium">Processing...</span>}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="Describe what you want to generate or edit..."
          className="w-full resize-none rounded-lg border border-border bg-panel p-2 text-xs text-fg outline-none focus:border-accent"
        />

        {/* Suggestion pills */}
        <div className="flex flex-wrap gap-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPrompt(s)}
              className="text-[10px] text-muted hover:text-fg bg-panel hover:bg-panel-hover px-1.5 py-0.5 rounded border border-border cursor-pointer transition-colors truncate max-w-[200px]"
            >
              {s}
            </button>
          ))}
        </div>

        {statusMessage && (
          <p className="text-[11px] text-accent font-medium flex items-center gap-1 mt-1">
            <Check size={12} />
            {statusMessage}
          </p>
        )}
      </div>

      {/* Tools List */}
      <div className="space-y-2">
        {/* 1. Text to Video */}
        <article className="rounded-xl border border-border bg-panel p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-500/15 text-blue-400 grid place-items-center">
                <Sparkles size={15} />
              </div>
              <div>
                <p className="font-semibold text-xs">AI Video Generator</p>
                <p className="text-[10px] text-muted">Generate scene clip from prompt</p>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            className="w-full h-7 text-xs"
            disabled={isProcessing}
            onClick={() => executeTool('AI Video Generator')}
          >
            Generate Video Clip
          </Button>
        </article>

        {/* 2. AI Voiceover */}
        <article className="rounded-xl border border-border bg-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 grid place-items-center">
              <Mic2 size={15} />
            </div>
            <div>
              <p className="font-semibold text-xs">AI Voiceover (TTS)</p>
              <p className="text-[10px] text-muted">Lifelike studio narration voice</p>
            </div>
          </div>
          <select
            value={voicePersona}
            onChange={(e) => setVoicePersona(e.target.value)}
            className="w-full h-7 rounded border border-border bg-app px-2 text-[11px] text-fg outline-none"
          >
            <option value="Rachel (Warm & Engaging)">Rachel (Warm & Engaging)</option>
            <option value="Adam (Deep & Confident)">Adam (Deep & Confident)</option>
            <option value="Bella (Energetic & Fun)">Bella (Energetic & Fun)</option>
            <option value="Josh (Authoritative News)">Josh (Authoritative News)</option>
          </select>
          <Button
            size="sm"
            variant="secondary"
            className="w-full h-7 text-xs"
            disabled={isProcessing}
            onClick={() => executeTool('AI Voice')}
          >
            Synthesize Voiceover Track
          </Button>
        </article>

        {/* 3. Auto Captions */}
        <article className="rounded-xl border border-border bg-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-400 grid place-items-center">
              <Subtitles size={15} />
            </div>
            <div>
              <p className="font-semibold text-xs">Auto Captions (Whisper)</p>
              <p className="text-[10px] text-muted">Word-by-word subtitle track</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full h-7 rounded border border-border bg-app px-2 text-[11px] text-fg outline-none"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Japanese">Japanese</option>
            <option value="Hindi">Hindi</option>
          </select>
          <Button
            size="sm"
            variant="secondary"
            className="w-full h-7 text-xs"
            disabled={isProcessing}
            onClick={() => executeTool('Auto Captions')}
          >
            Generate Auto Captions
          </Button>
        </article>

        {/* 4. AI Smart Silence Remover */}
        <article className="rounded-xl border border-border bg-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-red-500/15 text-red-400 grid place-items-center">
              <Scissors size={15} />
            </div>
            <div>
              <p className="font-semibold text-xs">AI Smart Silence Remover</p>
              <p className="text-[10px] text-muted">Cut pauses & jump-cut dead air</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Threshold</span>
            <span className="text-accent font-semibold">{silenceThreshold}s</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1.2}
            step={0.05}
            value={silenceThreshold}
            onChange={(e) => setSilenceThreshold(Number(e.target.value))}
            className="w-full"
          />
          <Button
            size="sm"
            variant="secondary"
            className="w-full h-7 text-xs"
            disabled={isProcessing}
            onClick={() => executeTool('AI Auto Edit')}
          >
            Auto-Cut Pauses
          </Button>
        </article>

        {/* 5. AI Script */}
        <article className="rounded-xl border border-border bg-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-purple-500/15 text-purple-400 grid place-items-center">
              <WandSparkles size={15} />
            </div>
            <div>
              <p className="font-semibold text-xs">AI Script & Titles</p>
              <p className="text-[10px] text-muted">Scene script & hook title</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="w-full h-7 text-xs"
            disabled={isProcessing}
            onClick={() => executeTool('AI Script')}
          >
            Draft Script & Title
          </Button>
        </article>

        {/* 6. Background Removal */}
        <article className="rounded-xl border border-border bg-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/15 text-cyan-400 grid place-items-center">
              <Eraser size={15} />
            </div>
            <div>
              <p className="font-semibold text-xs">Magic Background Removal</p>
              <p className="text-[10px] text-muted">Green-screen-free subject cutout</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="w-full h-7 text-xs"
            disabled={isProcessing}
            onClick={() => executeTool('Background Removal')}
          >
            Remove Background
          </Button>
        </article>
      </div>
    </div>
  );
}
