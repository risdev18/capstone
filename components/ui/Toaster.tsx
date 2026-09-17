'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[380px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    variant?: 'default' | 'success' | 'warning' | 'destructive';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: 'bg-card border-border',
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    destructive: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  };
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        'card pointer-events-auto flex w-full items-start gap-3 rounded-xl px-4 py-3 shadow-lg transition-all',
        'data-[state=open]:animate-fade-in data-[state=closed]:opacity-0',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold text-foreground', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-xs text-muted-foreground mt-0.5', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn('btn btn-ghost btn-icon ml-auto flex-shrink-0 h-6 w-6', className)}
    {...props}
  >
    <X className="h-3.5 w-3.5" />
    <span className="sr-only">Close</span>
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

// ─── Toast State ──────────────────────────────────────────────────────────────

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  duration?: number;
}

type ToastStore = {
  toasts: ToastItem[];
  add: (t: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
};

// Simple global store (no external dependency)
let listeners: Array<(s: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];

function dispatch(next: ToastItem[]) {
  toasts = next;
  listeners.forEach((l) => l(toasts));
}

export function toast(t: Omit<ToastItem, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  dispatch([...toasts, { ...t, id }]);
  setTimeout(() => dispatch(toasts.filter((i) => i.id !== id)), t.duration ?? 4000);
}

function useToastStore(): ToastItem[] {
  const [state, setState] = React.useState<ToastItem[]>(toasts);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { listeners = listeners.filter((l) => l !== setState); };
  }, []);
  return state;
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

export function Toaster() {
  const items = useToastStore();
  return (
    <ToastProvider>
      {items.map((item) => (
        <Toast key={item.id} variant={item.variant} open>
          <div className="flex-1 min-w-0">
            <ToastTitle>{item.title}</ToastTitle>
            {item.description && <ToastDescription>{item.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
