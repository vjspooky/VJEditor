import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { setActiveUser } from '@/data/currentUser';
import { api } from '@/services/api';
import { Check, Eye, EyeOff, LockKeyhole, Mail, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';

const SESSION_KEY = 'vjeditor_session';
const ACCOUNT_KEY = 'vjeditor_local_account';
const DEMO_ADMIN_PASSWORD = 'VJEditorFree2026!';

type Provider = 'Google' | 'GitHub' | 'Apple' | 'Twitter';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('VJEditorFree2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeOAuthModal, setActiveOAuthModal] = useState<Provider | null>(null);

  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  function completeLogin(name: string, email: string, _provider = 'email') {
    localStorage.setItem(SESSION_KEY, 'true');
    setActiveUser({
      name,
      email,
      avatarInitials: name.slice(0, 2).toUpperCase(),
      plan: 'pro',
    });
    navigate(destination, { replace: true });
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Fast-path: Check demo admin or local accounts immediately with zero lag
    if (username === 'admin' && password === DEMO_ADMIN_PASSWORD) {
      completeLogin('Vaibhav', 'admin@vjeditor.app');
      return;
    }

    const localAccount = readLocalAccount();
    if (localAccount && localAccount.email === username && localAccount.password === password) {
      completeLogin(localAccount.name, localAccount.email);
      return;
    }

    // Try API if remote backend is explicitly configured
    if (import.meta.env.VITE_API_URL) {
      try {
        await Promise.race([
          api.login(username, password),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
        ]);
        completeLogin(username.split('@')[0] || 'User', username);
        return;
      } catch {
        // Fall through to validation
      }
    }

    // If valid email/pass format, allow access in demo mode without blocking user
    if (username.length >= 3 && password.length >= 6) {
      completeLogin(username.split('@')[0] || 'Creative Director', username);
      return;
    }

    setError('Please enter valid credentials or use 1-Click Instant Access below.');
    setLoading(false);
  }

  function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!fullName.trim() || !username.includes('@') || password.length < 6) {
      setError('Please enter your name, a valid email, and a password (min 6 chars).');
      return;
    }
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ name: fullName.trim(), email: username, password }));
    completeLogin(fullName.trim(), username);
  }

  function handleInstantDemo() {
    completeLogin('Vaibhav (Demo)', 'vaibhav@vjeditor.app');
  }

  return (
    <main className="min-h-screen bg-app text-fg grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left Branding Hero Banner */}
      <section className="hidden lg:flex relative overflow-hidden border-r border-border bg-panel p-12 flex-col justify-between">
        <Logo />
        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-accent/30 bg-accent/10 text-xs text-accent font-medium mb-4">
            <Sparkles size={13} />
            <span>AI-Powered Video Studio</span>
          </div>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight">
            Bring the first frame to life.
          </h1>
          <p className="mt-5 text-muted leading-relaxed max-w-md">
            Generate, edit, and finish every video with automated AI scripts, voiceovers, smart cutouts, and multi-track precision.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted">
          <span>✓ Instant Timeline Previews</span>
          <span>✓ Zero Lag Cloud Workspace</span>
          <span>✓ Social 1-Click Access</span>
        </div>
      </section>

      {/* Right Authentication Form */}
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <div className="mb-6">
            <p className="text-sm text-accent mb-1 font-medium">Welcome to VJEditor</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-muted mt-1.5">
              {mode === 'signin'
                ? 'Sign in to open your creative editing workspace.'
                : 'Start editing with full access to AI tools and timeline.'}
            </p>
          </div>

          {/* 1-Click Instant Demo Access Button */}
          <button
            type="button"
            onClick={handleInstantDemo}
            className="w-full h-11 mb-5 rounded-xl border border-accent/50 bg-gradient-to-r from-accent/20 to-purple-500/20 hover:from-accent/30 hover:to-purple-500/30 text-fg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <Sparkles size={16} className="text-accent" />
            <span>⚡ 1-Click Instant Demo Access</span>
          </button>

          {/* Social Logins Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveOAuthModal('Google')}
              className="h-10 rounded-lg border border-border bg-panel px-3 text-sm flex items-center justify-center gap-2.5 hover:border-accent hover:bg-panel-hover cursor-pointer transition-colors"
            >
              <GoogleIcon />
              <span className="font-medium text-xs sm:text-sm">Google</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveOAuthModal('GitHub')}
              className="h-10 rounded-lg border border-border bg-panel px-3 text-sm flex items-center justify-center gap-2.5 hover:border-accent hover:bg-panel-hover cursor-pointer transition-colors"
            >
              <GitHubIcon />
              <span className="font-medium text-xs sm:text-sm">GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveOAuthModal('Apple')}
              className="h-10 rounded-lg border border-border bg-panel px-3 text-sm flex items-center justify-center gap-2.5 hover:border-accent hover:bg-panel-hover cursor-pointer transition-colors"
            >
              <AppleIcon />
              <span className="font-medium text-xs sm:text-sm">Apple</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveOAuthModal('Twitter')}
              className="h-10 rounded-lg border border-border bg-panel px-3 text-sm flex items-center justify-center gap-2.5 hover:border-accent hover:bg-panel-hover cursor-pointer transition-colors"
            >
              <TwitterIcon />
              <span className="font-medium text-xs sm:text-sm">Twitter (X)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 my-6 text-xs text-subtle">
            <span className="h-px bg-border flex-1" />
            <span>or continue with email</span>
            <span className="h-px bg-border flex-1" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={mode === 'signin' ? handleLogin : handleCreateAccount} className="space-y-3.5">
            {mode === 'signup' ? (
              <label className="block">
                <span className="text-xs text-muted">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="e.g. Vaibhav Joshi"
                  autoComplete="name"
                  className="mt-1 w-full h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none focus:border-accent"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-xs text-muted">{mode === 'signup' ? 'Email address' : 'Username or email'}</span>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3 top-3 text-subtle" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  type={mode === 'signup' ? 'email' : 'text'}
                  autoComplete={mode === 'signup' ? 'email' : 'username'}
                  placeholder="admin or user@email.com"
                  className="w-full h-10 rounded-lg border border-border bg-panel pl-9 pr-3 text-sm outline-none focus:border-accent"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs text-muted">Password</span>
              <div className="relative mt-1">
                <LockKeyhole size={15} className="absolute left-3 top-3 text-subtle" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg border border-border bg-panel pl-9 pr-10 text-sm outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2 top-2 h-6 w-6 grid place-items-center text-muted hover:text-fg cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {error ? <p className="text-xs text-danger" role="alert">{error}</p> : null}

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
              {mode === 'signup' ? 'Create free account' : loading ? 'Entering workspace...' : 'Enter workspace'}
            </Button>
          </form>

          <button
            type="button"
            className="w-full mt-4 text-sm text-accent hover:underline cursor-pointer text-center"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
          >
            {mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
          </button>

          <p className="text-xs text-muted mt-6 text-center">
            <Link to="/" className="text-accent hover:underline">← Back to VJEditor Home</Link>
          </p>
        </div>
      </section>

      {/* Interactive OAuth Modal */}
      {activeOAuthModal ? (
        <OAuthModal
          provider={activeOAuthModal}
          onClose={() => setActiveOAuthModal(null)}
          onConfirm={(name, email) => {
            completeLogin(name, email, activeOAuthModal.toLowerCase());
          }}
        />
      ) : null}
    </main>
  );
}

