import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Settings } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { getWhatsAppUrl } = useApp();

  return (
    <a
      href={getWhatsAppUrl('Olá! Estou no site Raízes da Ilha e gostaria de informações.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className="fixed right-5 bottom-5 z-40 bg-[#25d366] hover:bg-[#20ba5a] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-black/25 transition-transform duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
    >
      <MessageCircle size={24} className="fill-white/20" />
      <span className="sr-only">WhatsApp</span>
      <span className="absolute right-14 bg-[#1f3b29] text-[#f4efe3] text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md hidden sm:block">
        Fale conosco no WhatsApp
      </span>
    </a>
  );
};

export const FloatingAdminButton: React.FC = () => {
  const { setIsAdminOpen } = useApp();

  return (
    <button
      type="button"
      onClick={() => setIsAdminOpen(true)}
      className="fixed left-5 bottom-5 z-40 bg-[#223a27]/90 hover:bg-[#1a2e1e] text-[#f4efe3] px-3.5 py-2 rounded-full font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/15 backdrop-blur-sm opacity-80 hover:opacity-100"
      aria-label="Abrir painel para mudar tudo do site"
    >
      <Settings size={14} />
      <span>Editar site</span>
    </button>
  );
};
