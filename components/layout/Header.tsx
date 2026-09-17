'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/lib/auth/context';
import { toast } from '@/components/ui/Toaster';
import {
  Menu,
  Sun,
  Moon,
  Monitor,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { profile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast({ title: 'Signed out', variant: 'default' });
    router.replace('/login');
  }

  const initials = profile?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <>
      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar mobile onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <header
        className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            className="btn btn-ghost btn-icon lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title && <h1 className="text-base font-semibold">{title}</h1>}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <div className="relative">
            <button
              id="theme-toggle-btn"
              className="btn btn-ghost btn-icon"
              onClick={() => setThemeOpen(!themeOpen)}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> :
               theme === 'light' ? <Sun className="h-4 w-4" /> :
               <Monitor className="h-4 w-4" />}
            </button>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                <div className="absolute right-0 top-10 z-20 card rounded-xl shadow-lg py-1 min-w-[140px]">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'system', icon: Monitor, label: 'System' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      className={`btn btn-ghost w-full justify-start gap-2 rounded-none px-4 py-2 text-sm ${theme === t.value ? 'text-sky-500' : ''}`}
                      onClick={() => { setTheme(t.value as any); setThemeOpen(false); }}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <Link href="/alerts" className="btn btn-ghost btn-icon relative" aria-label="Alerts">
            <Bell className="h-4 w-4" />
            {/* Unread badge — to be wired up with real data */}
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              id="user-menu-btn"
              className="flex items-center gap-2 btn btn-ghost rounded-xl px-3 py-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full hero-gradient text-white text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                {profile?.name ?? 'Loading…'}
              </span>
              <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--muted-fg)' }} />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-20 card rounded-xl shadow-lg py-1 min-w-[200px]">
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold truncate">{profile?.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-fg)' }}>{profile?.email}</p>
                    <span className="badge badge-info mt-1 text-[10px]">{profile?.role}</span>
                  </div>
                  <Link href="/profile" className="btn btn-ghost w-full justify-start gap-2 rounded-none px-4 py-2 text-sm"
                    onClick={() => setUserMenuOpen(false)}>
                    <User className="h-3.5 w-3.5" /> Profile
                  </Link>
                  <Link href="/settings" className="btn btn-ghost w-full justify-start gap-2 rounded-none px-4 py-2 text-sm"
                    onClick={() => setUserMenuOpen(false)}>
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </Link>
                  <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                  <button
                    id="logout-btn"
                    className="btn btn-ghost w-full justify-start gap-2 rounded-none px-4 py-2 text-sm text-red-500"
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
