'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'icon' | 'full' | 'inline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  href?: string;
}

const SIZE_MAP = {
  sm: { icon: 36, text: 'text-lg', subText: 'text-[10px]' },
  md: { icon: 48, text: 'text-xl sm:text-2xl', subText: 'text-xs' },
  lg: { icon: 60, text: 'text-2xl sm:text-3xl', subText: 'text-xs' },
  xl: { icon: 80, text: 'text-3xl sm:text-4xl', subText: 'text-sm' },
};

export function BrandLogo({
  variant = 'inline',
  size = 'md',
  showTagline = false,
  className = '',
  href,
}: BrandLogoProps) {
  const s = SIZE_MAP[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 3D Cube Icon Mark */}
      <div
        className="relative flex-shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ width: s.icon, height: s.icon }}
      >
        <Image
          src="/brand/medibox-icon.png"
          alt="MediBox Official Icon"
          width={s.icon * 3}
          height={s.icon * 3}
          className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(6,182,212,0.45)]"
          priority
          unoptimized
        />
      </div>

      {/* Typography for inline / full */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className={`flex items-center tracking-tight leading-none font-extrabold font-['Plus_Jakarta_Sans',sans-serif] ${s.text}`}>
            <span className="text-[var(--foreground)]">Medi</span>
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent ml-0.5">
              Box
            </span>
          </div>
          {showTagline && (
            <span
              className={`font-medium tracking-wider uppercase mt-1 text-[var(--muted-fg)] ${s.subText}`}
              style={{ letterSpacing: '0.08em' }}
            >
              Your Health. Our Priority.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
