import { Button } from '@/components/ui/Button';
import { projectService } from '@/services/projectService';
import type { AspectRatio } from '@/types';
import {
  ArrowRight,
  Captions,
  Eraser,
  Flame,
  Languages,
  Mic2,
  Scissors,
  Sparkles,
  Volume2,
  WandSparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AIToolDef {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: typeof Sparkles;
  gradient: string;
  placeholderPrompt: string;
  category: 'Creation' | 'Audio & Voice' | 'Editing & Polish';
}

const AI_TOOLS: AIToolDef[] = [
  {
    id: 'text-to-video',
    name: 'AI Text-to-Video',
    badge: 'Popular',
    description: 'Transform natural language prompts into complete, multi-scene video timelines.',
    icon: Sparkles,
    gradient: 'from-blue-600/20 via-indigo-600/20 to-purple-600/20 border-indigo-500/30',
    placeholderPrompt: 'A cinematic aerial shot of a futuristic neon city at twilight with flying vehicles.',
    category: 'Creation',
  },
  {
    id: 'ai-script',
    name: 'AI Script & Storyboard',
    badge: 'Fast',
    description: 'Generate hooks, scene-by-scene voiceover copy, and camera direction in seconds.',
    icon: WandSparkles,
    gradient: 'from-purple-600/20 via-pink-600/20 to-rose-600/20 border-pink-500/30',
    placeholderPrompt: '5 psychological hacks to double your productivity without burning out.',
    category: 'Creation',
  },
  {
    id: 'ai-voice',
    name: 'AI Voiceover Generator',
    badge: 'Studio HD',
    description: 'Generate lifelike speech in realistic personas with emotional inflection.',
    icon: Mic2,
    gradient: 'from-emerald-600/20 via-teal-600/20 to-cyan-600/20 border-teal-500/30',
    placeholderPrompt: 'Welcome back everyone. Today we are exploring the future of artificial intelligence in filmmaking.',
    category: 'Audio & Voice',
  },
  {
    id: 'auto-captions',
    name: 'Auto Captions & Subtitles',
    badge: 'Whisper AI',
    description: 'Automatic speech-to-text with viral word-by-word animation and color highlights.',
    icon: Captions,
    gradient: 'from-amber-600/20 via-orange-600/20 to-yellow-600/20 border-amber-500/30',
    placeholderPrompt: 'Auto-transcribe and sync animated captions with high accuracy.',
    category: 'Audio & Voice',
  },
  {
    id: 'auto-cut',
    name: 'AI Smart Silence Remover',
    badge: 'Automation',
    description: 'Automatically detect and trim dead air, pauses, and filler words from raw footage.',
    icon: Scissors,
    gradient: 'from-red-600/20 via-rose-600/20 to-orange-600/20 border-red-500/30',
    placeholderPrompt: 'Cut silences longer than 0.4s and tighten timeline pacing.',
    category: 'Editing & Polish',
  },
  {
    id: 'magic-cutout',
    name: 'Magic Background Removal',
    badge: 'Neural Matting',
    description: 'Isolate human subjects and remove backgrounds instantly without a green screen.',
    icon: Eraser,
    gradient: 'from-cyan-600/20 via-blue-600/20 to-indigo-600/20 border-cyan-500/30',
    placeholderPrompt: 'Isolate subject and composite over an animated studio background.',
    category: 'Editing & Polish',
  },
  {
    id: 'translation',
    name: 'AI Dubbing & Translation',
    badge: 'Global',
    description: 'Translate spoken video audio and burn subtitles in over 20+ languages.',
    icon: Languages,
    gradient: 'from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 border-violet-500/30',
    placeholderPrompt: 'Translate video voiceover and captions into Spanish and Japanese.',
    category: 'Editing & Polish',
  },
  {
    id: 'viral-clipper',
    name: 'Viral Highlight Clipper',
    badge: 'Shorts & Reels',
    description: 'Detect high-energy peaks and convert long-form videos into 9:16 vertical clips.',
    icon: Flame,
    gradient: 'from-orange-600/20 via-amber-600/20 to-yellow-600/20 border-orange-500/30',
    placeholderPrompt: 'Find top 3 moments with high audience engagement and cut to 9:16.',
    category: 'Creation',
  },
];

export function AiToolsDashboard() {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<AIToolDef | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Creation', 'Audio & Voice', 'Editing & Polish'];

  const filteredTools =
    activeCategory === 'All'
      ? AI_TOOLS
      : AI_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-panel via-app-elevated to-accent/10 p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/40 bg-accent/15 text-xs text-accent font-semibold mb-3">
            <Sparkles size={13} />
            <span>AI Studio Engine 2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">
            Supercharge your workflow with AI Tools
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-muted leading-relaxed">
            Generate full video scenes from prompts, draft voiceover scripts, synthesize studio voices, and automate multi-track editing without switching apps.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => setSelectedTool(AI_TOOLS[0])}
              className="gap-2"
            >
              <Sparkles size={16} />
              <span>Generate Video with AI</span>
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setSelectedTool(AI_TOOLS[2])}
              className="gap-2"
            >
              <Volume2 size={16} />
              <span>Generate AI Voice</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeCategory === cat
                ? 'bg-accent text-white'
                : 'text-muted hover:text-fg hover:bg-panel'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className={`rounded-2xl border bg-panel p-5 flex flex-col justify-between hover:border-accent/60 transition-all hover:shadow-lg hover:-translate-y-0.5 group ${tool.gradient}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-app-elevated border border-border flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-fg group-hover:text-accent transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-[11px] text-subtle">{tool.category}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTool(tool)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  <span>Launch tool</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Tool Modal */}
      {selectedTool && (
        <AIToolModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          onOpenEditor={(projectId) => navigate(`/editor/${projectId}`)}
        />
      )}
    </div>
  );
}

function AIToolModal({
  tool,
  onClose,
  onOpenEditor,
}: {
  tool: AIToolDef;
  onClose: () => void;
  onOpenEditor: (projectId: string) => void;
}) {
  const [prompt, setPrompt] = useState(tool.placeholderPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<number>(30);
  const [voicePersona, setVoicePersona] = useState('Rachel (Warm & Engaging)');
  const [stylePreset, setStylePreset] = useState('Cinematic 4K');
  const [silenceThreshold, setSilenceThreshold] = useState(0.4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const Icon = tool.icon;

  async function handleGenerate() {
    setIsGenerating(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 400);

    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);

      // Create a new project with the generated AI assets
      const created = await projectService.create({
        name: `${tool.name} — ${prompt.slice(0, 24)}...`,
        source: 'ai',
        duration,
        aspectRatio,
        resolution: '1080p',
        prompt,
        style: stylePreset,
        voice: voicePersona,
      });

      setIsGenerating(false);
      onOpenEditor(created.project.id);
    }, 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 grid place-items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isGenerating) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-border bg-app-elevated p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/15 text-accent grid place-items-center">
              <Icon size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-fg">{tool.name}</h2>
              <p className="text-xs text-muted">{tool.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="h-8 w-8 grid place-items-center rounded-lg text-muted hover:bg-panel cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4">
          <label className="block">
            <span className="text-xs text-muted font-medium">Prompt & Instructions</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-panel p-3 text-sm text-fg outline-none focus:border-accent resize-none placeholder:text-subtle"
            />
          </label>

          {/* Tool specific parameters */}
          {tool.id === 'text-to-video' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs text-muted">Aspect Ratio</span>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="mt-1 w-full h-9 rounded-lg border border-border bg-panel px-2 text-xs text-fg"
                >
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 TikTok/Reels</option>
                  <option value="1:1">1:1 Square</option>
                  <option value="4:5">4:5 Instagram</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-muted">Duration</span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1 w-full h-9 rounded-lg border border-border bg-panel px-2 text-xs text-fg"
                >
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-muted">Visual Style</span>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-border bg-panel px-2 text-xs text-fg"
                >
                  <option value="Cinematic 4K">Cinematic 4K</option>
                  <option value="Anime / Cel Shaded">Anime</option>
                  <option value="Photorealistic">Photorealistic</option>
                  <option value="Minimal 3D">Minimal 3D</option>
                </select>
              </label>
            </div>
          )}

          {tool.id === 'ai-voice' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-muted">Voice Persona</span>
                <select
                  value={voicePersona}
                  onChange={(e) => setVoicePersona(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-border bg-panel px-2 text-xs text-fg"
                >
                  <option value="Rachel (Warm & Engaging)">Rachel (Warm & Engaging)</option>
                  <option value="Adam (Deep & Confident)">Adam (Deep & Confident)</option>
                  <option value="Bella (Energetic & Fun)">Bella (Energetic & Fun)</option>
                  <option value="Josh (Authoritative News)">Josh (Authoritative News)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-muted">Speaking Speed</span>
                <select className="mt-1 w-full h-9 rounded-lg border border-border bg-panel px-2 text-xs text-fg">
                  <option>1.0x (Normal)</option>
                  <option>1.15x (Brisk Youtube)</option>
                  <option>1.3x (Fast TikTok)</option>
                </select>
              </label>
            </div>
          )}

          {tool.id === 'auto-cut' && (
            <div className="p-3 rounded-xl border border-border bg-panel space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Silence Threshold</span>
                <span className="font-semibold text-accent">{silenceThreshold}s</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1.5}
                step={0.05}
                value={silenceThreshold}
                onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[11px] text-muted">
                Pauses and silent room-tone longer than {silenceThreshold}s will be automatically cut.
              </p>
            </div>
          )}

          {/* Generation Progress Bar */}
          {isGenerating && (
            <div className="p-3 rounded-xl border border-accent/40 bg-accent/10 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-accent font-medium flex items-center gap-1.5">
                  <Sparkles size={14} className="animate-spin" />
                  Neural Synthesis in Progress...
                </span>
                <span className="font-bold text-accent">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-app rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="gap-2"
          >
            {isGenerating ? (
              <span>Synthesizing...</span>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate & Open in Editor</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
