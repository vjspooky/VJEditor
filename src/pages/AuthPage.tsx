import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { api } from '@/services/api';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { FormEvent, ReactNode } from 'react';

const SESSION_KEY = 'vjeditor_session';
const ACCOUNT_KEY = 'vjeditor_local_account';

type Provider = 'Google' | 'Facebook' | 'GitHub' | 'Twitter';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('VJEditorFree2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');
  const [providerMessage, setProviderMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setProviderMessage('');
    if (!isStrongPassword(password)) {
      setError('Password must be 8+ characters with uppercase, lowercase, number, and special character.');
      setLoading(false);
      return;
    }
    try {
      const localAccount = readLocalAccount();
      if (localAccount && localAccount.email === username && localAccount.password === password) {
        localStorage.setItem(SESSION_KEY, 'true');
        navigate(destination, { replace: true });
        return;
      }
      await api.login(username, password);
      localStorage.setItem(SESSION_KEY, 'true');
      navigate(destination, { replace: true });
    } catch {
      setError('Those credentials could not be verified.');
    } finally {
      setLoading(false);
    }
  }

  function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!fullName.trim() || !username.includes('@') || !isStrongPassword(password)) {
      setError('Enter your name, a valid email, and a password with at least 8 characters.');
      return;
    }
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ name: fullName.trim(), email: username, password }));
    localStorage.setItem(SESSION_KEY, 'true');
    navigate(destination, { replace: true });
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
            <h2 className="text-3xl font-semibold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-muted mt-2">
              {mode === 'signin' ? 'Sign in to open your creative workspace.' : 'Start with a free workspace account.'}
            </p>
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

          <form onSubmit={mode === 'signin' ? handleLogin : handleCreateAccount} className="space-y-4">
            {mode === 'signup' ? (
              <label className="block">
                <span className="text-xs text-muted">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  className="mt-1 w-full h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none focus:border-accent"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="text-xs text-muted">{mode === 'signup' ? 'Email' : 'Username or email'}</span>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3 top-3 text-subtle" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  type={mode === 'signup' ? 'email' : 'text'}
                  autoComplete={mode === 'signup' ? 'email' : 'username'}
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
                  className="w-full h-10 rounded-lg border border-border bg-panel pl-9 pr-3 text-sm outline-none focus:border-accent"
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
            <PasswordStrength password={password} />
            {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading || !isStrongPassword(password)}>
              {mode === 'signup' ? 'Create account' : loading ? 'Signing in...' : 'Enter workspace'}
            </Button>
          </form>

          <p className="text-xs text-muted mt-6 text-center">
            {mode === 'signin' ? 'Demo access is prefilled for this development workspace.' : 'Your account is stored for this development workspace.'}
          </p>
          <button
            type="button"
            className="w-full mt-4 text-sm text-accent hover:underline cursor-pointer"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
          >
            {mode === 'signin' ? 'Create a new account' : 'Already have an account? Sign in'}
          </button>
          <p className="text-sm text-muted mt-8 text-center">
            <Link to="/" className="text-accent hover:underline">Back to VJEditor</Link>
          </p>
        </div>
      </section>
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

function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
}

function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase and lowercase', valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Number', valid: /\d/.test(password) },
    { label: 'Special character', valid: /[^A-Za-z\d]/.test(password) },
  ];
  return (
    <div className="rounded-lg border border-border bg-app px-3 py-2 text-xs text-muted">
      <p className={isStrongPassword(password) ? 'text-accent' : 'text-muted'}>
        {isStrongPassword(password) ? 'Strong password' : 'Password requirements'}
      </p>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
        {requirements.map((requirement) => (
          <span key={requirement.label} className={requirement.valid ? 'text-accent' : 'text-subtle'}>
            {requirement.valid ? '✓' : '○'} {requirement.label}
          </span>
        ))}
      </div>
    </div>
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
