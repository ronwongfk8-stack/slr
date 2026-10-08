import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Layers } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  title: string;
  onOpenLightbox?: (image: string, index?: number) => void;
  aspectRatioClass?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  title,
  onOpenLightbox,
  aspectRatioClass = 'aspect-video sm:aspect-[16/10]',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images && images.length > 0
    ? images
    : ['/src/assets/images/showcase_branding_identity_1790504096628.jpg'];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className={`relative ${aspectRatioClass} bg-slate-950 overflow-hidden group select-none`}>
      {/* Current Slide Image */}
      <img
        src={validImages[currentIndex]}
        alt={`${title} - slide ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500 ease-out"
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            '/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg';
        }}
      />

      {/* Dark gradient for controls contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />

      {/* Multi-Slide Indicator Pill (Top-Right) */}
      {validImages.length > 1 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-800 shadow-sm">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>{currentIndex + 1} / {validImages.length} Slides</span>
          </span>
        </div>
      )}

      {/* Centered Lightbox View Affordance on hover */}
      {onOpenLightbox && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox(validImages[currentIndex], currentIndex);
          }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
          title="Click to view full image in lightbox"
        >
          <div className="w-11 h-11 rounded-full bg-slate-900/80 backdrop-blur-sm text-white flex items-center justify-center border border-slate-700 shadow-lg transform transition-transform hover:scale-110">
            <Eye className="w-5 h-5 text-amber-300" />
          </div>
        </button>
      )}

      {/* Navigation Arrows (Only if multiple slides) */}
      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-amber-400 text-slate-300 hover:text-slate-950 border border-slate-700 flex items-center justify-center transition-all shadow-md cursor-pointer opacity-80 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-amber-400 text-slate-300 hover:text-slate-950 border border-slate-700 flex items-center justify-center transition-all shadow-md cursor-pointer opacity-80 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(e, idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  currentIndex === idx
                    ? 'w-5 h-1.5 bg-amber-400'
                    : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
