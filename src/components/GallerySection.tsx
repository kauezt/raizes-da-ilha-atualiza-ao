import React from 'react';
import { useApp } from '../context/AppContext';
import { ZoomIn } from 'lucide-react';
import { SectionEditBadge } from './SectionEditBadge';

export const GallerySection: React.FC = () => {
  const { settings, activeGallery, setLightboxIndex } = useApp();

  return (
    <section id="galeria" className="py-24 bg-[var(--off)] text-[var(--ink)] relative">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="flex justify-end mb-4">
          <SectionEditBadge tab="gallery" label="+ Adicionar Fotos à Galeria" />
        </div>

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="eyebrow uppercase tracking-[0.2em] text-xs font-semibold text-[var(--gm)]">
            {settings.galleryEyebrow || 'Galeria de Fotos'}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--g)]">
            {settings.galleryTitle || 'Momentos na ilha'}
          </h2>
          <p className="text-sm sm:text-base text-[var(--ink)]/80">
            {settings.gallerySub || 'Cores vivas, águas serenas e a beleza pura do ecossistema dos manguezais.'}
          </p>
        </div>

        {activeGallery.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Nenhuma foto cadastrada na galeria.</p>
            <button
              type="button"
              onClick={() => window.location.hash = '#admin'}
              className="text-xs text-[var(--g)] underline mt-2 font-medium"
            >
              Clique para enviar fotos pelo painel
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {activeGallery.map((item, index) => (
              <figure
                key={item._id}
                onClick={() => setLightboxIndex(index)}
                className="group relative rounded-2xl overflow-hidden cursor-zoom-in break-inside-avoid shadow-md hover:shadow-2xl transition-all duration-300 bg-[var(--card)] border border-[var(--line)]"
              >
                {/* Photo Edit Badge */}
                <SectionEditBadge
                  tab="gallery"
                  item={item}
                  label="Editar"
                  className="absolute top-2.5 right-2.5 z-20 shadow-md"
                />

                <img
                  src={item.foto}
                  alt={item.titulo || 'Foto da ilha'}
                  className="w-full h-auto block object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay Caption on Hover */}
                <figcaption className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between gap-3">
                  <div>
                    {item.titulo && (
                      <h4 className="font-serif font-semibold text-lg text-[#f3eddc]">
                        {item.titulo}
                      </h4>
                    )}
                    {item.descricao && (
                      <p className="text-xs text-[#d9d2bf] line-clamp-2 mt-0.5 font-light">
                        {item.descricao}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                    <ZoomIn size={16} />
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
