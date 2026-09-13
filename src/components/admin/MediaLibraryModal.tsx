import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Upload, 
  Check, 
  Image as ImageIcon, 
  Filter, 
  RefreshCw, 
  Sparkles, 
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { fetchMediaImages, uploadImageFile, MediaImageItem, ImageCategory } from '../../utils/imageUpload';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (url: string, item?: MediaImageItem) => void;
  targetCategoryLabel?: string;
  defaultCategoryFilter?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  all: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' },
  projects: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  experience: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
  certifications: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  achievements: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  mentoring: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  events: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  gallery: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  profile: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  carousel: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  general: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPhoto,
  targetCategoryLabel = 'Item',
  defaultCategoryFilter = 'all'
}) => {
  if (!isOpen) return null;

  const [images, setImages] = useState<MediaImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MediaImageItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategoryFilter);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<ImageCategory>('general');
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const list = await fetchMediaImages();
      setImages(list);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [isOpen]);

  const handleSelect = (item: MediaImageItem) => {
    setSelectedUrl(item.url);
    setSelectedItem(item);
  };

  const handleConfirm = () => {
    if (!selectedUrl) return;
    onSelectPhoto(selectedUrl, selectedItem || undefined);
    onClose();
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImageFile(file, { category: uploadCategory });
      if (res.url) {
        const newItem: MediaImageItem = {
          url: res.url,
          filename: res.filename || file.name,
          category: res.category || uploadCategory,
          source: 'uploaded',
          modified: new Date().toISOString()
        };
        setImages((prev) => [newItem, ...prev]);
        setSelectedUrl(res.url);
        setSelectedItem(newItem);
        setShowUploadDrawer(false);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Extract unique categories and counts
  const categoryCounts = images.reduce<Record<string, number>>((acc, img) => {
    const cat = img.category || 'general';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const availableCategories = ['all', ...Object.keys(categoryCounts).sort()];

  // Filter images
  const filteredImages = images.filter((img) => {
    const matchesCategory = activeCategory === 'all' || img.category === activeCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      img.filename.toLowerCase().includes(term) || 
      img.url.toLowerCase().includes(term) ||
      (img.category && img.category.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1633] w-full max-w-5xl h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Media Library &amp; Photo Picker
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 font-semibold">
                  Cross-Category
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose from <span className="font-semibold text-slate-700 dark:text-slate-300">{images.length} previously uploaded photos</span> across all categories to use for {targetCategoryLabel}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadPhotos}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh photos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Filters, and Quick Upload */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search photos by filename, category or path..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Upload Button toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUploadDrawer(!showUploadDrawer)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showUploadDrawer
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New to Library</span>
              </button>
            </div>
          </div>

          {/* Upload Drawer (optional dropzone inside media library) */}
          {showUploadDrawer && (
            <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-950/20 space-y-3 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Save to category:</span>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as ImageCategory)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="projects">projects/</option>
                    <option value="experience">experience/</option>
                    <option value="certifications">certifications/</option>
                    <option value="achievements">achievements/</option>
                    <option value="mentoring">mentoring/</option>
                    <option value="events">events/</option>
                    <option value="gallery">gallery/</option>
                    <option value="profile">profile/</option>
                    <option value="carousel">carousel/</option>
                    <option value="general">general/</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleDirectUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Choose File from Computer'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {availableCategories.map((cat) => {
              const count = cat === 'all' ? images.length : categoryCounts[cat] || 0;
              const isSelected = activeCategory === cat;
              const colorInfo = CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="capitalize">{cat}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected 
                      ? 'bg-white/20 dark:bg-black/20 text-current' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Photos Grid Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/50 dark:bg-[#070e24]">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
              <p className="text-xs font-mono">Loading all photos across categories...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <ImageIcon className="w-10 h-10 text-slate-400/50" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No photos found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                {searchTerm 
                  ? `No photos matched "${searchTerm}". Try a different search term or category.`
                  : 'No photos exist in this category yet. Click "Upload New to Library" to add one.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredImages.map((img) => {
                const isSelected = selectedUrl === img.url;
                const catColor = CATEGORY_COLORS[img.category] || CATEGORY_COLORS.general;

                return (
                  <div
                    key={img.url}
                    onClick={() => handleSelect(img)}
                    className={`group relative rounded-xl border overflow-hidden cursor-pointer bg-white dark:bg-[#0c1633] transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-sky-500 ring-2 ring-sky-500/40 shadow-lg scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={img.url}
                        alt={img.filename}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Selected Checkmark overlay */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md animate-in zoom-in-75">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Hover external link button */}
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View full resolution"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Metadata strip */}
                    <div className="p-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                          {img.category}
                        </span>
                        {img.source === 'uploaded' && (
                          <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-0.5">
                            Disk
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={img.filename}>
                        {img.filename}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Selected Item info and Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {selectedUrl ? (
              <>
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                  <img src={selectedUrl} alt="Selected" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Selected Photo:</span>
                    {selectedItem?.category && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400">
                        Category: {selectedItem.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-500 truncate max-w-md">{selectedUrl}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Click on any photo above to select it for <span className="font-semibold text-slate-600 dark:text-slate-300">{targetCategoryLabel}</span>.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedUrl}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Use as {targetCategoryLabel} Photo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
