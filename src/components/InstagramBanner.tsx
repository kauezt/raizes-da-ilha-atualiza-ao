import React from 'react';
import { useApp } from '../context/AppContext';
import { InstagramIcon } from './InstagramIcon';
import { SectionEditBadge } from './SectionEditBadge';

export const InstagramBanner: React.FC = () => {
  const { settings } = useApp();

  if (!settings.instagram) return null;

  return (
    <section className="py-20 bg-[#142a20] text-[#f3eddc] text-center border-t border-[#2a3b30] relative">
      <div className="max-w-[1160px] mx-auto px-5 space-y-6">
        <div className="flex justify-center">
          <SectionEditBadge tab="settings" label="Editar Banner Instagram" />
        </div>

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1f3d2e] border border-[#7fb3b0]/30 text-[#c9a56a] mb-2 shadow-lg">
          <InstagramIcon size={28} />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f3eddc]">
          {settings.instagramTitle || `Continue vivendo o ${settings.name}.`}
        </h2>

        <p className="text-[#d9d2bf] max-w-lg mx-auto text-sm sm:text-base font-light">
          {settings.instagramSub || 'Acompanhe o dia a dia nos manguezais, fotos exclusivas da vida selvagem e histórias da nossa comunidade.'}
        </p>

        <div className="pt-2">
          <a
            href={settings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 shadow-md"
          >
            <InstagramIcon size={18} />
            {settings.instagramCta || 'Seguir no Instagram'}
          </a>
        </div>
      </div>
    </section>
  );
};
