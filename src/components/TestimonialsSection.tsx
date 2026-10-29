import React from 'react';
import { useApp } from '../context/AppContext';
import { Star } from 'lucide-react';
import { SectionEditBadge } from './SectionEditBadge';

export const TestimonialsSection: React.FC = () => {
  const { settings, activeTests } = useApp();

  return (
    <section className="py-24 bg-[var(--sand)] text-[var(--ink)] relative">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="flex justify-end mb-4">
          <SectionEditBadge tab="tests" label="+ Adicionar / Gerenciar Depoimentos" />
        </div>

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="eyebrow uppercase tracking-[0.2em] text-xs font-semibold text-[var(--gm)]">
            {settings.testEyebrow || 'Depoimentos'}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--g)]">
            {settings.testTitle}
          </h2>
          <p className="text-sm sm:text-base text-[var(--ink)]/80">
            {settings.testSub || 'A satisfação e as memórias inesquecíveis compartilhadas pelos nossos visitantes.'}
          </p>
        </div>

        {activeTests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum depoimento cadastrado no momento.{' '}
            <button
              type="button"
              onClick={() => window.location.hash = '#admin'}
              className="text-[var(--g)] underline font-medium"
            >
              Adicionar depoimento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeTests.map((t) => {
              const starsCount = Math.max(1, Math.min(5, t.nota || 5));

              return (
                <article
                  key={t._id}
                  className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative group"
                >
                  {/* Card Edit Badge */}
                  <SectionEditBadge
                    tab="tests"
                    item={t}
                    label="Editar"
                    className="absolute top-4 right-4 shadow-sm"
                  />

                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-[#c9a56a]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < starsCount ? 'fill-[#c9a56a]' : 'text-gray-300'}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="font-serif italic text-lg sm:text-xl text-[var(--ink)] leading-snug">
                      “{t.texto}”
                    </p>
                  </div>

                  {/* Author Meta */}
                  <div className="pt-6 border-t border-[var(--line)] mt-6 flex items-center justify-between">
                    <strong className="font-semibold text-sm text-[var(--g)]">
                      {t.nome}
                    </strong>
                    {t.data && (
                      <span className="text-xs text-[var(--gm)] font-medium">
                        {t.data}
                      </span>
                    )}
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
