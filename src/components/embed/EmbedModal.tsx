import { Button } from '@/components/ui/Button';
import { Check, Copy, ExternalLink, Globe, Maximize2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface EmbedModalProps {
  projectId?: string;
  projectName?: string;
  onClose: () => void;
}

export function EmbedModal({ projectId = 'proj_travel', projectName = 'Alpine Lake Sunrise', onClose }: EmbedModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedGoogleSites, setCopiedGoogleSites] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sites.google.com';
  const basePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/editor.*$/, '') : '';
  const googleSitesEmbedUrl = 'https://sites.google.com/view/vjeditor/full-page-embed';

  const embedPath = `${basePath}/#/full-page-embed/${projectId}?theme=${theme}${hideHeader ? '&hideHeader=1' : ''}`;
  const directEmbedUrl = `${origin}${embedPath}`;

  const iframeSnippet = `<iframe
  src="${directEmbedUrl}"
  width="100%"
  height="100%"
  style="border:none; width:100%; height:100vh;"
  allow="autoplay; fullscreen; camera; microphone; clipboard-write"
  loading="lazy"
></iframe>`;

  const googleSitesSnippet = `<iframe
  src="${googleSitesEmbedUrl}"
  width="100%"
  height="100%"
  style="border:0; position:fixed; top:0; left:0; right:0; bottom:0; width:100%; height:100%;"
  allow="autoplay; fullscreen; camera; microphone"
  frameborder="0"
></iframe>`;

  function copyText(text: string, setCopied: (val: boolean) => void) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border bg-app-elevated shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-panel">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/30 grid place-items-center text-accent">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-fg">Google Sites & Web Full-Page Embed</h2>
              <p className="text-[11px] text-muted">Embed "{projectName}" studio seamlessly into Google Sites or any web page</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-fg cursor-pointer p-1 rounded-lg hover:bg-panel-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Target URL banner */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-3.5 flex items-start gap-3">
            <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-fg">Target Embed URL</p>
              <p className="text-muted font-mono text-[11px] break-all">{googleSitesEmbedUrl}</p>
              <p className="text-[11px] text-muted">
                Fully compatible with Google Sites Full Page Embed, Notion, Webflow, and custom HTML host pages.
              </p>
            </div>
          </div>

          {/* Configuration options */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider font-semibold text-muted">Embed Preferences</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs text-fg border border-border bg-panel p-2.5 rounded-xl cursor-pointer hover:border-muted">
                <input
                  type="checkbox"
                  checked={hideHeader}
                  onChange={(e) => setHideHeader(e.target.checked)}
                  className="rounded border-border accent-accent"
                />
                <span>Hide Embedded Top Bar</span>
              </label>

              <div className="flex items-center justify-between border border-border bg-panel p-2 rounded-xl text-xs">
                <span className="text-muted px-1">Theme</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                      theme === 'dark' ? 'bg-accent text-white' : 'text-muted hover:text-fg'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                      theme === 'light' ? 'bg-accent text-white' : 'text-muted hover:text-fg'
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Google Sites Full Page Embed Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-semibold text-muted flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                Google Sites Full Page Embed Snippet
              </label>
              <button
                type="button"
                onClick={() => copyText(googleSitesSnippet, setCopiedGoogleSites)}
                className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedGoogleSites ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedGoogleSites ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3 rounded-xl border border-border bg-panel font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap select-all">
              {googleSitesSnippet}
            </pre>
          </div>

          {/* Section 2: Standard HTML iFrame Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-semibold text-muted">
                Generic Web iFrame Snippet
              </label>
              <button
                type="button"
                onClick={() => copyText(iframeSnippet, setCopiedIframe)}
                className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedIframe ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedIframe ? 'Copied!' : 'Copy HTML'}
              </button>
            </div>
            <pre className="p-3 rounded-xl border border-border bg-panel font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap select-all">
              {iframeSnippet}
            </pre>
          </div>

          {/* Section 3: Direct Link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-semibold text-muted">Direct Embed URL</label>
              <button
                type="button"
                onClick={() => copyText(directEmbedUrl, setCopiedLink)}
                className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedLink ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={directEmbedUrl}
                className="flex-1 rounded-xl border border-border bg-panel px-3 py-2 text-xs font-mono text-fg outline-none select-all"
              />
              <a
                href={directEmbedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl border border-border bg-panel hover:bg-panel-hover text-fg text-xs flex items-center gap-1.5 no-underline shrink-0"
              >
                <ExternalLink size={13} /> Test
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border bg-panel flex items-center justify-between">
          <a
            href={googleSitesEmbedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-accent hover:underline flex items-center gap-1.5"
          >
            <Maximize2 size={13} /> Open Google Sites Full Page Embed
          </a>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
