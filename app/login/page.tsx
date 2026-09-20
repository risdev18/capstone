'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from './useForm';
import { useAuth } from '@/lib/auth/context';
import { loginSchema } from '@/lib/validation/schemas';
import { toast } from '@/components/ui/Toaster';
import { Heart, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { values, errors, handleChange, validate } = useForm({
    email: '',
    password: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      validate(result.error);
      return;
    }

    setLoading(true);
    try {
      await login(values.email, values.password);
      toast({ title: 'Welcome back!', variant: 'success' });
      router.replace('/dashboard');
    } catch (err: unknown) {
      console.error('Login Error:', err);
      const msg = getFirebaseErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SmartHealth Box</h1>
              <p className="text-white/70 text-sm">Connected Health Monitoring</p>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Monitor health,<br />intelligently.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Real-time IoT sensor monitoring, trend analytics, and configurable alerts — 
            all in one secure dashboard.
          </p>
          <div className="mt-10 space-y-3">
            {['Real-time ESP32 sensor data', 'Role-based access control', 'Interactive health charts', 'Intelligent alert system'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="btn btn-ghost btn-sm mb-8 -ml-2 flex items-center gap-1.5 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl hero-gradient shadow-lg shadow-sky-500/20 mb-4">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Sign in</h2>
            <p style={{ color: 'var(--muted-fg)' }} className="text-sm">
              Enter your credentials to access your health dashboard.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm"
              style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="label">Email address</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'border-red-400' : ''}`}
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange('email')}
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="label">Password</label>
                <Link href="/forgot-password" className="text-xs text-sky-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                  value={values.password}
                  onChange={handleChange('password')}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-fg)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-sky-500 font-medium hover:underline">
              Create one
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 demo-banner rounded-xl">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              Demo mode available after login — no physical device required.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFirebaseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email address or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact an administrator.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.';
      default:
        return 'Sign in failed. Please try again.';
    }
  }
  return 'Sign in failed. Please try again.';
}
