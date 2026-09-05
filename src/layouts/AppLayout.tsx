import { currentUser } from '@/data/currentUser';
import { Logo } from '@/components/ui/Logo';
import { cx } from '@/utils/cx';
import {
  Bell,
  Clapperboard,
  FolderOpen,
  Home,
  Images,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';

const nav = [
  { to: '/dashboard', label: 'Home', icon: Home, end: true },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
  { to: '/dashboard/templates', label: 'Templates', icon: Clapperboard },
  { to: '/dashboard/ai', label: 'AI Tools', icon: Sparkles },
  { to: '/dashboard/media', label: 'Media', icon: Images },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children?: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const navigate = useNavigate();

  function commitSearch(value: string) {
    const next = value.trim();
    const params = new URLSearchParams(searchParams);
    if (next) params.set('q', next);
    else params.delete('q');
    setSearchParams(params, { replace: true });
    if (next) navigate(`/dashboard/projects?q=${encodeURIComponent(next)}`);
    else navigate('/dashboard/projects');
  }

  return (
    <div className="min-h-screen bg-app text-fg flex">
      <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r border-border bg-app-elevated">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Logo to="/dashboard" />
        </div>
        <nav className="p-3 flex flex-col gap-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-2.5 rounded-lg px-3 h-9 text-sm no-underline',
                  isActive
                    ? 'bg-panel-hover text-fg'
                    : 'text-muted hover:text-fg hover:bg-panel/80',
                )
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-3 border-t border-border">
          <div className="rounded-xl border border-border bg-panel p-3">
            <p className="text-xs text-muted">Workspace</p>
            <p className="text-sm font-medium mt-0.5">Studio Pro</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border flex items-center gap-3 px-4 bg-app-elevated/80">
          <div className="md:hidden">
            <Logo compact to="/dashboard" />
          </div>
          <label className="flex-1 max-w-xl flex items-center gap-2 h-9 rounded-lg border border-border bg-panel px-3">
            <Search size={15} className="text-subtle" />
            <input
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                const params = new URLSearchParams(searchParams);
                if (next.trim()) params.set('q', next.trim());
                else params.delete('q');
                setSearchParams(params, { replace: true });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSearch(query);
              }}
              placeholder="Search projects, templates, media"
              className="bg-transparent outline-none text-sm w-full placeholder:text-subtle"
            />
          </label>
          <button
            type="button"
            className="relative h-9 w-9 rounded-lg border border-border bg-panel text-muted hover:text-fg cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={16} className="mx-auto" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>
          <div className="flex items-center gap-2 pl-1">
            <span className="h-8 w-8 rounded-full bg-accent text-app text-xs font-semibold grid place-items-center">
              {currentUser.avatarInitials}
            </span>
            <div className="hidden lg:block leading-tight">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-[11px] text-muted capitalize">{currentUser.plan} plan</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
