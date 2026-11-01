/**
 * AIStudio — Full-screen AI generation panel with:
 *   • Gemini text/script/concept generation (streaming)
 *   • Gemini image generation
 *   • Voice-to-prompt via Web Speech API
 *   • One-click "Add to Editor / Download" actions
 */

import { Button } from '@/components/ui/Button';
import {
  generateImage,
  generateText,
  hasApiKey,
  setApiKey,
  type GenerationType,
} from '@/services/geminiService';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Key,
  Mic,
  MicOff,
  RefreshCcw,
  Send,
  Sparkles,
  Video,
  Volume2,
  WandSparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Speech Recognition ───────────────────────────────────────────────────────

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

// ─── Generation Mode Config ───────────────────────────────────────────────────

interface ModeConfig {
  id: GenerationType | 'image';
  label: string;
  icon: typeof Sparkles;
  description: string;
  placeholder: string;
  color: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'video-script',
    label: 'Video Script',
    icon: Video,
    description: 'Full scene-by-scene script with camera direction & voiceover',
    placeholder: 'e.g. A 60-second YouTube Short about the top 5 productivity hacks that changed my life...',
    color: 'text-blue-400',
  },
  {
    id: 'voiceover',
    label: 'Voiceover Script',
    icon: Volume2,
    description: 'Natural, spoken voiceover script optimized for TTS',
    placeholder: 'e.g. A warm, engaging intro for a travel vlog about exploring Tokyo on a budget...',
    color: 'text-emerald-400',
  },
  {
    id: 'concept',
    label: 'Video Concept',
    icon: WandSparkles,
    description: 'Full creative brief — title, hook, scenes, style & music',
    placeholder: 'e.g. A viral video concept for a fitness brand targeting Gen Z on TikTok...',
    color: 'text-purple-400',
  },
  {
    id: 'image-prompt',
    label: 'Image Prompt',
    icon: WandSparkles,
    description: 'Expand your idea into a detailed AI image generation prompt',
    placeholder: 'e.g. A cinematic aerial view of a neon-lit cyberpunk city at dusk with flying cars...',
    color: 'text-amber-400',
  },
  {
    id: 'image',
    label: 'Generate Image',
    icon: ImageIcon,
    description: 'AI-generated image using Gemini image model',
    placeholder: 'e.g. A photorealistic studio portrait of a professional podcaster with soft lighting...',
    color: 'text-pink-400',
  },
];

// ─── Prompt Suggestions ──────────────────────────────────────────────────────

const SUGGESTIONS: Record<string, string[]> = {
  'video-script': [
    '5 habits that will transform your mornings (60 seconds)',
    'How AI will change video editing in 2025',
    'Behind the scenes of building a startup in 30 days',
  ],
  voiceover: [
    'Intro for a cinematic travel vlog in Japan',
    'Product reveal voiceover for a new smartphone',
    'Motivational closing statement for a self-help video',
  ],
  concept: [
    'Viral TikTok series for a streetwear brand',
    'YouTube documentary about the future of creativity',
    'Short-form ad concept for a coffee startup',
  ],
  'image-prompt': [
    'Futuristic neon city skyline at night',
    'Cozy home studio setup for a creator',
    'Abstract liquid metal sculpture',
  ],
  image: [
    'Cinematic portrait of a DJ on stage with crowd',
    'Minimalist flat-lay of video editing equipment',
    'Vibrant tropical beach with crystal water',
  ],
};

// ─── API Key Setup Panel ─────────────────────────────────────────────────────