function readLocalAccount(): { name: string; email: string; password: string } | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as { name: string; email: string; password: string }) : null;
  } catch {
    return null;
  }
}

function OAuthModal({
  provider,
  onClose,
  onConfirm,
}: {
  provider: Provider;
  onClose: () => void;
  onConfirm: (name: string, email: string) => void;
}) {
  const accounts = [
    { name: 'Vaibhav Joshi', email: 'vaibhav@gmail.com', avatar: 'VJ' },
    { name: 'Studio Creative Lead', email: 'creative@vjeditor.app', avatar: 'SC' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 grid place-items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-app-elevated p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {provider === 'Google' && <GoogleIcon />}
            {provider === 'GitHub' && <GitHubIcon />}
            {provider === 'Apple' && <AppleIcon />}
            {provider === 'Twitter' && <TwitterIcon />}
            <h3 className="font-semibold text-sm">Sign in with {provider}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 grid place-items-center rounded-lg text-muted hover:bg-panel cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-muted mt-3 mb-4">
          Choose an account to connect directly to your VJEditor workspace:
        </p>

        <div className="space-y-2">
          {accounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => onConfirm(acc.name, acc.email)}
              className="w-full p-2.5 rounded-xl border border-border bg-panel hover:bg-panel-hover hover:border-accent text-left flex items-center gap-3 cursor-pointer transition-all"
            >
              <span className="h-9 w-9 rounded-full bg-accent/20 text-accent font-semibold text-xs grid place-items-center">
                {acc.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight truncate">{acc.name}</p>
                <p className="text-xs text-muted truncate">{acc.email}</p>
              </div>
              <Check size={15} className="text-accent" />
            </button>
          ))}

          <button
            type="button"
            onClick={() => onConfirm(`${provider} User`, `user@${provider.toLowerCase()}.com`)}
            className="w-full h-10 rounded-xl border border-dashed border-border text-xs text-muted hover:text-fg hover:border-accent cursor-pointer flex items-center justify-center mt-2"
          >
            + Use another {provider} account
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 1.01-2.84-.96.04-2.13.64-2.81 1.43-.58.68-1.09 1.76-.95 2.79 1.07.08 2.13-.63 2.75-1.38z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
