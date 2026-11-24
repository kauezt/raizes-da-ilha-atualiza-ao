import React from 'react';
import { RootsLogo } from './RootsLogo';
import { useApp } from '../context/AppContext';
import { MapPin, ThumbsUp, Video, Play, Mail, Phone } from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';
import { SectionEditBadge } from './SectionEditBadge';

interface FooterProps {
  onOpenGallery: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGallery }) => {
  const { settings, getWhatsAppUrl } = useApp();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contato"
      className="bg-[#32532E] text-[#F6F2E4] pt-14 pb-10 border-t border-white/10 text-sm relative overflow-hidden"
    >
      {/* Subtle organic wave silhouette echoing reference footer */}
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 w-full h-24 text-black/[0.12] pointer-events-none select-none"
        aria-hidden="true"
      >
        <path
          d="M0 70c180-45 360 20 540-10s360-40 540 10 240 25 360-5v55H0V70z"
          fill="currentColor"
        />
      </svg>

      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 relative z-10">
        <div className="flex justify-end mb-4">
          <SectionEditBadge tab="settings" label="Editar Rodapé & Textos" />
        </div>

        {/* Reference-matched single horizontal footer row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-9 border-b border-white/15">
          {/* Left Logo + Divider */}
          <div className="flex items-center gap-6 min-w-0 lg:shrink-0">
            <RootsLogo size="lg" tone="light" stacked />
            <span className="hidden md:block w-px h-12 bg-white/25" aria-hidden="true" />
          </div>

          {/* Center Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs sm:text-sm font-medium text-[#F6F2E4]/90">
            <a href="#top" className="hover:text-[#DE952F] transition-colors">
              Início
            </a>
            <a href="#sobre" className="hover:text-[#DE952F] transition-colors">
              Sobre
            </a>
            <a href="#experiencias" className="hover:text-[#DE952F] transition-colors">
              Experiências
            </a>
            <button
              type="button"
              onClick={onOpenGallery}
              className="hover:text-[#DE952F] transition-colors cursor-pointer"
            >
              Galeria
            </button>
            <a href="#contato" className="hover:text-[#DE952F] transition-colors">
              Contato
            </a>
          </div>

          {/* Right Social Icons */}
          <div className="flex items-center gap-3">
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/12 hover:bg-[#DE952F] hover:text-[#1F331C] flex items-center justify-center transition-colors"
              >
                <InstagramIcon size={17} />
              </a>
            )}
            {settings.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-white/12 hover:bg-[#DE952F] hover:text-[#1F331C] flex items-center justify-center transition-colors"
              >
                <Play size={16} />
              </a>
            )}
            {settings.tiktok && (
              <a
                href={settings.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-white/12 hover:bg-[#DE952F] hover:text-[#1F331C] flex items-center justify-center transition-colors"
              >
                <Video size={16} />
              </a>
            )}
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/12 hover:bg-[#DE952F] hover:text-[#1F331C] flex items-center justify-center transition-colors"
              >
                <ThumbsUp size={16} />
              </a>
            )}
            <span className="hidden sm:block w-px h-7 bg-white/25 ml-2" aria-hidden="true" />
          </div>
        </div>

        {/* Bottom Legal, Contact & Location Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#F6F2E4]/80 gap-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5">
            <p>
              © {currentYear} {settings.name}.{' '}
              {settings.footerCopyright || 'Todos os direitos reservados.'}
            </p>
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-1.5 hover:text-[#DE952F] transition-colors"
              >
                <Mail size={12} />
                <span>{settings.email}</span>
              </a>
            )}
            <a
              href={getWhatsAppUrl('Olá! Gostaria de informações sobre o Raízes da Ilha.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#DE952F] transition-colors"
            >
              <Phone size={12} />
              <span>Atendimento WhatsApp</span>
            </a>
          </div>
          <p className="inline-flex items-center gap-1.5 font-medium text-[#F6F2E4]/90">
            <span>{settings.address || 'São Luís — Maranhão, Brasil'}</span>
            <MapPin size={13} className="text-[#DE952F] shrink-0" />
          </p>
        </div>
      </div>
    </footer>
  );
};
