import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { 
  ArrowLeft, 
  ExternalLink, 
  Code, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Image as ImageIcon, 
  ZoomIn, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera 
} from 'lucide-react';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onNavigateContact: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ 
  project, 
  onBack,
  onNavigateContact 
}) => {
  // Collect all photos deduplicated
  const allProjectPhotos = React.useMemo(() => {
    const list: string[] = [];
    if (project.imageUrl && !list.includes(project.imageUrl)) {
      list.push(project.imageUrl);
    }
    if (project.photos && Array.isArray(project.photos)) {
      project.photos.forEach((p) => {
        if (p && !list.includes(p)) list.push(p);
      });
    }
    if (project.images && Array.isArray(project.images)) {
      project.images.forEach((p) => {
        if (p && !list.includes(p)) list.push(p);
      });
    }
    return list;
  }, [project]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allProjectPhotos.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < allProjectPhotos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, allProjectPhotos.length]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12 animate-fade-in">
      
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all projects</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
            {project.category}
          </span>
          <span className="text-xs font-mono text-slate-500">
            Year: {project.year}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          {project.name}
        </h1>

        <p className="text-lg sm:text-xl text-sky-600 dark:text-sky-400 font-mono">
          {project.tagline}
        </p>

        {/* Action Links */}
        <div className="pt-2 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Open Live Demo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300 text-sm font-semibold inline-flex items-center gap-2 transition-all"
            >
              <Code className="w-4 h-4" />
              <span>View Source on GitHub</span>
            </a>
          )}
        </div>
      </div>

      {/* Primary Hero Cover Showcase (if photos exist) */}
      {allProjectPhotos.length > 0 && (
        <section className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md group">
            <div className="aspect-[16/9] w-full overflow-hidden flex items-center justify-center">
              <img
                src={allProjectPhotos[0]}
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 cursor-pointer"
                onClick={() => setLightboxIndex(0)}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 sm:p-6 text-white pointer-events-none">
              <div className="space-y-1">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-sky-400 font-semibold">
                  Primary Visual / System Diagram
                </span>
                <p className="text-sm font-medium">{project.name}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(0);
                }}
                className="pointer-events-auto p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
                title="Zoom image"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Project Overview */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Project Overview
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
          {project.overview}
        </p>
      </section>

      {/* Problem & Solution Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
            The Problem
          </span>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
            What Problem Does This Solve?
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.problem}
          </p>
        </div>

        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
            The Solution
          </span>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
            What Did Timothy Build?
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.solution}
          </p>
        </div>
      </section>

      {/* Multi-Photo Gallery Grid (if more than 1 photo or explicit photos exist) */}
      {allProjectPhotos.length > 1 && (
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold">
                Screenshots &amp; Hardware Media
              </span>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
                Visual Gallery ({allProjectPhotos.length} Images)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Click any image to enlarge
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {allProjectPhotos.map((photoUrl, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer shadow-xs hover:border-sky-500 transition-all"
              >
                <img
                  src={photoUrl}
                  alt={`${project.name} screenshot ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                </div>
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white/90">
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Features */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Key Features &amp; Capabilities
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.keyFeatures.map((feat, idx) => (
            <li key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Architecture */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          System Architecture &amp; Design
        </h2>
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            {project.architecture}
          </p>
        </div>
      </section>

      {/* Tech Stack Breakdown */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(project.stack).map(([layer, tech]) => (
            <div key={layer} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs font-mono uppercase text-sky-600 dark:text-sky-400 font-semibold block mb-1">
                {layer}
              </span>
              <span className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">
                {tech}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Challenges & How I Solved Them */}
      <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
            Engineering Rigor
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Technical Challenges &amp; How I Solved Them
          </h2>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>The Technical Hurdle</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {project.challenges}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>My Engineering Solution</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {project.solutionApproach}
            </p>
          </div>
        </div>
      </section>

      {/* Learnings & Future Improvements */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">What I Learned</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.learnings}
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">Future Improvements</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.futureImprovements}
          </p>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold"
        >
          ← Back to Portfolio
        </button>

        <button
          onClick={onNavigateContact}
          className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm"
        >
          Discuss this Project with Timothy
        </button>
      </div>

      {/* Interactive Lightbox Modal */}
      {lightboxIndex !== null && allProjectPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2 text-white">
                <Camera className="w-4 h-4 text-sky-400" />
                <span className="font-display font-bold text-sm truncate">{project.name}</span>
                <span className="text-xs font-mono text-slate-400">
                  ({lightboxIndex + 1} of {allProjectPhotos.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo & Navigation Arrows */}
            <div className="relative p-2 sm:p-6 flex items-center justify-center bg-black/60 min-h-[50vh] max-h-[75vh] overflow-hidden">
              <img
                src={allProjectPhotos[lightboxIndex]}
                alt={`${project.name} full view`}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />

              {allProjectPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allProjectPhotos.length - 1));
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
                      setLightboxIndex((prev) => (prev !== null && prev < allProjectPhotos.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors border border-white/20"
                    title="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Bottom Bar */}
            {allProjectPhotos.length > 1 && (
              <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 overflow-x-auto">
                {allProjectPhotos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      lightboxIndex === i ? 'border-sky-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
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

    </div>
  );
};
