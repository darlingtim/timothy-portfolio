import React, { useState } from 'react';
import { Experience } from '../types';
import { Briefcase, Calendar, MapPin, CheckCircle2, Image as ImageIcon, ExternalLink, X, ZoomIn } from 'lucide-react';

interface ExperienceViewProps {
  experiences: Experience[];
  onNavigate: (path: string) => void;
  isStandalone?: boolean;
}

export const ExperienceView: React.FC<ExperienceViewProps> = ({ experiences, onNavigate, isStandalone = false }) => {
  const [zoomPhoto, setZoomPhoto] = useState<{ url: string; title: string } | null>(null);

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
          {experiences.map((exp) => (
            <div 
              key={exp.id} 
              className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500/40 hover:shadow-sm transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="inline-block text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-2">
                    {{ ...exp }.type}
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

              {/* Optional Workplace / Role Photo */}
              {exp.imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group max-w-2xl">
                  <div className="aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
                    <img
                      src={exp.imageUrl}
                      alt={`${exp.role} at ${exp.organization}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white">
                    <span className="text-xs font-medium truncate">
                      {exp.role} — {exp.organization}
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomPhoto({ url: exp.imageUrl!, title: `${exp.role} at ${exp.organization}` })}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                      title="Zoom photo"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
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
          ))}
        </div>

      </div>

      {/* Lightbox Zoom Modal */}
      {zoomPhoto && (
        <div
          className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomPhoto(null)}
        >
          <div className="relative max-w-4xl w-full bg-black/50 rounded-2xl overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
            <img src={zoomPhoto.url} alt={zoomPhoto.title} className="w-full max-h-[80vh] object-contain mx-auto" />
            <div className="p-4 bg-slate-900/90 flex items-center justify-between text-white">
              <span className="text-sm font-medium">{zoomPhoto.title}</span>
              <button
                type="button"
                onClick={() => setZoomPhoto(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
