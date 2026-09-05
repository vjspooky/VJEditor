import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import {
  Captions,
  Clapperboard,
  Scissors,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Sparkles,
    title: 'AI Video Creation',
    body: 'Turn a prompt into a structured cut with scenes, voice, and pacing already in place.',
  },
  {
    icon: Scissors,
    title: 'Professional Editing',
    body: 'A timeline built for precision: tracks, playhead control, and frame-accurate review.',
  },
  {
    icon: Zap,
    title: 'AI Automation',
    body: 'Auto-edit, highlight detection, and background removal sit next to your manual tools.',
  },
  {
    icon: Volume2,
    title: 'Powerful Audio Tools',
    body: 'Voice generation, ducking-ready audio tracks, fades, and clip-level speed control.',
  },
  {
    icon: Captions,
    title: 'Automatic Captions',
    body: 'Speech-to-text captions you can restyle, retiming, and lock to the timeline.',
  },
  {
    icon: Clapperboard,
    title: 'Fast Export',
    body: 'Render-ready project structure designed to plug into FFmpeg without rewriting the editor.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-app text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-app/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl h-16 px-5 flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            <a href="#features" className="hover:text-fg no-underline">
              Features
            </a>
            <a href="#ai-tools" className="hover:text-fg no-underline">
              AI Tools
            </a>
            <a href="#pricing" className="hover:text-fg no-underline">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="no-underline">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/login" className="no-underline">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-16 pb-12 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent mb-4">
            Create. Edit. Automate.
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-[1.12] tracking-tight">
            Create Videos.
            <br />
            Powered by AI.
          </h1>
          <p className="mt-5 text-muted text-base md:text-lg max-w-xl leading-relaxed">
            Generate, edit and automate your videos with one intelligent creative workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="no-underline">
              <Button variant="primary" size="lg">
                Start Creating
              </Button>
            </Link>
            <a href="#ai-tools" className="no-underline">
              <Button size="lg">Explore AI Tools</Button>
            </a>
          </div>
        </div>
        <EditorMockup />
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm text-accent mb-2">Workspace</p>
        <h2 className="text-2xl font-semibold tracking-tight mb-8">
          One surface for generation and finishing
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-border bg-panel p-5"
            >
              <feature.icon size={18} className="text-accent mb-3" />
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ai-tools" className="mx-auto max-w-6xl px-5 py-8 pb-16">
        <div className="rounded-2xl border border-border bg-panel p-8 md:p-10 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">AI Tools, in the editor</h2>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Script, voice, captions, translation, and auto-edit are first-class panels — not a
              separate product. Generate a cut, then finish it on the same timeline.
            </p>
          </div>
          <ul className="text-sm text-muted grid grid-cols-2 gap-2 content-start">
            {[
              'AI Video Generator',
              'AI Script',
              'AI Voice',
              'Auto Captions',
              'AI Auto Edit',
              'Background Removal',
              'Video Translation',
              'Highlight Detection',
            ].map((tool) => (
              <li key={tool} className="rounded-lg border border-border bg-app px-3 py-2 text-fg">
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '$0', note: 'Drafts, 720p export, watermarked AI jobs.' },
            { name: 'Pro', price: '$24', note: 'Unlimited projects, 4K export, full AI suite.' },
            { name: 'Studio', price: '$79', note: 'Team seats, render queue, API access later.' },
          ].map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-border bg-panel p-6">
              <p className="text-sm text-muted">{plan.name}</p>
              <p className="text-3xl font-semibold mt-2">
                {plan.price}
                <span className="text-sm text-muted font-normal"> /mo</span>
              </p>
              <p className="text-sm text-muted mt-3">{plan.note}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between text-xs text-muted">
          <span>© 2026 VJEditor</span>
          <span>Create. Edit. Automate.</span>
        </div>
      </footer>
    </div>
  );
}

function EditorMockup() {
  return (
    <div className="rounded-2xl border border-border bg-panel overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="h-10 border-b border-border flex items-center px-3 gap-2">
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="ml-3 text-xs text-muted">Travel Reel — Editor</span>
      </div>
      <div className="grid grid-cols-[52px_1fr_120px] h-[220px]">
        <div className="border-r border-border p-2 flex flex-col gap-2 text-subtle">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-6 rounded bg-panel-hover" />
          ))}
        </div>
        <div className="bg-app grid place-items-center">
          <div className="w-[72%] aspect-video rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#0c0d10] border border-border grid place-items-center">
            <span className="text-xs text-muted">Preview</span>
          </div>
        </div>
        <div className="border-l border-border p-2 space-y-2">
          <span className="block h-2 w-16 rounded bg-border" />
          <span className="block h-8 rounded bg-panel-hover" />
          <span className="block h-8 rounded bg-panel-hover" />
        </div>
      </div>
      <div className="border-t border-border p-3 space-y-2">
        <div className="h-2 rounded bg-border relative">
          <span className="absolute left-[32%] -top-1 h-4 w-0.5 bg-accent" />
        </div>
        <div className="h-6 rounded bg-track-video/70 w-[78%]" />
        <div className="h-5 rounded bg-track-audio/70 w-[62%]" />
        <div className="h-4 rounded bg-track-text/80 w-[28%] ml-[8%]" />
      </div>
    </div>
  );
}
