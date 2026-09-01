import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { Image as ImageIcon, MapPin, Calendar, Tag, X, ZoomIn } from 'lucide-react';

interface GalleryViewProps {
  galleryItems: GalleryItem[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ galleryItems }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Training', 'Community', 'Certificate', 'Workshop'];

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Training':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Community':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Certificate':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Workshop':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="py-12 sm:py-16 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-mono font-semibold border border-sky-200 dark:border-sky-800">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Visual Archive &amp; Field Work</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Activities &amp; Moments Gallery
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Photographic highlights from physical computing boot camps, public sector innovation events, mentoring circles, and professional milestones.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat} {cat === 'All' ? `(${galleryItems.length})` : `(${galleryItems.filter(i => i.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedPhoto(item)}
            className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col"
          >
            {/* Image Container */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-3 rounded-full bg-white/90 text-slate-900 shadow-md">
                  <ZoomIn className="w-5 h-5" />
                </span>
              </div>
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold border ${getCategoryBadgeClass(item.category)}`}>
                {item.category}
              </span>
            </div>

            {/* Meta Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    <span className="truncate max-w-[140px]">{item.location}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 ml-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="max-w-3xl w-full bg-white dark:bg-[#0c1633] rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-black">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedPhoto.title}
                </h2>
                <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getCategoryBadgeClass(selectedPhoto.category)}`}>
                  {selectedPhoto.category}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {selectedPhoto.description}
              </p>
              <div className="flex items-center gap-6 pt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                {selectedPhoto.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-500" />
                    <span>{selectedPhoto.location}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedPhoto.date}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
