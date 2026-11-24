import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';
import { SectionEditBadge } from './SectionEditBadge';

export const AboutSection: React.FC = () => {
  const { settings } = useApp();

  return (
    <section
      id="sobre"
      className="py-20 sm:py-24 bg-[#F6F2E4] text-[#253822] relative overflow-hidden"
    >
      {/* Subtle colonial architecture & royal palm line illustration matching reference bottom-right */}
      <svg
        viewBox="0 0 420 260"
        fill="none"
        className="hidden md:block absolute right-0 bottom-0 w-[380px] lg:w-[440px] text-[#32532E]/[0.18] pointer-events-none select-none"
        aria-hidden="true"
      >
        {/* Palm Tree Right */}
        <path
          d="M342 252V106M342 106c-32-24-62-20-84-2M342 106c-22-36-50-44-76-36M342 106c28-26 58-22 80-4M342 106c18-34 46-42 70-32M342 106c-6-36 6-64 24-82M342 106c10-36 28-58 48-70"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        {/* Colonial Church & Mansion Silhouettes */}
        <path
          d="M18 242h310M60 242v-48h52v48M76 242v-22a8 8 0 0 1 16 0v22M112 242v-64l34-22 34 22v64M132 178v-28l14-14 14 14v28M146 128v10M141 133h10M180 242v-78l44-28 44 28v78M212 136v-36l12-12 12 12v36M224 78v10M219 83h10M196 242v-24a10 10 0 0 1 20 0v24M232 242v-24a10 10 0 0 1 20 0v24M196 196h16M236 196h16M268 242v-54h46v54M282 214h16M282 238v-14h14v14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 252c44-8 82 6 124 0s84 6 126 0 78-6 156 0"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>

      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 relative z-10">
        <div className="flex justify-end mb-2">
          <SectionEditBadge tab="settings" label="Editar Seção Sobre (Foto & Textos)" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Photo with signature Terracotta offset backing */}
          <div className="lg:col-span-5">
            <div className="relative pl-5 sm:pl-6 group">
              <div
                className="absolute left-0 top-7 bottom-7 w-16 rounded-2xl bg-[#B74C1E]"
                aria-hidden="true"
              />
              <div className="relative aspect-[4/3] rounded-[28px] overflow-hidden shadow-xl shadow-black/15 bg-[#32532E]">
                {settings.aboutImage ? (
                  <img
                    src={settings.aboutImage}
                    alt={settings.aboutTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#F6F2E4]/60 text-sm">
                    Centro Histórico de São Luís
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Editorial Copy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[#B74C1E] rounded-full" />
              <p className="eyebrow uppercase tracking-[0.2em] text-xs font-bold text-[#B74C1E]">
                {settings.aboutEyebrow || 'Sobre o projeto'}
              </p>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.4rem] xl:text-[2.55rem] font-bold text-[#253B21] leading-[1.12]">
              {settings.aboutTitle || 'Da proposta à página publicada'}
            </h2>

            <p className="text-sm sm:text-base text-[#253822]/85 leading-relaxed whitespace-pre-line max-w-xl">
              {settings.aboutText}
            </p>

            <div className="pt-2">
              <a
                href="#questionario"
                className="btn-green inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold shadow-md"
              >
                <span>Conheça mais</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
