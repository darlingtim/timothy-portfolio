import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pin, 
  RotateCw,
  Sparkles,
  Pause,
  Play
} from 'lucide-react';
import { CarouselConfig, CarouselPhoto } from '../types';

interface HeroPhotoCarouselProps {
  config: CarouselConfig;
  onUpdateConfig?: (updated: CarouselConfig) => void;
  isAdmin?: boolean;
}

export const HeroPhotoCarousel: React.FC<HeroPhotoCarouselProps> = ({
  config,
  onUpdateConfig
}) => {
  // Filter active photos (either marked included in carousel, or fallback to all)
  const availablePhotos = config.photos && config.photos.length > 0 
    ? config.photos 
    : [
        {
          id: 'default-1',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
          caption: 'Timothy Ododo — Technology Mentor & Advocate',
          tag: 'Executive Profile',
          isIncludedInCarousel: true,
          order: 1
        }
      ];

  const carouselPhotos = availablePhotos.filter(p => p.isIncludedInCarousel);
  const activePhotoPool = carouselPhotos.length > 0 ? carouselPhotos : availablePhotos;

  // Find initial active index based on mode
  const initialIndex = () => {
    if (config.mode === 'steady' && config.steadyPhotoId) {
      const idx = activePhotoPool.findIndex(p => p.id === config.steadyPhotoId);
      if (idx !== -1) return idx;
    }
    return 0;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(config.mode === 'carousel' && config.autoPlay);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Sync index if steady mode changes from outside
  useEffect(() => {
    if (config.mode === 'steady' && config.steadyPhotoId) {
      const idx = activePhotoPool.findIndex(p => p.id === config.steadyPhotoId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsPlaying(false);
      }
    }
  }, [config.mode, config.steadyPhotoId, activePhotoPool]);

  // Handle auto-advance fade timer (seamless cycle)
  useEffect(() => {
    if (config.mode === 'carousel' && isPlaying && !isHovered && activePhotoPool.length > 1) {
      const intervalMs = (config.intervalSeconds || 4.5) * 1000;
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activePhotoPool.length);
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [config.mode, isPlaying, isHovered, activePhotoPool.length, config.intervalSeconds]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activePhotoPool.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activePhotoPool.length) % activePhotoPool.length);
  };

  const toggleMode = () => {
    if (!onUpdateConfig) return;
    const newMode = config.mode === 'carousel' ? 'steady' : 'carousel';
    const currentPhoto = activePhotoPool[currentIndex];
    const updated: CarouselConfig = {
      ...config,
      mode: newMode,
      steadyPhotoId: currentPhoto ? currentPhoto.id : config.steadyPhotoId,
      autoPlay: newMode === 'carousel'
    };
    onUpdateConfig(updated);
  };

  const setAsSteadyPhoto = (photo: CarouselPhoto) => {
    if (!onUpdateConfig) return;
    const updated: CarouselConfig = {
      ...config,
      mode: 'steady',
      steadyPhotoId: photo.id,
      autoPlay: false
    };
    onUpdateConfig(updated);
  };

  const currentPhoto = activePhotoPool[currentIndex] || activePhotoPool[0];

  return (
    <div 
      className="relative w-full max-w-md lg:max-w-lg mx-auto select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Soft Glow to seamlessly integrate with hero atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-tr from-sky-500/20 via-blue-600/15 to-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Seamless Edge-blended Image Canvas (No hard borders, no outer card box) */}
      <div className="relative w-full aspect-[4/4.8] sm:aspect-[4/5] overflow-hidden">
        
        {/* Render Layer of Photos with Smooth Cross-Fade Transitions */}
        {activePhotoPool.map((photo, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={photo.id || idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-105 z-0 pointer-events-none'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Timothy Ododo'}
                className="w-full h-full object-cover object-center"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}

        {/* Seamless Radial & Edge Vignette Fades directly into #070e24 */}
        {/* Bottom edge fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070e24] via-[#070e24]/70 to-transparent z-20 pointer-events-none" />
        
        {/* Top edge fade */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#070e24] via-[#070e24]/60 to-transparent z-20 pointer-events-none" />
        
        {/* Left edge fade */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-20 bg-gradient-to-r from-[#070e24] via-[#070e24]/60 to-transparent z-20 pointer-events-none" />
        
        {/* Right edge fade */}
        <div className="absolute inset-y-0 right-0 w-16 sm:w-20 bg-gradient-to-l from-[#070e24] via-[#070e24]/60 to-transparent z-20 pointer-events-none" />

        {/* Soft Radial Mask vignette to feather all 4 corners into dark space */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,#070e24_98%)] z-20 pointer-events-none" />

        {/* Minimalist Floating Controls on subtle hover */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onUpdateConfig && (
            <button
              type="button"
              onClick={toggleMode}
              title={config.mode === 'carousel' ? 'Lock current photo steady' : 'Resume seamless photo cycle'}
              className="p-2 rounded-full bg-[#070e24]/80 hover:bg-sky-600/90 text-white backdrop-blur-md border border-white/10 text-xs transition-all hover:scale-105 shadow-md"
            >
              {config.mode === 'carousel' ? (
                <Pin className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <RotateCw className="w-3.5 h-3.5 text-sky-300" />
              )}
            </button>
          )}

          {config.mode === 'carousel' && (
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause transition' : 'Play transition'}
              className="p-2 rounded-full bg-[#070e24]/80 hover:bg-sky-600/90 text-white backdrop-blur-md border border-white/10 text-xs transition-all hover:scale-105 shadow-md"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Minimal Navigation Arrows (Appears smoothly on hover, no count or total displayed) */}
        {activePhotoPool.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-[#070e24]/75 hover:bg-sky-600/90 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-[#070e24]/75 hover:bg-sky-600/90 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Floating Subtle Caption & Tag (Organic, seamless with no card box) */}
        <div className="absolute bottom-2 inset-x-4 z-30 space-y-1 text-center sm:text-left pointer-events-none">
          {currentPhoto.tag && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/20 border border-sky-400/30 text-sky-300 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{currentPhoto.tag}</span>
            </div>
          )}
          {currentPhoto.caption && (
            <p className="text-xs sm:text-sm font-medium text-slate-200/90 drop-shadow-md line-clamp-1">
              {currentPhoto.caption}
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
