import React from 'react';
import { useApp } from '../context/AppContext';
import { Anchor, MessageCircle } from 'lucide-react';
import { SectionEditBadge } from './SectionEditBadge';

export const TourSection: React.FC = () => {
  const { settings, activeTours, formatCurrency, getWhatsAppUrl } = useApp();
  const tour = activeTours[0] || null;

  const tourImage = tour?.foto || settings.tourImage || '';

  return (
    <section id="passeio" className="py-24 bg-[#142a20] text-[#efe8d6] relative">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="flex justify-end mb-4">
          <SectionEditBadge
            tab="tours"
            item={tour}
            label="Editar Passeio (Foto, Roteiro, Preço & Horários)"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Photo */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative group">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1f3d2e] to-[#5a6b3a]">
                {tourImage ? (
                  <img
                    src={tourImage}
                    alt={tour?.nome || settings.tourTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    Foto do Passeio
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4 bg-[#142a20]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#7fb3b0]/30 text-[#7fb3b0] text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Anchor size={14} />
                {settings.tourBadge || 'Embarcação Segura'}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <p className="eyebrow uppercase tracking-[0.2em] text-xs font-semibold text-[#7fb3b0]">
              {settings.tourEyebrow || 'Passeio de barco'}
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f3eddc] leading-tight">
              {settings.tourTitle}
            </h2>

            {tour && (
              <p className="text-base text-[#d9d2bf] font-medium leading-relaxed">
                {tour.nome}
              </p>
            )}

            {/* Specifications list */}
            {tour ? (
              <dl className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-6 gap-y-3.5 text-sm py-4 border-y border-[#2a3b30]">
                <dt className="text-[#7fb3b0] font-semibold text-xs uppercase tracking-wider">Duração</dt>
                <dd className="m-0 text-[#f3eddc]">{tour.duracao}</dd>

                <dt className="text-[#7fb3b0] font-semibold text-xs uppercase tracking-wider">Roteiro</dt>
                <dd className="m-0 text-[#f3eddc] leading-relaxed">{tour.roteiro}</dd>

                <dt className="text-[#7fb3b0] font-semibold text-xs uppercase tracking-wider">Capacidade</dt>
                <dd className="m-0 text-[#f3eddc]">{tour.capacidade}</dd>

                <dt className="text-[#7fb3b0] font-semibold text-xs uppercase tracking-wider">Pontos</dt>
                <dd className="m-0 text-[#f3eddc]">{tour.pontos}</dd>

                <dt className="text-[#7fb3b0] font-semibold text-xs uppercase tracking-wider">Horários</dt>
                <dd className="m-0 text-[#f3eddc]">{tour.horarios}</dd>

                <dt className="text-[#7fb3b0] font-semibold text-xs uppercase tracking-wider">Importante</dt>
                <dd className="m-0 text-[#d9d2bf] text-xs leading-relaxed">{tour.info}</dd>

                <dt className="text-[#7fb3b0] font-semibold text-xs uppercase tracking-wider">Preço</dt>
                <dd className="m-0 font-serif font-bold text-xl text-[#c9a56a]">
                  {formatCurrency(tour.preco) || 'Sob consulta'}
                </dd>
              </dl>
            ) : (
              <p className="text-sm text-gray-400">Roteiro demonstrativo — configure no painel administrativo.</p>
            )}

            <div className="pt-2">
              <a
                href={getWhatsAppUrl(`Olá! Quero reservar o passeio de barco: ${tour?.nome || 'Passeio pelo mangue'}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-200 shadow-md"
              >
                <MessageCircle size={18} />
                {tour?.ctaText || 'Reservar passeio de barco'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
