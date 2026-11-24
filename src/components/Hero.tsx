import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';
import { SectionEditBadge } from './SectionEditBadge';

export const Hero: React.FC = () => {
  const { settings } = useApp();

  const heroBgStyle: React.CSSProperties = settings.heroImage
    ? {
        backgroundImage: `linear-gradient(90deg, #32532E 0%, rgba(50, 83, 46, 0.94) 30%, rgba(50, 83, 46, 0.48) 58%, rgba(50, 83, 46, 0.08) 100%), linear-gradient(180deg, rgba(50, 83, 46, 0.35) 0%, rgba(50, 83, 46, 0.06) 52%, rgba(50, 83, 46, 0.55) 100%), url('${settings.heroImage}')`,
      }
    : {
        backgroundImage: `linear-gradient(135deg, #32532E, #40683B 60%, #243E21)`,
      };

  const rawHeroTitle = (settings.heroTitle || settings.name || 'Raízes da Ilha').trim();
  const isDefaultBrandHeadline = rawHeroTitle.toLowerCase() === 'raízes da ilha';

  return (
    <header
      id="top"
      className="hero min-h-[580px] sm:min-h-[650px] lg:min-h-[700px] flex items-center text-[#F6F2E4] bg-cover bg-center relative pt-28 pb-16 overflow-hidden"
      style={heroBgStyle}
    >
      <SectionEditBadge
        tab="settings"
        label="Editar Hero (Textos & Foto)"
        className="absolute top-28 right-5 sm:right-10"
      />

      <div className="max-w-[1180px] w-full mx-auto px-5 sm:px-6 z-10">
        <div className="max-w-lg space-y-5">
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.94] tracking-tight font-bold text-[#F6F2E4]">
            {isDefaultBrandHeadline ? (
              <>
                Raízes
                <br />
                da Ilha
              </>
            ) : (
              rawHeroTitle
            )}
          </h1>

          <p className="text-sm sm:text-base lg:text-[1.05rem] text-[#F6F2E4]/92 leading-relaxed font-normal max-w-[420px]">
            {settings.heroSub ||
              'Descubra São Luís de um jeito único, conectando história, cultura e natureza.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href={settings.heroCta1Link || '#experiencias'}
              className="btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-black/25"
            >
              <span>{settings.heroCta1Text || 'Explore a Ilha'}</span>
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </div>

      {/* Left-aligned scroll mouse cue matching reference */}
      <div className="max-w-[1180px] w-full mx-auto px-5 sm:px-6 absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="flex items-center gap-3 text-[#F6F2E4]/75 text-xs tracking-widest uppercase">
          <span className="w-8 h-px bg-[#F6F2E4]/45" />
          <span className="w-px h-5 bg-[#F6F2E4]/45" />
          <div className="w-5 h-8 border-2 border-[#F6F2E4]/65 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-[#DE952F] rounded-full animate-bounce" />
          </div>
          <span className="sr-only">
            {settings.heroScrollText || 'Role para explorar'}
          </span>
        </div>
      </div>
    </header>
  );
};
