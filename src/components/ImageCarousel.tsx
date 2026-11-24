import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ImageCarouselProps {
  images?: string[];
  fallbackImage?: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
  badge?: React.ReactNode;
  onImageClick?: (index: number) => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images = [],
  fallbackImage,
  alt,
  aspectRatio = 'aspect-[16/10]',
  className = '',
  badge,
  onImageClick,
}) => {
  // Normalize images list (filter out empty strings)
  const imageList = (images.length > 0 ? images : fallbackImage ? [fallbackImage] : []).filter(
    (img) => Boolean(img && img.trim() !== '')
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe && imageList.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }
    if (isRightSwipe && imageList.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (imageList.length === 0) {
    return (
      <div
        className={`${aspectRatio} bg-gradient-to-tr from-[var(--g)] to-[var(--gm)] flex items-center justify-center text-white/40 text-xs ${className}`}
      >
        <ImageIcon size={28} />
      </div>
    );
  }

  const currentImage = imageList[currentIndex] || imageList[0];

  return (
    <div
      className={`relative overflow-hidden group select-none ${aspectRatio} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onImageClick && onImageClick(currentIndex)}
    >
      {/* Current Image */}
      <img
        src={currentImage}
        alt={`${alt} - Foto ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500 ease-out"
        loading="lazy"
      />

      {/* Optional Badge */}
      {badge && <div className="absolute top-3 right-3 z-10">{badge}</div>}

      {/* Multiple Photos Controls */}
      {imageList.length > 1 && (
        <>
          {/* Photo Counter Badge */}
          <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm pointer-events-none tracking-wider">
            {currentIndex + 1} / {imageList.length}
          </div>

          {/* Left / Prev Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 sm:opacity-75 sm:hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right / Next Arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 sm:opacity-75 sm:hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer"
            aria-label="Próxima foto"
          >
            <ChevronRight size={20} />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-2.5 inset-x-0 z-10 flex items-center justify-center gap-1.5 pointer-events-auto">
            {imageList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(idx, e)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-5 h-1.5 bg-[#c9a56a] shadow-sm'
                    : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
