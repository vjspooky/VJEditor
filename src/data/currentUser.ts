import type { User } from '@/types';

export const defaultUser: User = {
  id: 'user_demo',
  name: 'Vaibhav',
  email: 'vaibhav@vjeditor.app',
  avatarInitials: 'VJ',
  plan: 'pro',
};

export const currentUser: User = defaultUser;

export function getActiveUser(): User {
  try {
    const raw = localStorage.getItem('vjeditor_active_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name) {
        return {
          id: parsed.id || 'user_active',
          name: parsed.name,
          email: parsed.email || 'user@vjeditor.app',
          avatarInitials: parsed.avatarInitials || getInitials(parsed.name),
          plan: parsed.plan || 'pro',
        };
      }
    }
    const accRaw = localStorage.getItem('vjeditor_local_account');
    if (accRaw) {
      const parsed = JSON.parse(accRaw);
      if (parsed.name) {
        return {
          id: 'user_local',
          name: parsed.name,
          email: parsed.email,
          avatarInitials: getInitials(parsed.name),
          plan: 'pro',
        };
      }
    }
  } catch {
    // fallback
  }
  return defaultUser;
}

export function setActiveUser(user: Partial<User>): void {
  try {
    const active = { ...defaultUser, ...user };
    if (!active.avatarInitials && active.name) {
      active.avatarInitials = getInitials(active.name);
    }
    localStorage.setItem('vjeditor_active_user', JSON.stringify(active));
  } catch {
    // Ignore
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