function ApiKeySetup({ onSaved }: { onSaved: () => void }) {
  const [draft, setDraft] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  function save() {
    if (!draft.trim().startsWith('AI') && draft.trim().length < 20) {
      setError('That doesn\'t look like a valid Gemini API key (should start with "AI...")');
      return;
    }
    setApiKey(draft.trim());
    onSaved();
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-16 max-w-lg mx-auto text-center space-y-6">
      <div className="h-16 w-16 rounded-2xl bg-accent/15 border border-accent/30 grid place-items-center">
        <Key size={28} className="text-accent" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-fg">Connect to Gemini AI</h2>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Enter your free Google Gemini API key to unlock AI video script writing,
          voiceover generation, image creation and more. Your key is stored locally
          and never sent to our servers.
        </p>
      </div>

      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-accent underline underline-offset-2 hover:text-accent/80"
      >
        Get a free API key at Google AI Studio →
      </a>

      <div className="w-full space-y-3">
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="AIza..."
            className="w-full h-11 rounded-xl border border-border bg-panel px-4 pr-10 text-sm text-fg outline-none focus:border-accent placeholder:text-subtle"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg cursor-pointer"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button variant="primary" className="w-full gap-2" onClick={save}>
          <Sparkles size={15} />
          Connect Gemini
        </Button>
      </div>

      <p className="text-[11px] text-subtle leading-relaxed">
        The free tier includes generous usage limits. No credit card required.
      </p>
    </div>
  );
}

// ─── Main AI Studio ──────────────────────────────────────────────────────────

interface AIStudioProps {
  onClose?: () => void;
  /** Called when user clicks "Add to Editor" with a text result */
  onAddToEditor?: (text: string) => void;
}

