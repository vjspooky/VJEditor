import { getActiveUser } from '@/data/currentUser';
import { Logo } from '@/components/ui/Logo';
import { cx } from '@/utils/cx';
import {
  Bell,
  Clapperboard,
  FolderOpen,
  Home,
  Images,
  LogOut,
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
  { to: '/media', label: 'Media', icon: Images },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children?: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const navigate = useNavigate();
  const activeUser = getActiveUser();

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
        <header className="h-14 border-b border-border flex items-center gap-2 px-2 sm:px-4 bg-app-elevated/80">
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
              placeholder="Search projects..."
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
              {activeUser.avatarInitials}
            </span>
            <div className="hidden lg:block leading-tight">
              <p className="text-sm font-medium">{activeUser.name}</p>
              <p className="text-[11px] text-muted capitalize">{activeUser.plan} plan</p>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('vjeditor_session');
                localStorage.removeItem('vjeditor_active_user');
                navigate('/login');
              }}
              title="Sign out"
              className="text-muted hover:text-danger ml-1 p-1.5 rounded-lg border border-border bg-panel hover:bg-panel-hover cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto pb-16 md:pb-0">{children ?? <Outlet />}</main>
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 border-t border-border bg-app-elevated/95 backdrop-blur flex items-center justify-around">
          {nav.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className={({ isActive }) =>
                cx('h-10 w-12 grid place-items-center rounded-lg', isActive ? 'text-accent bg-accent-soft' : 'text-muted')
              }
            >
              <item.icon size={18} />
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
