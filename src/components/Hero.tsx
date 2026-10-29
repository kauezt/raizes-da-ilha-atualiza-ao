import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Compass } from 'lucide-react';
import { SectionEditBadge } from './SectionEditBadge';

export const Hero: React.FC = () => {
  const { settings, getWhatsAppUrl } = useApp();

  const heroBgStyle: React.CSSProperties = settings.heroImage
    ? {
        backgroundImage: `linear-gradient(rgba(10, 26, 18, 0.65), rgba(10, 26, 18, 0.82)), url('${settings.heroImage}')`,
      }
    : {
        backgroundImage: `linear-gradient(160deg, #2b4d3a, #142a20 60%, #6b4a2f)`,
      };

  return (
    <header
      id="top"
      className="hero min-h-screen flex items-center justify-center text-[#f3eddc] bg-cover bg-center relative pt-20 pb-16"
      style={heroBgStyle}
    >
      {/* Quick edit shortcut badge for Hero */}
      <SectionEditBadge
        tab="settings"
        label="Editar Hero (Textos & Foto)"
        className="absolute top-24 right-5 sm:right-10"
      />

      <div className="max-w-[1160px] w-full mx-auto px-5 z-10">
        <div className="max-w-2xl space-y-6">
          <p className="eyebrow inline-block text-[#7fb3b0] tracking-[0.25em] text-xs uppercase font-semibold bg-[#101a14]/60 px-3.5 py-1.5 rounded-full border border-[#7fb3b0]/30 backdrop-blur-sm">
            {settings.heroBadge || `${settings.name} • Ecoturismo de Vivência`}
          </p>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight font-semibold text-[#f3eddc]">
            {settings.heroTitle}
          </h1>

          <p className="text-lg md:text-xl text-[#f3eddc]/90 leading-relaxed font-light max-w-xl">
            {settings.heroSub}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href={settings.heroCta1Link || '#pacotes'}
              className="btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/20"
            >
              <Compass size={18} />
              {settings.heroCta1Text || 'Conheça nossos pacotes'}
            </a>

            <a
              href={getWhatsAppUrl(settings.whatsappDefaultMsg || 'Olá! Gostaria de planejar minha visita ao Raízes da Ilha.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-white/10"
            >
              <MessageCircle size={18} />
              {settings.heroCta2Text || 'Fale conosco'}
            </a>
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient & scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-[#f3eddc]/60 text-xs tracking-widest uppercase flex flex-col items-center gap-2 pointer-events-none">
        <span>{settings.heroScrollText || 'Role para explorar'}</span>
        <div className="w-5 h-8 border-2 border-[#f3eddc]/40 rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-[#f3eddc]/70 rounded-full animate-bounce" />
        </div>
      </div>
    </header>
  );
};
