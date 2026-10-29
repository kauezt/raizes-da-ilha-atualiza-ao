import React from 'react';
import { useApp } from '../context/AppContext';

interface RootsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
}

export const RootsLogo: React.FC<RootsLogoProps> = ({ className = '', size = 'md', hideText = false }) => {
  const { settings } = useApp();

  const heightClass = size === 'sm' ? 'h-9' : size === 'lg' ? 'h-16' : 'h-12';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  if (settings.logo) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={settings.logo}
          alt={settings.name}
          className={`${heightClass} w-auto object-contain`}
        />
        {!hideText && (
          <span className={`font-serif font-semibold tracking-wider text-[#f3eddc] ${textClass}`}>
            {settings.name.toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 60 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className={`${heightClass} w-auto text-[#c9a56a] transition-transform duration-300 hover:scale-105`}
        aria-hidden="true"
      >
        <path d="M30 4v14M30 18C22 18 14 24 8 38M30 18c-3 8-6 14-9 20M30 18c3 8 6 14 9 20M30 18c8 0 16 6 22 20" />
        <path d="M2 42c8-4 14 4 22 0s14 4 22 0 10 0 12-2" stroke="#7fb3b0" strokeWidth="2.4" />
      </svg>
      {!hideText && (
        <span className={`font-serif font-semibold tracking-wider text-[#f3eddc] ${textClass}`}>
          {settings.name.toUpperCase()}
        </span>
      )}
    </div>
  );
};
