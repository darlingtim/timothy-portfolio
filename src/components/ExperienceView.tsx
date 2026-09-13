import React, { useState, useEffect } from 'react';
import { Experience } from '../types';
import { Briefcase, Calendar, MapPin, CheckCircle2, Image as ImageIcon, ExternalLink, X, ZoomIn, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

interface ExperienceViewProps {
  experiences: Experience[];
  onNavigate: (path: string) => void;
  isStandalone?: boolean;
}

export const ExperienceView: React.FC<ExperienceViewProps> = ({ experiences, onNavigate, isStandalone = false }) => {
  const [activeLightbox, setActiveLightbox] = useState<{ photos: string[]; index: number; title: string } | null>(null);

  // Keyboard navigation for experience lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeLightbox) return;
      if (e.key === 'Escape') setActiveLightbox(null);
      if (e.key === 'ArrowLeft') {
        setActiveLightbox((prev) => 
          prev ? { ...prev, index: prev.index > 0 ? prev.index - 1 : prev.photos.length - 1 } : null
        );
      }
      if (e.key === 'ArrowRight') {
        setActiveLightbox((prev) => 
          prev ? { ...prev, index: prev.index < prev.photos.length - 1 ? prev.index + 1 : 0 } : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightbox]);

  return (
    <section className={`py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 ${isStandalone ? '' : 'bg-slate-50/30 dark:bg-slate-900/20'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
              Track Record &amp; Leadership
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isStandalone ? 'Professional Experience' : 'Featured Experience'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Proven impact in engineering, public-sector tech advocacy, high-volume event operations, and technical training.
            </p>
          </div>

          {!isStandalone && (
            <button
              onClick={() => onNavigate('/experience')}
              className="self-start px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-sky-500 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 text-sm font-medium transition-colors"
            >
              View Full Experience Timeline →
            </button>
          )}
        </div>

        {/* Timeline Stack */}
        <div className="space-y-8">
          {experiences.map((exp) => {
            // Collect all photos deduplicated
            const expPhotos: string[] = [];
            if (exp.imageUrl && !expPhotos.includes(exp.imageUrl)) expPhotos.push(exp.imageUrl);
            if (exp.photos && Array.isArray(exp.photos)) {
              exp.photos.forEach(p => {
                if (p && !expPhotos.includes(p)) expPhotos.push(p);
              });
            }

            const expTitle = `${exp.role} at ${exp.organization}`;

            return (
              <div 
                key={exp.id} 
                className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500/40 hover:shadow-sm transition-all space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <div className="inline-block text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-2">
                      {exp.type}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {exp.role}
                    </h3>
                    <div className="text-sky-600 dark:text-sky-400 font-semibold text-base">
                      {exp.organization}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                    {exp.period} • {exp.location}
                  </div>
                </div>

                {/* Workplace / Role Photos Showcase */}
                {expPhotos.length > 0 && (
                  <div className="space-y-3 max-w-3xl">
                    {/* Main Banner */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group">
                      <div className="aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
                        <img
                          src={expPhotos[0]}
                          alt={expTitle}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 cursor-pointer"
                          onClick={() => setActiveLightbox({ photos: expPhotos, index: 0, title: expTitle })}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white pointer-events-none">
                        <span className="text-xs font-medium truncate">
                          {expTitle}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightbox({ photos: expPhotos, index: 0, title: expTitle });
                          }}
                          className="pointer-events-auto p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                          title="Zoom photo"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>

                      {expPhotos.length > 1 && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-mono flex items-center gap-1.5 border border-white/20">
                          <Camera className="w-3.5 h-3.5 text-sky-400" />
                          <span>{expPhotos.length} photos</span>
                        </div>
                      )}
                    </div>

                    {/* Secondary Thumbnails */}
                    {expPhotos.length > 1 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {expPhotos.map((photoUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveLightbox({ photos: expPhotos, index: idx, title: `${expTitle} (Photo ${idx + 1})` })}
                            className="group relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer hover:border-sky-500 transition-all"
                          >
                            <img
                              src={photoUrl}
                              alt={`${expTitle} ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                  {exp.summary}
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-200 font-bold">
                    Key Responsibilities &amp; Impact:
                  </h4>
                  <ul className="space-y-2.5">
                    {exp.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="text-sky-500 font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-mono text-slate-500 mr-1">Technologies:</span>
                  {exp.technologies.map((t, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox Zoom Modal */}
      {activeLightbox && activeLightbox.photos[activeLightbox.index] && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveLightbox(null)}
        >
          <div 
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium truncate">{activeLightbox.title}</span>
                <span className="text-xs font-mono text-slate-400">
                  ({activeLightbox.index + 1} of {activeLightbox.photos.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo View with Navigation */}
            <div className="relative p-2 sm:p-6 flex items-center justify-center bg-black/70 min-h-[50vh] max-h-[75vh] overflow-hidden">
              <img 
                src={activeLightbox.photos[activeLightbox.index]} 
                alt={activeLightbox.title} 
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg" 
              />

              {activeLightbox.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightbox(prev => prev ? { ...prev, index: prev.index > 0 ? prev.index - 1 : prev.photos.length - 1 } : null);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors border border-white/20"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightbox(prev => prev ? { ...prev, index: prev.index < prev.photos.length - 1 ? prev.index + 1 : 0 } : null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors border border-white/20"
                    title="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail strip */}
            {activeLightbox.photos.length > 1 && (
              <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 overflow-x-auto">
                {activeLightbox.photos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveLightbox(prev => prev ? { ...prev, index: i } : null)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeLightbox.index === i ? 'border-sky-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
