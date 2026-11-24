import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Users, Sparkles, Info } from 'lucide-react';
import { SectionEditBadge } from './SectionEditBadge';
import { ImageCarousel } from './ImageCarousel';

export const StaysSection: React.FC = () => {
  const { settings, activeStays, formatCurrency, getWhatsAppUrl } = useApp();

  return (
    <section id="hospedagem" className="py-24 bg-[var(--off)] text-[var(--ink)] relative">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="flex justify-end mb-4">
          <SectionEditBadge tab="stays" label="+ Adicionar / Gerenciar Hospedagens" />
        </div>

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="eyebrow uppercase tracking-[0.2em] text-xs font-semibold text-[var(--gm)]">
            {settings.stayEyebrow || 'Hospedagem & Conforto'}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--g)]">
            {settings.stayTitle}
          </h2>
          <p className="text-sm sm:text-base text-[var(--ink)]/80">
            {settings.staySub || 'Desperte com o cantar dos pássaros e adormeça com o som tranquilo das águas do mangue. Deslize para ver todas as fotos do espaço!'}
          </p>
        </div>

        {activeStays.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhuma hospedagem cadastrada no momento.{' '}
            <button
              type="button"
              onClick={() => (window.location.hash = '#admin')}
              className="text-[var(--g)] underline font-medium"
            >
              Adicionar acomodação
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {activeStays.map((stay) => {
              const priceFormatted = formatCurrency(stay.preco);
              const stayImages = (stay.fotos && stay.fotos.length > 0)
                ? stay.fotos
                : stay.foto
                ? [stay.foto]
                : [];

              return (
                <article
                  key={stay._id}
                  className="bg-[var(--card)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col relative group"
                >
                  {/* Quick Card Edit Badge */}
                  <SectionEditBadge
                    tab="stays"
                    item={stay}
                    label="Editar"
                    className="absolute top-3 left-3 shadow-md z-20"
                  />

                  {/* Swipeable Photo Carousel */}
                  <ImageCarousel
                    images={stayImages}
                    fallbackImage={stay.foto}
                    alt={stay.nome}
                    aspectRatio="aspect-[16/10]"
                  />

                  {/* Details */}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <div>
                      <h3 className="font-serif text-2xl text-[var(--g)] leading-snug">
                        {stay.nome}
                      </h3>
                      {stay.capacidade && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--gm)] font-medium mt-1">
                          <Users size={14} />
                          <span>{stay.capacidade}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-[var(--ink)]/85 leading-relaxed">
                      {stay.descricao}
                    </p>

                    {stay.comodidades && (
                      <div className="bg-[var(--sand)]/50 p-3.5 rounded-2xl border border-[var(--line)] text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[var(--gm)]">
                          <Sparkles size={13} />
                          <span>Comodidades</span>
                        </div>
                        <p className="text-[var(--ink)]/80 leading-normal">{stay.comodidades}</p>
                      </div>
                    )}

                    {stay.info && (
                      <div className="flex items-start gap-2 text-xs text-[var(--ink)]/70">
                        <Info size={14} className="text-[var(--gm)] shrink-0 mt-0.5" />
                        <span>{stay.info}</span>
                      </div>
                    )}

                    {/* Price & Booking */}
                    <div className="pt-4 border-t border-[var(--line)] mt-auto flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-[var(--ink)]/60 block">Diária a partir de</span>
                        <div className="font-serif font-bold text-2xl text-[var(--br)]">
                          {priceFormatted || 'Sob consulta'}
                        </div>
                      </div>

                      <a
                        href={getWhatsAppUrl(`Olá! Gostaria de consultar disponibilidade para: ${stay.nome}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[var(--g)] hover:bg-[var(--gd)] text-white text-xs font-semibold uppercase tracking-wider py-3 px-5 rounded-full transition-all duration-200"
                      >
                        <MessageCircle size={15} />
                        {stay.ctaText || 'Consultar'}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
