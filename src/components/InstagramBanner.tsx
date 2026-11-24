import React from 'react';
import { useApp } from '../context/AppContext';
import { InstagramIcon } from './InstagramIcon';
import { SectionEditBadge } from './SectionEditBadge';

export const InstagramBanner: React.FC = () => {
  const { settings } = useApp();

  if (!settings.instagram) return null;

  return (
    <section className="py-18 bg-[#203b29] text-[#f4efe3] text-center border-t border-white/10 relative">
      <div className="max-w-[1160px] mx-auto px-5 space-y-5">
        <div className="flex justify-center">
          <SectionEditBadge tab="settings" label="Editar Banner Instagram" />
        </div>

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-[#eb9d1f]/45 text-[#eb9d1f] mb-1 shadow-md">
          <InstagramIcon size={28} />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f4efe3]">
          {settings.instagramTitle || `Continue vivendo o ${settings.name}.`}
        </h2>

        <p className="text-[#f4efe3]/80 max-w-lg mx-auto text-sm sm:text-base font-normal">
          {settings.instagramSub ||
            'Acompanhe o dia a dia nos manguezais, fotos exclusivas da vida selvagem e histórias da nossa comunidade.'}
        </p>

        <div className="pt-2">
          <a
            href={settings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-200 shadow-md"
          >
            <InstagramIcon size={18} />
            {settings.instagramCta || 'Seguir no Instagram'}
          </a>
        </div>
      </div>
    </section>
  );
};
