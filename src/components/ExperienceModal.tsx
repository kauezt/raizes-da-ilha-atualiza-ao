import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ImageCarousel } from './ImageCarousel';
import { ServiceOptionId } from '../utils/questionnaire';
import {
  getCategoryItems,
  getExperienceCategoryConfig,
} from '../utils/experienceCategories';
import { ExperienceCategoryId } from '../types';
import {
  X,
  ArrowRight,
  Camera,
  Utensils,
  Landmark,
  MapPin,
  Clock,
  Edit2,
} from 'lucide-react';

export type ExperienceCategory = ExperienceCategoryId;

interface ExperienceModalProps {
  category: ExperienceCategory | null;
  onClose: () => void;
  onIncludeInRoute: (service?: ServiceOptionId) => void;
  onOpenGallery: () => void;
}

const CATEGORY_STYLE: Record<
  ExperienceCategory,
  {
    accentBg: string;
    service?: ServiceOptionId;
    icon: React.ReactNode;
  }
> = {
  roteiros: {
    accentBg: 'bg-[#F6F2E4] text-[#253B21]',
    service: 'passeio',
    icon: <Camera size={22} />,
  },
  gastronomia: {
    accentBg: 'bg-[#B74C1E] text-[#F6F2E4]',
    service: 'restaurante',
    icon: <Utensils size={22} />,
  },
  cultura: {
    accentBg: 'bg-[#DE952F] text-[#1F331C]',
    service: 'passeio',
    icon: <Landmark size={22} />,
  },
  natureza: {
    accentBg: 'bg-[#44757A] text-[#F6F2E4]',
    service: 'hospedagem',
    icon: <MapPin size={22} />,
  },
};

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  category,
  onClose,
  onIncludeInRoute,
  onOpenGallery,
}) => {
  const {
    experienceCategories,
    experienceItems,
    formatCurrency,
    editMode,
    openAdminTo,
  } = useApp();

  useEffect(() => {
    if (!category) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [category, onClose]);

  if (!category) return null;

  const styleMeta = CATEGORY_STYLE[category];
  const configMeta = getExperienceCategoryConfig(experienceCategories, category);
  const items = getCategoryItems(experienceItems, category, true);
  const displayTitle = configMeta.modalTitle || configMeta.title;
  const displaySubtitle = configMeta.modalSubtitle || configMeta.subtitle;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={displayTitle}
      data-testid="experience-modal"
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-[#F6F2E4] text-[#253822] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#DDD4BC]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#32532E] text-[#F6F2E4] px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${styleMeta.accentBg}`}
            >
              {styleMeta.icon}
            </div>
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                {displayTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#F6F2E4]/85 mt-0.5">{displaySubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes da experiência"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F6F2E4] shrink-0 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#FAF7EE] border border-[#DDD4BC] space-y-2">
              <p className="font-serif text-xl text-[#32532E] font-bold">
                Nenhum item ativo nesta categoria no momento.
              </p>
              <p className="text-xs sm:text-sm text-[#253822]/75">
                Adicione ou ative itens em &ldquo;Editar site &gt; Categorias&rdquo; para exibi-los aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((item) => (
                <article
                  key={item._id}
                  data-testid="experience-modal-item"
                  className="rounded-2xl overflow-hidden bg-[#FAF7EE] border border-[#DDD4BC] shadow-sm flex flex-col"
                >
                  <ImageCarousel
                    images={item.fotos}
                    fallbackImage={item.foto}
                    alt={item.nome}
                    aspectRatio="aspect-[16/10]"
                  />
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      {item.subtitulo ? (
                        <p className="text-[11px] uppercase tracking-wider font-bold text-[#B74C1E]">
                          {item.subtitulo}
                        </p>
                      ) : null}
                      <h4 className="font-serif text-xl font-bold text-[#32532E]">{item.nome}</h4>
                      {item.descricao ? (
                        <p className="text-xs sm:text-sm text-[#253822]/80 leading-relaxed">
                          {item.descricao}
                        </p>
                      ) : null}
                    </div>

                    {(item.detalhe || (item.preco !== undefined && item.preco !== '')) && (
                      <div className="pt-2 border-t border-[#DDD4BC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#32532E] font-medium">
                        {item.detalhe ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={14} className="text-[#B74C1E]" />
                            {item.detalhe}
                          </span>
                        ) : (
                          <span />
                        )}
                        {item.preco !== undefined && item.preco !== '' ? (
                          <span className="font-bold text-sm text-[#B74C1E] tabular-nums">
                            {formatCurrency(item.preco)}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {category === 'cultura' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGallery();
                }}
                className="text-xs font-bold text-[#32532E] underline hover:text-[#B74C1E] cursor-pointer"
              >
                Abrir galeria completa em tela cheia →
              </button>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="px-6 py-4 bg-[#EDE6D1]/75 border-t border-[#DDD4BC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs sm:text-sm font-semibold text-[#253822]/75 hover:text-[#32532E] px-3 py-2 cursor-pointer"
            >
              Voltar ao site
            </button>

            {editMode && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAdminTo('categories', undefined, category);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#32532E] bg-white border border-[#32532E]/25 hover:bg-[#32532E]/10 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
              >
                <Edit2 size={13} />
                <span>Editar itens desta categoria</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onIncludeInRoute(styleMeta.service);
            }}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
          >
            <span>Planejar com essa experiência</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
