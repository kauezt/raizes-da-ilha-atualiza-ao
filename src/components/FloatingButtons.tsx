import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Settings, Edit3, Eye } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { getWhatsAppUrl } = useApp();

  return (
    <a
      href={getWhatsAppUrl('Olá! Estou no site Raízes da Ilha e gostaria de informações.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className="fixed right-5 bottom-5 z-40 bg-[#25d366] hover:bg-[#20ba5a] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-black/30 transition-transform duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
    >
      <MessageCircle size={30} className="fill-white/20" />
      <span className="sr-only">WhatsApp</span>
      {/* Tooltip */}
      <span className="absolute right-16 bg-[#142a20] text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md hidden sm:block">
        Fale conosco no WhatsApp
      </span>
    </a>
  );
};

export const FloatingAdminButton: React.FC = () => {
  const { setIsAdminOpen, editMode, setEditMode } = useApp();

  return (
    <div className="fixed left-5 bottom-5 z-40 flex items-center gap-2">
      <button
        type="button"
        onClick={() => setIsAdminOpen(true)}
        className="bg-[#c9a56a] hover:bg-[#dcb97c] text-[#1a1208] px-4 py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-black/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-[#1a1208]/20"
        aria-label="Abrir painel para mudar tudo do site"
      >
        <Settings size={17} className="animate-[spin_8s_linear_infinite]" />
        <span>Mudar tudo no site</span>
      </button>

      {/* Quick toggle for on-page badges */}
      <button
        type="button"
        onClick={() => setEditMode(!editMode)}
        title={editMode ? 'Ocultar atalhos de edição visual no site' : 'Mostrar atalhos de edição visual no site'}
        className={`px-3 py-3 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xl transition-all border ${
          editMode
            ? 'bg-[#1f3d2e] text-[#f3eddc] border-[#7fb3b0]/40'
            : 'bg-white/90 text-gray-700 hover:bg-white border-gray-300'
        }`}
      >
        {editMode ? (
          <>
            <Edit3 size={15} className="text-[#c9a56a]" />
            <span className="hidden sm:inline">Edição na tela: ON</span>
          </>
        ) : (
          <>
            <Eye size={15} />
            <span className="hidden sm:inline">Edição na tela: OFF</span>
          </>
        )}
      </button>
    </div>
  );
};
