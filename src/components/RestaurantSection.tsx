import React from 'react';
import { useApp } from '../context/AppContext';
import { SectionEditBadge } from './SectionEditBadge';
import { ImageCarousel } from './ImageCarousel';

export const RestaurantSection: React.FC = () => {
  const { settings, activeDishes, formatCurrency } = useApp();

  return (
    <section id="restaurante" className="py-24 bg-[var(--sand)] text-[var(--ink)] relative">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="flex justify-end mb-4">
          <SectionEditBadge tab="dishes" label="+ Adicionar / Gerenciar Pratos & Bebidas" />
        </div>

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="eyebrow uppercase tracking-[0.2em] text-xs font-semibold text-[var(--gm)]">
            {settings.foodEyebrow || 'Culinária Caiçara & Regional'}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--g)]">
            {settings.foodTitle}
          </h2>
          <p className="text-sm sm:text-base text-[var(--ink)]/80">
            {settings.foodSub || 'Ingredientes do dia colhidos na maré e preparados com temperos ancestrais que contam a história da nossa terra.'}
          </p>
        </div>

        {activeDishes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum prato cadastrado no momento.{' '}
            <button
              type="button"
              onClick={() => (window.location.hash = '#admin')}
              className="text-[var(--g)] underline font-medium"
            >
              Adicionar prato ao cardápio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeDishes.map((dish) => {
              const priceFormatted = formatCurrency(dish.preco);
              const dishImages = (dish.fotos && dish.fotos.length > 0)
                ? dish.fotos
                : dish.foto
                ? [dish.foto]
                : [];

              return (
                <article
                  key={dish._id}
                  className="bg-[var(--card)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col relative group"
                >
                  {/* Quick Card Edit Badge */}
                  <SectionEditBadge
                    tab="dishes"
                    item={dish}
                    label="Editar"
                    className="absolute top-2.5 left-2.5 shadow-md z-20"
                  />

                  {/* Swipeable Photo Carousel */}
                  <ImageCarousel
                    images={dishImages}
                    fallbackImage={dish.foto}
                    alt={dish.nome}
                    aspectRatio="aspect-[16/11]"
                  />

                  <div className="p-5 flex flex-col gap-2.5 flex-1">
                    {dish.categoria && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gm)]">
                        {dish.categoria}
                      </span>
                    )}

                    <h3 className="font-serif text-xl text-[var(--g)] leading-snug">
                      {dish.nome}
                    </h3>

                    <p className="text-xs sm:text-sm text-[var(--ink)]/80 leading-relaxed flex-1">
                      {dish.descricao}
                    </p>

                    <div className="pt-3 border-t border-[var(--line)] mt-auto flex items-baseline justify-between">
                      <span className="text-xs text-[var(--ink)]/60">Valor</span>
                      <span className="font-serif font-bold text-xl text-[var(--br)]">
                        {priceFormatted}
                      </span>
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
