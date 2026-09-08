import { Button } from '@/components/ui/Button';
import { useEditor } from '@/features/editor/EditorProvider';
import type { TextAnimation, TextLayer } from '@/types';
import { Sparkles, Type } from 'lucide-react';

interface TextPreset {
  name: string;
  category: string;
  preset: Partial<TextLayer>;
}

const TEXT_PRESETS: TextPreset[] = [
  {
    name: 'Main Heading',
    category: 'Basic',
    preset: {
      text: 'MAIN HEADING',
      fontFamily: 'Inter',
      fontSize: 56,
      fontWeight: 800,
      color: '#FFFFFF',
      align: 'center',
      animation: 'fade-in',
      shadowColor: 'rgba(0,0,0,0.7)',
      shadowBlur: 8,
    },
  },
  {
    name: 'Subtitle',
    category: 'Basic',
    preset: {
      text: 'Supporting line or explanation',
      fontFamily: 'Inter',
      fontSize: 28,
      fontWeight: 500,
      color: '#E2E8F0',
      align: 'center',
      animation: 'slide-up',
    },
  },
  {
    name: 'Lower Third',
    category: 'Broadcast',
    preset: {
      text: 'Alex Morgan\nCreative Director',
      fontFamily: 'Inter',
      fontSize: 22,
      fontWeight: 600,
      color: '#FFFFFF',
      align: 'left',
      positionX: -200,
      positionY: 200,
      backgroundColor: '#0F172A',
      backgroundOpacity: 85,
      padding: 12,
      borderRadius: 8,
      animation: 'slide-left',
    },
  },
  {
    name: 'Modern Bold',
    category: 'Styles',
    preset: {
      text: 'MAKE AN IMPACT',
      fontFamily: 'Montserrat',
      fontSize: 64,
      fontWeight: 900,
      color: '#FACC15',
      letterSpacing: 2,
      align: 'center',
      strokeColor: '#000000',
      strokeWidth: 2,
      animation: 'pop',
    },
  },
  {
    name: 'Social Media Callout',
    category: 'Social',
    preset: {
      text: '@vjeditor • FOLLOW FOR MORE',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 700,
      color: '#FFFFFF',
      backgroundColor: '#EF4444',
      backgroundOpacity: 95,
      padding: 10,
      borderRadius: 20,
      align: 'center',
      animation: 'pop',
    },
  },
  {
    name: 'Minimal Clean',
    category: 'Styles',
    preset: {
      text: 'aesthetic moment',
      fontFamily: 'Georgia',
      fontSize: 32,
      fontWeight: 400,
      fontStyle: 'italic',
      color: '#F1F5F9',
      align: 'center',
      letterSpacing: 4,
      animation: 'fade-in',
    },
  },
  {
    name: 'Typewriter Headline',
    category: 'Animated',
    preset: {
      text: 'The story begins here...',
      fontFamily: 'Courier New',
      fontSize: 36,
      fontWeight: 700,
      color: '#38BDF8',
      align: 'center',
      animation: 'typewriter',
    },
  },
];

const ANIMATION_OPTIONS: { id: TextAnimation; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'fade-in', label: 'Fade In' },
  { id: 'fade-out', label: 'Fade Out' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'pop', label: 'Pop Bounce' },
  { id: 'typewriter', label: 'Typewriter' },
];

export function TextPanel() {
  const { dispatch } = useEditor();

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full text-xs">
      <div>
        <Button
          variant="primary"
          className="w-full h-9"
          onClick={() => dispatch({ type: 'add-text' })}
        >
          <Type size={14} />
          Add Text Layer
        </Button>
      </div>

      {/* Quick Text Creation */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Quick Text
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            className="justify-start text-xs font-bold"
            onClick={() =>
              dispatch({
                type: 'add-text',
                preset: { text: 'Heading', fontSize: 48, fontWeight: 700 },
              })
            }
          >
            Heading
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="justify-start text-xs font-medium"
            onClick={() =>
              dispatch({
                type: 'add-text',
                preset: { text: 'Subtitle', fontSize: 28, fontWeight: 500 },
              })
            }
          >
            Subtitle
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="justify-start text-xs col-span-2 text-muted"
            onClick={() =>
              dispatch({
                type: 'add-text',
                preset: { text: 'Body paragraph text goes here.', fontSize: 20, fontWeight: 400 },
              })
            }
          >
            Body Text
          </Button>
        </div>
      </div>

      {/* Text Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Styles & Presets
          </p>
          <Sparkles size={12} className="text-accent" />
        </div>

        <div className="space-y-2">
          {TEXT_PRESETS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => dispatch({ type: 'add-text', preset: item.preset })}
              className="w-full p-2.5 rounded-xl border border-border bg-panel text-left cursor-pointer hover:border-accent hover:bg-panel-hover transition group"
            >
              <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                <span>{item.name}</span>
                <span className="opacity-60">{item.category}</span>
              </div>
              <p
                className="truncate text-sm"
                style={{
                  fontFamily: item.preset.fontFamily,
                  fontWeight: item.preset.fontWeight,
                  color: item.preset.color,
                }}
              >
                {item.preset.text?.replace('\n', ' • ')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Animations info */}
      <div className="p-3 rounded-xl bg-panel border border-border space-y-1.5 text-muted">
        <p className="font-medium text-fg text-[11px]">Supported Animations</p>
        <p className="text-[10px] leading-relaxed">
          Select any text layer on timeline to customize fonts, colors, strokes, drop shadows, and animations in the Properties panel.
        </p>
        <div className="flex flex-wrap gap-1 pt-1">
          {ANIMATION_OPTIONS.map((a) => (
            <span key={a.id} className="px-1.5 py-0.5 rounded bg-app text-[9px] text-fg">
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
