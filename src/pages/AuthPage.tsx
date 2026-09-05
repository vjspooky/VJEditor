import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { api } from '@/services/api';
import { LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { FormEvent, ReactNode } from 'react';

const SESSION_KEY = 'vjeditor_session';

type Provider = 'Google' | 'Facebook' | 'GitHub' | 'Twitter';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('VJEditorFree2026!');
  const [error, setError] = useState('');
  const [providerMessage, setProviderMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setProviderMessage('');
    try {
      await api.login(username, password);
      localStorage.setItem(SESSION_KEY, 'true');
      navigate(destination, { replace: true });
    } catch {
      setError('Those credentials could not be verified.');
    } finally {
      setLoading(false);
    }
  }

  function handleProvider(provider: Provider) {
    setError('');
    setProviderMessage(`${provider} sign-in needs its OAuth client configuration before it can be enabled.`);
  }

  return (
    <main className="min-h-screen bg-app text-fg grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden lg:flex relative overflow-hidden border-r border-border bg-panel p-12 flex-col justify-between">
        <Logo />
        <div className="relative max-w-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-accent mb-4">Your creative workspace</p>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight">
            Bring the first frame to life.
          </h1>
          <p className="mt-5 text-muted leading-relaxed max-w-md">
            Generate, edit, and finish every video in one focused workspace.
          </p>
        </div>
        <p className="text-xs text-muted">Secure access for your projects and drafts.</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <Logo />
          </div>
          <div className="mb-8">
            <p className="text-sm text-accent mb-2">Welcome to VJEditor</p>
            <h2 className="text-3xl font-semibold tracking-tight">Create your account</h2>
            <p className="text-sm text-muted mt-2">Enter your workspace through a connected account.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ProviderButton label="Google" mark="G" onClick={() => handleProvider('Google')} />
            <ProviderButton label="Facebook" mark="f" onClick={() => handleProvider('Facebook')} />
            <ProviderButton label="GitHub" mark="gh" onClick={() => handleProvider('GitHub')} />
            <ProviderButton label="Twitter" mark="X" onClick={() => handleProvider('Twitter')} />
          </div>

          {providerMessage ? <p className="mt-3 text-xs text-muted" role="status">{providerMessage}</p> : null}

          <div className="flex items-center gap-3 my-7 text-xs text-subtle">
            <span className="h-px bg-border flex-1" />
            <span>or use workspace login</span>
            <span className="h-px bg-border flex-1" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="text-xs text-muted">Username</span>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3 top-3 text-subtle" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  className="w-full h-10 rounded-lg border border-border bg-panel pl-9 pr-3 text-sm outline-none focus:border-accent"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs text-muted">Password</span>
              <div className="relative mt-1">
                <LockKeyhole size={15} className="absolute left-3 top-3 text-subtle" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="w-full h-10 rounded-lg border border-border bg-panel pl-9 pr-3 text-sm outline-none focus:border-accent"
                />
              </div>
            </label>
            {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Enter workspace'}
            </Button>
          </form>

          <p className="text-xs text-muted mt-6 text-center">
            Demo access is prefilled for this development workspace.
          </p>
          <p className="text-sm text-muted mt-8 text-center">
            <Link to="/" className="text-accent hover:underline">Back to VJEditor</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function ProviderButton({
  label,
  mark,
  icon,
  onClick,
}: {
  label: Provider;
  mark?: string;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-lg border border-border bg-panel px-3 text-sm flex items-center justify-center gap-2 hover:border-border-strong cursor-pointer"
    >
      <span className="w-4 text-center font-semibold">{icon ?? mark}</span>
      {label}
    </button>
  );
}