export function AIStudio({ onClose, onAddToEditor }: AIStudioProps) {
  const [keyReady, setKeyReady] = useState(hasApiKey);
  const [mode, setMode] = useState<ModeConfig>(MODES[0]);
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<SpeechRecognition | null>(null);

  // Check for speech recognition support
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSpeechSupported(Boolean(SR));
  }, []);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // ── Voice Input ────────────────────────────────────────────────────────────

  const toggleListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recogRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recogRef.current = recognition;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPrompt(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // ── Generate ───────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;
    setError(null);
    setOutput('');
    setImageUrl(null);
    setIsGenerating(true);

    try {
      if (mode.id === 'image') {
        const result = await generateImage(prompt);
        if (result.imageBase64) {
          setImageUrl(`data:${result.imageMimeType ?? 'image/png'};base64,${result.imageBase64}`);
        }
        if (result.text) setOutput(result.text);
      } else {
        await generateText(prompt, mode.id as GenerationType, (delta) => {
          setOutput((prev) => prev + delta);
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed. Check your API key and try again.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    if (!output) return;
    void navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadImage() {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `vjeditor-ai-image-${Date.now()}.png`;
    a.click();
  }

  function handleReset() {
    setOutput('');
    setImageUrl(null);
    setError(null);
  }

  if (!keyReady) {
    return (
      <div className="flex flex-col h-full bg-app">
        {onClose && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Sparkles size={16} className="text-accent" />
              AI Studio
            </div>
            <button type="button" onClick={onClose} className="text-muted hover:text-fg cursor-pointer">
              <X size={18} />
            </button>
          </div>
        )}
        <ApiKeySetup onSaved={() => setKeyReady(true)} />
      </div>
    );
  }

  const suggestions = SUGGESTIONS[mode.id] ?? [];
  const hasOutput = Boolean(output || imageUrl);

  return (
    <div className="flex flex-col h-full bg-app overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent/15 grid place-items-center">
            <Sparkles size={15} className="text-accent" />
          </div>
          <span className="text-sm font-semibold text-fg">AI Studio</span>
          <span className="hidden sm:inline text-[11px] text-muted px-2 py-0.5 rounded-full border border-border">
            Gemini
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setApiKey(''); setKeyReady(false); }}
            className="text-[11px] text-subtle hover:text-muted cursor-pointer px-2 py-1 rounded hover:bg-panel"
          >
            <Key size={12} className="inline mr-1" />
            Change key
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="text-muted hover:text-fg cursor-pointer h-7 w-7 grid place-items-center rounded-lg hover:bg-panel">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border overflow-x-auto shrink-0">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => { setMode(m); handleReset(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                mode.id === m.id
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-fg hover:bg-panel'
              }`}
            >
              <Icon size={13} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Mode description */}
          <div className="flex items-start gap-2 p-3 rounded-xl border border-border bg-panel">
            {(() => { const Icon = mode.icon; return <Icon size={15} className={`shrink-0 mt-0.5 ${mode.color}`} />; })()}
            <p className="text-xs text-muted leading-relaxed">{mode.description}</p>
          </div>

          {/* Prompt area */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handleGenerate();
                }}
                placeholder={mode.placeholder}
                rows={4}
                disabled={isGenerating}
                className="w-full rounded-xl border border-border bg-panel p-3 pr-10 text-sm text-fg outline-none focus:border-accent resize-none placeholder:text-subtle disabled:opacity-60 leading-relaxed"
              />
              {/* Voice input button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-3 top-3 h-7 w-7 grid place-items-center rounded-lg transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : 'text-muted hover:text-fg hover:bg-panel-hover'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak your prompt'}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              )}
            </div>

            {/* Listening indicator */}
            {isListening && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                Listening... speak your prompt
              </div>
            )}

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="text-[10px] text-muted hover:text-fg border border-border rounded-full px-2.5 py-1 hover:bg-panel cursor-pointer transition-colors truncate max-w-[220px]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <Button
            variant="primary"
            className="w-full gap-2 justify-center"
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <>
                <Sparkles size={15} className="animate-spin" />
                <span>Generating with Gemini...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Generate{prompt.trim() ? '' : ' (enter a prompt first)'}</span>
                <span className="hidden sm:inline text-[10px] opacity-60 ml-auto">⌘↵</span>
              </>
            )}
          </Button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-danger/30 bg-danger/10 animate-in fade-in">
              <AlertCircle size={14} className="text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-danger leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Output ──────────────────────────────────────────────────── */}
          {hasOutput && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Image output */}
              {imageUrl && (
                <div className="rounded-xl overflow-hidden border border-border">
                  <img
                    src={imageUrl}
                    alt="AI generated"
                    className="w-full object-cover max-h-80"
                  />
                  <div className="flex gap-2 p-3 border-t border-border bg-panel">
                    <Button variant="secondary" size="sm" className="gap-1.5 flex-1" onClick={handleDownloadImage}>
                      <Download size={13} />
                      Download PNG
                    </Button>
                    {onAddToEditor && (
                      <Button variant="primary" size="sm" className="gap-1.5 flex-1" onClick={() => onAddToEditor(imageUrl)}>
                        <CheckCircle2 size={13} />
                        Add to Editor
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Text output */}
              {output && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-panel">
                    <span className="text-xs font-medium text-fg flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      Generated by Gemini
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] text-muted hover:text-fg cursor-pointer px-2 py-1 rounded hover:bg-panel-hover"
                      >
                        {copied ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1 text-[11px] text-muted hover:text-fg cursor-pointer px-2 py-1 rounded hover:bg-panel-hover"
                      >
                        <RefreshCcw size={12} />
                        Clear
                      </button>
                    </div>
                  </div>
                  <div
                    ref={outputRef}
                    className="p-4 text-sm text-fg leading-relaxed whitespace-pre-wrap max-h-96 overflow-auto font-mono text-[13px]"
                  >
                    {output}
                    {isGenerating && (
                      <span className="inline-block h-4 w-0.5 bg-accent animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                  {!isGenerating && onAddToEditor && (
                    <div className="flex gap-2 p-3 border-t border-border bg-panel">
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-1.5 w-full justify-center"
                        onClick={() => onAddToEditor(output)}
                      >
                        <CheckCircle2 size={13} />
                        Use in Editor
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer hint */}
      {!hasOutput && !isGenerating && (
        <div className="px-5 py-3 border-t border-border text-[11px] text-subtle text-center shrink-0">
          <ChevronDown size={11} className="inline mr-1 rotate-180" />
          Powered by Google Gemini · Your key is stored locally, never shared
        </div>
      )}
    </div>
  );
}

// ─── Floating AI Studio Button + Drawer ──────────────────────────────────────

/**
 * Floating button + slide-in drawer for use anywhere in the app
 */
export function AIStudioDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger */}
      <button
        id="ai-studio-fab"
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl bg-accent shadow-lg shadow-accent/30 grid place-items-center text-white hover:bg-accent/90 active:scale-95 transition-all cursor-pointer"
        title="Open AI Studio"
      >
        <Sparkles size={22} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 transition-transform duration-300 shadow-2xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <AIStudio onClose={() => setOpen(false)} />
      </div>
    </>
  );
}
