'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context';
import type { UserRole } from '@/types/user';
import { hasRole } from '@/types/user';

interface GuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

/**
 * Wraps a page to require authentication.
 * If requiredRole is provided, also checks that the user has sufficient role.
 */
export function AuthGuard({ children, requiredRole = 'USER', redirectTo = '/login' }: GuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (profile && !hasRole(profile.role, requiredRole)) {
      router.replace('/dashboard');
    }
  }, [user, profile, loading, requiredRole, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (profile && requiredRole && !hasRole(profile.role, requiredRole)) return null;

  return <>{children}</>;
}

/**
 * Wraps auth pages (login, register) to redirect away if already authenticated.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      const isAdmin = profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN';
      router.replace(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (user && profile) return null;
  return <>{children}</>;
}
