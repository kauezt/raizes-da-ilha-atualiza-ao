import React from 'react';
import { RootsLogo } from './RootsLogo';
import { useApp } from '../context/AppContext';
import { SectionEditBadge } from './SectionEditBadge';

export const Footer: React.FC = () => {
  const { settings } = useApp();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#142a20] text-[#d9d2bf] pt-16 pb-12 border-t border-[#2a3b30] text-sm relative">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="flex justify-end mb-6">
          <SectionEditBadge tab="settings" label="Editar Rodapé & Textos" />
        </div>

        <div className="flex flex-wrap gap-10 justify-between items-start pb-12 border-b border-[#2a3b30]">
          {/* Logo & Bio */}
          <div className="max-w-sm space-y-4">
            <RootsLogo size="md" />
            <p className="text-xs sm:text-sm text-[#d9d2bf]/80 leading-relaxed font-light">
              {settings.footerText}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-[#f3eddc] font-semibold text-xs uppercase tracking-wider">
              Navegação
            </h4>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm">
              <a href="#sobre" className="hover:text-[#c9a56a] transition-colors">
                Sobre
              </a>
              <a href="#pacotes" className="hover:text-[#c9a56a] transition-colors">
                Pacotes
              </a>
              <a href="#passeio" className="hover:text-[#c9a56a] transition-colors">
                Passeio
              </a>
              <a href="#hospedagem" className="hover:text-[#c9a56a] transition-colors">
                Hospedagem
              </a>
              <a href="#restaurante" className="hover:text-[#c9a56a] transition-colors">
                Restaurante
              </a>
              <a href="#galeria" className="hover:text-[#c9a56a] transition-colors">
                Galeria
              </a>
              <a href="#contato" className="hover:text-[#c9a56a] transition-colors">
                Contato
              </a>
            </div>

            {settings.address && (
              <p className="text-xs text-[#d9d2bf]/70 pt-2 font-light">
                {settings.address}
              </p>
            )}

            {/* Social quick links */}
            <div className="flex flex-wrap gap-4 text-xs pt-1">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c9a56a] transition-colors"
                >
                  Instagram
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c9a56a] transition-colors"
                >
                  Facebook
                </a>
              )}
              {settings.tiktok && (
                <a
                  href={settings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c9a56a] transition-colors"
                >
                  TikTok
                </a>
              )}
              {settings.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c9a56a] transition-colors"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#d9d2bf]/50 gap-4">
          <p>
            © {currentYear} {settings.name}. {settings.footerCopyright || 'Todos os direitos reservados.'}
          </p>
          <p className="font-light">
            {settings.footerSub || 'Ecoturismo e conservação ambiental nos manguezais'}
          </p>
        </div>
      </div>
    </footer>
  );
};
