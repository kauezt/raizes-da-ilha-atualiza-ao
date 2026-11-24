import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, MessageCircle } from 'lucide-react';
import { SectionEditBadge } from './SectionEditBadge';
import { ImageCarousel } from './ImageCarousel';

export const PackagesSection: React.FC = () => {
  const { settings, activePackages, formatCurrency, getWhatsAppUrl } = useApp();

  return (
    <section id="pacotes" className="py-24 bg-[var(--sand)] text-[var(--ink)] relative">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="flex justify-end mb-4">
          <SectionEditBadge tab="packages" label="+ Adicionar / Gerenciar Pacotes" />
        </div>

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="eyebrow uppercase tracking-[0.2em] text-xs font-semibold text-[var(--gm)]">
            {settings.packagesEyebrow || 'Experiências completas'}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--g)]">
            {settings.packagesTitle || 'Nossos Pacotes'}
          </h2>
          <p className="text-sm sm:text-base text-[var(--ink)]/80">
            {settings.packagesSub || 'Roteiros planejados para você vivenciar o melhor da ilha com conforto, segurança e sabor. Deslize nas fotos para ver mais!'}
          </p>
        </div>

        {activePackages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum pacote disponível no momento.{' '}
            <button
              type="button"
              onClick={() => (window.location.hash = '#admin')}
              className="text-[var(--g)] underline font-medium"
            >
              Clique para adicionar pelo painel.
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activePackages.map((pkg) => {
              const inclusions = String(pkg.inclusos || '')
                .split('\n')
                .map((i) => i.trim())
                .filter(Boolean);

              const priceFormatted = formatCurrency(pkg.preco);
              const promoFormatted = pkg.promo ? formatCurrency(pkg.promo) : null;
              const ctaText = pkg.ctaText || 'Reservar pelo WhatsApp';

              const packageImages = (pkg.fotos && pkg.fotos.length > 0)
                ? pkg.fotos
                : pkg.foto
                ? [pkg.foto]
                : [];

              return (
                <article
                  key={pkg._id}
                  className="bg-[var(--card)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col relative group"
                >
                  {/* Quick Card Edit Badge */}
                  <SectionEditBadge
                    tab="packages"
                    item={pkg}
                    label="Editar"
                    className="absolute top-3 left-3 shadow-md z-20"
                  />

                  {/* Swipeable Photo Carousel */}
                  <ImageCarousel
                    images={packageImages}
                    fallbackImage={pkg.foto}
                    alt={pkg.nome}
                    aspectRatio="aspect-[16/10]"
                    badge={
                      pkg.promo ? (
                        <div className="bg-[#c9a56a] text-[#1a1208] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                          Oferta Especial
                        </div>
                      ) : undefined
                    }
                  />

                  {/* Body Content */}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <div>
                      <h3 className="font-serif text-2xl text-[var(--g)] leading-snug">
                        {pkg.nome}
                      </h3>
                      <div className="text-xs font-medium text-[var(--gm)] mt-1 tracking-wide">
                        {pkg.duracao} • {pkg.pessoas}
                      </div>
                    </div>

                    <p className="text-sm text-[var(--ink)]/80 leading-relaxed">
                      {pkg.descricao}
                    </p>

                    {/* Inclusions */}
                    {inclusions.length > 0 && (
                      <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--ink)]/90 my-2 flex-1">
                        {inclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check size={16} className="text-[var(--gm)] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Price & CTA */}
                    <div className="pt-3 border-t border-[var(--line)] mt-auto flex flex-col gap-3">
                      <div className="font-serif font-bold text-2xl text-[var(--br)]">
                        {promoFormatted ? (
                          <>
                            <s className="text-sm font-normal text-[var(--ink)]/50 mr-2">
                              {priceFormatted}
                            </s>
                            <span className="text-[#c9a56a]">{promoFormatted}</span>
                          </>
                        ) : (
                          priceFormatted || 'Sob consulta'
                        )}
                      </div>

                      <a
                        href={getWhatsAppUrl(`Olá! Quero reservar o pacote: ${pkg.nome}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-[var(--g)] hover:bg-[var(--gd)] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-5 rounded-full transition-all duration-200 shadow-sm"
                      >
                        <MessageCircle size={16} />
                        {ctaText}
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
