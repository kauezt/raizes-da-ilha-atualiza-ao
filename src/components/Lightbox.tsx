import React, { useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export const Lightbox: React.FC = () => {
  const { lightboxIndex, setLightboxIndex, activeGallery } = useApp();

  const handleClose = () => setLightboxIndex(null);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (lightboxIndex === null || activeGallery.length === 0) return;
      setLightboxIndex((lightboxIndex - 1 + activeGallery.length) % activeGallery.length);
    },
    [lightboxIndex, activeGallery.length, setLightboxIndex]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (lightboxIndex === null || activeGallery.length === 0) return;
      setLightboxIndex((lightboxIndex + 1) % activeGallery.length);
    },
    [lightboxIndex, activeGallery.length, setLightboxIndex]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  if (lightboxIndex === null || !activeGallery[lightboxIndex]) {
    return null;
  }

  const currentItem = activeGallery[lightboxIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-20"
        aria-label="Fechar galeria"
      >
        <X size={28} />
      </button>

      {/* Prev button */}
      {activeGallery.length > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/15 transition-all z-20 text-4xl"
          aria-label="Foto anterior"
        >
          <ChevronLeft size={36} />
        </button>
      )}

      {/* Image and Caption Container */}
      <div
        className="max-h-[85vh] max-w-[92vw] flex flex-col items-center gap-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentItem.foto}
          alt={currentItem.titulo || 'Foto da ilha'}
          className="max-h-[75vh] max-w-[92vw] object-contain rounded-lg shadow-2xl"
        />

        <div className="text-center text-white max-w-xl px-4">
          {currentItem.titulo && (
            <h3 className="font-serif font-semibold text-xl text-[#f3eddc]">
              {currentItem.titulo}
            </h3>
          )}
          {currentItem.descricao && (
            <p className="text-xs sm:text-sm text-gray-300 mt-1 font-light">
              {currentItem.descricao}
            </p>
          )}
          <span className="text-[11px] text-gray-400 mt-2 block tracking-wider">
            {lightboxIndex + 1} de {activeGallery.length}
          </span>
        </div>
      </div>

      {/* Next button */}
      {activeGallery.length > 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/15 transition-all z-20 text-4xl"
          aria-label="Próxima foto"
        >
          <ChevronRight size={36} />
        </button>
      )}
    </div>
  );
};
