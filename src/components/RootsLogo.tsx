import React from 'react';
import { useApp } from '../context/AppContext';

interface RootsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
  tone?: 'light' | 'dark';
  stacked?: boolean;
}

export const RootsLogo: React.FC<RootsLogoProps> = ({
  className = '',
  size = 'md',
  hideText = false,
  tone = 'light',
  stacked = false,
}) => {
  const { settings } = useApp();

  const heightClass =
    size === 'sm'
      ? 'h-9 sm:h-11'
      : size === 'lg'
      ? 'h-12 sm:h-16'
      : 'h-10 sm:h-12';

  const textClass = stacked
    ? size === 'sm'
      ? 'text-base sm:text-lg'
      : size === 'lg'
      ? 'text-xl sm:text-2xl'
      : 'text-lg sm:text-[1.25rem]'
    : size === 'sm'
    ? 'text-lg sm:text-xl'
    : size === 'lg'
    ? 'text-xl sm:text-2xl'
    : 'text-lg sm:text-xl';

  const textColor = tone === 'light' ? 'text-[#F6F2E4]' : 'text-[#32532E]';
  const iconColor = tone === 'light' ? 'text-[#F6F2E4]' : 'text-[#32532E]';
  const waveStroke = tone === 'light' ? '#DE952F' : '#B74C1E';

  const renderBrandName = () => {
    const rawName = (settings.name || 'Raízes da Ilha').trim();
    if (stacked && rawName.toLowerCase() === 'raízes da ilha') {
      return (
        <span
          className={`font-serif font-bold tracking-normal ${textColor} ${textClass} leading-[0.98] block`}
        >
          Raízes
          <br />
          da Ilha
        </span>
      );
    }
    return (
      <span
        className={`font-serif font-bold tracking-wide ${textColor} ${textClass} whitespace-nowrap truncate leading-tight`}
      >
        {rawName}
      </span>
    );
  };

  if (settings.logo) {
    return (
      <div className={`flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-full ${className}`}>
        <img
          src={settings.logo}
          alt={settings.name}
          className={`${heightClass} w-auto object-contain shrink-0`}
        />
        {!hideText && renderBrandName()}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-full ${className}`}>
      <svg
        viewBox="0 0 60 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        className={`${heightClass} w-auto shrink-0 ${iconColor} transition-transform duration-300 hover:scale-105`}
        aria-hidden="true"
      >
        <path d="M30 4v14M30 18C22 18 14 24 8 38M30 18c-3 8-6 14-9 20M30 18c3 8 6 14 9 20M30 18c8 0 16 6 22 20" />
        <path
          d="M2 42c8-4 14 4 22 0s14 4 22 0 10 0 12-2"
          stroke={waveStroke}
          strokeWidth="2.6"
        />
      </svg>
      {!hideText && renderBrandName()}
    </div>
  );
};
