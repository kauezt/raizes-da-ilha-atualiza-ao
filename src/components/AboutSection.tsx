import React from 'react';
import { useApp } from '../context/AppContext';
import { SectionEditBadge } from './SectionEditBadge';

export const AboutSection: React.FC = () => {
  const { settings } = useApp();

  const rawChips = settings.aboutChips || '🚤 Passeio de barco\n🏡 Hospedagem\n🍽️ Gastronomia\n🌿 Natureza\n📍 Experiências locais';
  const chipsList = rawChips
    .split(/[\n,]/)
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <section id="sobre" className="py-24 bg-[var(--off)] text-[var(--ink)] relative">
      <div className="max-w-[1160px] mx-auto px-5 relative">
        <div className="flex justify-end mb-4">
          <SectionEditBadge tab="settings" label="Editar Seção Sobre (Foto & Textos)" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <p className="eyebrow uppercase tracking-[0.2em] text-xs font-semibold text-[var(--gm)]">
              {settings.aboutEyebrow || 'Sobre nós'}
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--g)] leading-tight">
              {settings.aboutTitle}
            </h2>

            <p className="text-base sm:text-lg text-[var(--ink)]/85 leading-relaxed whitespace-pre-line">
              {settings.aboutText}
            </p>

            {/* Chips */}
            {chipsList.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-4">
                {chipsList.map((chip, idx) => (
                  <span
                    key={idx}
                    className="bg-[var(--sand)] text-[var(--ink)] px-4 py-2 rounded-full text-sm font-medium border border-[var(--line)] shadow-xs transition-transform hover:scale-105 duration-200"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5">
            <div className="relative group">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-black/15 bg-gradient-to-br from-[var(--gm)] to-[var(--g)]">
                {settings.aboutImage ? (
                  <img
                    src={settings.aboutImage}
                    alt={settings.aboutTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
                    Foto do Raízes da Ilha
                  </div>
                )}
              </div>

              {/* Decorative badge */}
              {(settings.aboutBadgeTitle || settings.aboutBadgeText) && (
                <div className="absolute -bottom-5 -left-5 bg-[var(--g)] text-[#f3eddc] p-4 rounded-2xl shadow-xl hidden sm:block border border-[#7fb3b0]/30 max-w-[220px]">
                  {settings.aboutBadgeTitle && (
                    <p className="text-xs uppercase tracking-wider text-[var(--water)] font-semibold">
                      {settings.aboutBadgeTitle}
                    </p>
                  )}
                  {settings.aboutBadgeText && (
                    <p className="text-xs mt-1 opacity-90 leading-snug">
                      {settings.aboutBadgeText}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
