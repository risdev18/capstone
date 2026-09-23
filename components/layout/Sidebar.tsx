'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { hasRole } from '@/types/user';
import {
  Heart,
  LayoutDashboard,
  Activity,
  History,
  Bell,
  Cpu,
  FileText,
  User,
  Settings,
  Shield,
  Users,
  X,
  AlertTriangle,
  Pill,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/health', label: 'Live Monitoring', icon: Activity },
  { href: '/health-history', label: 'Health History', icon: History },
  { href: '/medicines', label: 'Medicines', icon: Pill },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/devices', label: 'Devices', icon: Cpu },
  { href: '/reports', label: 'Reports', icon: FileText },
];

const adminItems: NavItem[] = [
  { href: '/admin', label: 'Admin Overview', icon: Shield, adminOnly: true },
  { href: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
  { href: '/admin/devices', label: 'Device Management', icon: Cpu, adminOnly: true },
  { href: '/admin/sensors', label: 'Sensors', icon: Activity, adminOnly: true },
  { href: '/admin/alerts', label: 'Thresholds', icon: AlertTriangle, adminOnly: true },
];

const bottomItems: NavItem[] = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

import { BrandLogo } from '@/components/brand/BrandLogo';

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isAdmin = profile ? hasRole(profile.role, 'ADMIN') : false;

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(mobile ? 'w-80 min-h-screen bg-[var(--card)] border-r border-[var(--border)] flex flex-col shadow-xl' : 'sidebar flex flex-col')}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-between border-b px-5" style={{ borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 w-full">
          <BrandLogo size="md" variant="inline" />
          <span className="badge badge-info text-[10px] font-bold py-0.5 px-2 ml-auto">
            {profile?.role ?? 'USER'}
          </span>
        </Link>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="mb-1 px-5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>
            Monitoring
          </p>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={mobile ? onClose : undefined}
            className={cn('sidebar-link', isActive(item.href) && 'active')}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="mt-4 mb-1 px-5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>
                Administration
              </p>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className={cn('sidebar-link', isActive(item.href) && 'active')}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="border-t py-3" style={{ borderColor: 'var(--border)' }}>
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={mobile ? onClose : undefined}
            className={cn('sidebar-link', isActive(item.href) && 'active')}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
