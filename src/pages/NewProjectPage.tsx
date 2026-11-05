import { Button } from '@/components/ui/Button';
import { AppLayout } from '@/layouts/AppLayout';
import { projectService } from '@/services/projectService';
import type { AspectRatio, ProjectSource } from '@/types';
import { Clapperboard, FileVideo, Sparkles, Upload } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const durations = [15, 30, 60, 90];
const ratios: AspectRatio[] = ['16:9', '9:16', '1:1', '4:5'];
const languages = ['English', 'Hindi', 'Spanish', 'French'];
const voices = ['Alloy', 'Cove', 'Maya', 'Ravi'];
const styles = ['Cinematic', 'UGC', 'Documentary', 'Motion graphics'];

export function NewProjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const presetSource = (location.state as { source?: ProjectSource } | null)?.source;
  const [source, setSource] = useState<ProjectSource>(presetSource ?? 'ai');
  const [prompt, setPrompt] = useState(
    'Create a 60-second motivational video about student life.',
  );
  const [duration, setDuration] = useState(60);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [language, setLanguage] = useState('English');
  const [voice, setVoice] = useState('Cove');
  const [style, setStyle] = useState('Cinematic');
  const [name, setName] = useState('Untitled Project');
  const [creating, setCreating] = useState(false);

  const options = useMemo(
    () => [
      { id: 'blank' as const, title: 'Blank Project', icon: FileVideo, body: 'Start with an empty timeline.' },
      { id: 'ai' as const, title: 'AI Video', icon: Sparkles, body: 'Describe a video and generate a first cut.' },
      { id: 'import' as const, title: 'Import Video', icon: Upload, body: 'Bring existing footage into the editor.' },
      { id: 'template' as const, title: 'Use Template', icon: Clapperboard, body: 'Start from a structured layout.' },
    ],
    [],
  );

  async function createAndOpen() {
    setCreating(true);
    const created = await projectService.create({
      name:
        source === 'ai'
          ? name || 'AI Video'
          : source === 'template'
            ? name || 'Template Project'
            : name || 'Untitled Project',
      source,
      duration,
      aspectRatio,
      prompt: source === 'ai' ? prompt : undefined,
      language,
      voice,
      style,
    });
    navigate(`/editor/${created.project.id}`);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
        <p className="text-sm text-muted mt-1 mb-6">
          Choose a starting point. AI generation itself ships in a later phase — this creates a real
          project and opens the editor.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSource(option.id)}
              className={`text-left rounded-2xl border p-4 cursor-pointer ${
                source === option.id
                  ? 'border-accent bg-accent-soft'
                  : 'border-border bg-panel hover:border-border-strong'
              }`}
            >
              <option.icon size={18} className="text-accent mb-3" />
              <p className="text-sm font-medium">{option.title}</p>
              <p className="text-xs text-muted mt-1">{option.body}</p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-panel p-5 space-y-4">
          <label className="block">
            <span className="text-xs text-muted">Project name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full h-10 rounded-lg border border-border bg-app px-3 text-sm outline-none"
            />
          </label>

          {source === 'ai' ? (
            <label className="block">
              <span className="text-xs text-muted">Describe the video you want to create</span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-border bg-app px-3 py-2 text-sm outline-none resize-y"
              />
            </label>
          ) : null}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Video duration">
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1 w-full h-10 rounded-lg border border-border bg-app px-3 text-sm outline-none"
              >
                {durations.map((d) => (
                  <option key={d} value={d}>
                    {d}s
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Aspect ratio">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="mt-1 w-full h-10 rounded-lg border border-border bg-app px-3 text-sm outline-none"
              >
                {ratios.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Language">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full h-10 rounded-lg border border-border bg-app px-3 text-sm outline-none"
              >
                {languages.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Voice">
              <select value={voice} onChange={(e) => setVoice(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-border bg-app px-3 text-sm outline-none">
                {voices.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Style">
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-border bg-app px-3 text-sm outline-none">
              {styles.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>

          <div className="pt-2">
            <Button variant="primary" onClick={createAndOpen} disabled={creating}>
              {creating ? 'Creating...' : source === 'ai' ? 'Generate Video' : 'Create Project'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
