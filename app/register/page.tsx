'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { registerSchema } from '@/lib/validation/schemas';
import { toast } from '@/components/ui/Toaster';
import { Heart, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { BrandLogo } from '@/components/brand/BrandLogo';

type Step = 1 | 2;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    height: '',
    weight: '',
    bloodGroup: '',
  });

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((err) => ({ ...err, [field]: '' }));
    };
  }

  function validateStep1() {
    const step1Schema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(100),
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

    const result = step1Schema.safeParse(form);
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !map[key]) map[key] = issue.message;
      }
      setErrors(map);
      return false;
    }
    return true;
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...form,
      gender: form.gender || undefined,
      phone: form.phone ? form.phone.trim() : undefined,
      emergencyContactPhone: form.emergencyContactPhone ? form.emergencyContactPhone.trim() : undefined,
      emergencyContactName: form.emergencyContactName ? form.emergencyContactName.trim() : undefined,
      height: form.height ? parseFloat(form.height) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      bloodGroup: form.bloodGroup || undefined,
    };

    const result = registerSchema.safeParse(payload);
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !map[key]) map[key] = issue.message;
      }
      setErrors(map);
      setLoading(false);
      const firstErrorKey = Object.keys(map)[0];
      if (firstErrorKey) {
        toast({ title: 'Validation Notice', description: `${firstErrorKey}: ${map[firstErrorKey]}`, variant: 'destructive' });
      }
      return;
    }

    try {
      await register(form.email, form.password, {
        name: form.name,
        phone: form.phone ? form.phone.trim() : undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: (form.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined) || undefined,
        emergencyContact: form.emergencyContactName
          ? { name: form.emergencyContactName.trim(), phone: (form.emergencyContactPhone || '').trim() }
          : undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        bloodGroup: form.bloodGroup || undefined,
      });
      toast({ title: 'Account created!', description: 'Welcome to MediBox.', variant: 'success' });
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 8 characters.');
      } else {
        setError(`Registration offline: ${(err as Error).message || 'Cloud unreachable'}. You can still enter the dashboard with this profile below.`);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOfflineContinue() {
    if (typeof window !== 'undefined') {
      const customProfile = {
        uid: 'user-' + Date.now(),
        name: form.name || 'MediBox User',
        email: form.email || 'user@medibox.io',
        role: 'USER' as const,
        status: 'ACTIVE' as const,
        assignedDeviceId: 'esp32-live-001',
        phone: form.phone ? form.phone.trim() : undefined,
        bloodGroup: form.bloodGroup || undefined,
        height: form.height ? parseFloat(form.height) : 170,
        weight: form.weight ? parseFloat(form.weight) : 70,
        emergencyContact: form.emergencyContactName ? {
          name: form.emergencyContactName.trim(),
          phone: (form.emergencyContactPhone || '').trim()
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      sessionStorage.setItem('medibox_demo_session', 'true');
      sessionStorage.setItem('medibox_user_profile', JSON.stringify(customProfile));
      toast({ title: 'Welcome to MediBox!', description: `Signed in as ${customProfile.name}`, variant: 'success' });
      window.location.href = '/dashboard';
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <BrandLogo size="lg" variant="icon" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MediBox</h1>
              <p className="text-white/80 text-sm">Connected Health &amp; Pillbox Hub</p>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Start monitoring<br />your health today.
          </h2>
          <p className="text-white/85 text-base leading-relaxed mb-10">
            Create your account to access real-time health readings, 15-slot pillbox tracking, and intelligent clinical alerts.
          </p>
          {/* Step progress */}
          <div className="space-y-4">
            {[
              { n: 1, label: 'Account Details', done: step > 1 },
              { n: 2, label: 'Personal Information', done: false },
            ].map((s) => (
              <div key={s.n} className={`flex items-center gap-3 ${s.n === step ? 'text-white' : 'text-white/50'}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  s.done ? 'bg-white border-white text-blue-600' :
                  s.n === step ? 'border-white text-white' : 'border-white/40 text-white/40'
                }`}>
                  {s.done ? <CheckCircle className="h-4 w-4 text-blue-600" /> : s.n}
                </div>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="btn btn-ghost btn-sm mb-8 -ml-2 flex items-center gap-1.5 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="mb-4">
              <BrandLogo size="md" variant="inline" />
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {step === 1 ? 'Create account' : 'Personal details'}
            </h2>
            <p style={{ color: 'var(--muted-fg)' }} className="text-sm">
              {step === 1
                ? 'Step 1 of 2 — Account credentials'
                : 'Step 2 of 2 — Optional but recommended'}
            </p>
          </div>

          {error && (
            <div className="mb-4 space-y-2">
              <div className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm"
                style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs leading-relaxed">{error}</div>
              </div>
              <button
                type="button"
                onClick={handleOfflineContinue}
                className="btn btn-secondary w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-2 border-sky-500/40 text-sky-400 hover:bg-sky-500/10"
              >
                Continue into Dashboard with this profile (Demo / Local Mode) →
              </button>
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={goToStep2} className="space-y-4" noValidate>
              <div>
                <label htmlFor="reg-name" className="label">Full name *</label>
                <input id="reg-name" type="text" autoComplete="name" className={`input ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="Rishabh Sonawane" value={form.name} onChange={handleChange('name')} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="reg-email" className="label">Email address *</label>
                <input id="reg-email" type="email" autoComplete="email" className={`input ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="you@example.com" value={form.email} onChange={handleChange('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="reg-password" className="label">Password *</label>
                <div className="relative">
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password} onChange={handleChange('password')} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="reg-confirm" className="label">Confirm password *</label>
                <div className="relative">
                  <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                    className={`input pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={handleChange('confirmPassword')} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon"
                    onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
              <button id="reg-next-btn" type="submit" className="btn btn-primary w-full mt-2 btn-pop">
                Continue <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-phone" className="label">Phone number</label>
                  <input id="reg-phone" type="tel" autoComplete="tel" className={`input ${errors.phone ? 'border-red-400' : ''}`}
                    placeholder="+91 99999 99999" value={form.phone} onChange={handleChange('phone')} />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="reg-dob" className="label">Date of birth</label>
                  <input id="reg-dob" type="date" className="input"
                    value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} />
                </div>
              </div>
              <div>
                <label htmlFor="reg-gender" className="label">Gender</label>
                <select id="reg-gender" className="input" value={form.gender} onChange={handleChange('gender')}>
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-height" className="label">Height (cm)</label>
                  <input id="reg-height" type="number" className={`input ${errors.height ? 'border-red-400' : ''}`} placeholder="170"
                    value={form.height} onChange={handleChange('height')} />
                  {errors.height && <p className="mt-1 text-xs text-red-500">{errors.height}</p>}
                </div>
                <div>
                  <label htmlFor="reg-weight" className="label">Weight (kg)</label>
                  <input id="reg-weight" type="number" className={`input ${errors.weight ? 'border-red-400' : ''}`} placeholder="65"
                    value={form.weight} onChange={handleChange('weight')} />
                  {errors.weight && <p className="mt-1 text-xs text-red-500">{errors.weight}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="reg-blood" className="label">Blood group</label>
                <select id="reg-blood" className="input" value={form.bloodGroup} onChange={handleChange('bloodGroup')}>
                  <option value="">Unknown</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-fg)' }}>Emergency Contact (optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-ec-name" className="label">Name</label>
                    <input id="reg-ec-name" type="text" className="input" placeholder="Contact name"
                      value={form.emergencyContactName} onChange={handleChange('emergencyContactName')} />
                  </div>
                  <div>
                    <label htmlFor="reg-ec-phone" className="label">Phone</label>
                    <input id="reg-ec-phone" type="tel" className={`input ${errors.emergencyContactPhone ? 'border-red-400' : ''}`} placeholder="+91..."
                      value={form.emergencyContactPhone} onChange={handleChange('emergencyContactPhone')} />
                    {errors.emergencyContactPhone && <p className="mt-1 text-xs text-red-500">{errors.emergencyContactPhone}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button id="reg-submit-btn" type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-fg)' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-sky-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
