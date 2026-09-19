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
  FolderInput,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  Layers,
  Copy,
  Folder
} from 'lucide-react';
import { 
  fetchMediaImages, 
  uploadImageFile, 
  moveMediaImages, 
  deleteMediaImages, 
  deduplicateMediaImages,
  MediaImageItem, 
  ImageCategory 
} from '../../utils/imageUpload';
import { applyImageMoveSync } from '../../utils/imageSync';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto?: (url: string, item?: MediaImageItem) => void;
  targetCategoryLabel?: string;
  defaultCategoryFilter?: string;
  onDataSync?: (updatedData?: any, moved?: any[]) => void;
  mode?: 'picker' | 'manage';
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  all: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' },
  projects: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  experience: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
  education: { bg: 'bg-blue-600/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  certifications: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  achievements: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  mentoring: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  events: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  gallery: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  profile: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  carousel: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  general: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

const ALL_CATEGORY_OPTIONS: ImageCategory[] = [
  'carousel',
  'events',
  'projects',
  'mentoring',
  'experience',
  'education',
  'gallery',
  'certifications',
  'achievements',
  'profile',
  'general'
];

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPhoto,
  targetCategoryLabel = 'Item',
  defaultCategoryFilter = 'all',
  onDataSync,
  mode
}) => {
  if (!isOpen) return null;

  const isManageMode = mode === 'manage' || !onSelectPhoto || targetCategoryLabel === 'Universal Media Library' || targetCategoryLabel === 'Portfolio Item';

  const [images, setImages] = useState<MediaImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MediaImageItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategoryFilter);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<ImageCategory>('general');
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-select for batch actions
  const [checkedUrls, setCheckedUrls] = useState<Set<string>>(new Set());
  const [batchTargetCategory, setBatchTargetCategory] = useState<ImageCategory>('general');
  const [isBatchOperating, setIsBatchOperating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [confirmDeleteUrls, setConfirmDeleteUrls] = useState<string[] | null>(null);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());

  const handleCopyUrl = (url: string) => {
    if (!url) return;
    try {
      navigator.clipboard.writeText(url);
      setHasCopiedUrl(true);
      showNotification('success', 'Image URL copied to clipboard!');
      setTimeout(() => setHasCopiedUrl(false), 2500);
    } catch {
      showNotification('info', url);
    }
  };

  const loadPhotos = async () => {
    setLoading(true);
    setBrokenUrls(new Set());
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

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const handleSelect = (item: MediaImageItem) => {
    setSelectedUrl(item.url);
    setSelectedItem(item);
  };

  const handleConfirm = () => {
    if (!selectedUrl) return;
    onSelectPhoto?.(selectedUrl, selectedItem || undefined);
    onClose();
  };

  const handleToggleCheck = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (checkedUrls.size === filteredImages.length) {
      setCheckedUrls(new Set());
    } else {
      setCheckedUrls(new Set(filteredImages.map((img) => img.url)));
    }
  };

  const handleBatchMove = async () => {
    const urls: string[] = Array.from(checkedUrls);
    if (urls.length === 0) return;
    setIsBatchOperating(true);

    // Optimistically update category tags in local state
    setImages((prev) =>
      prev.map((item) => {
        if (checkedUrls.has(item.url)) {
          return { ...item, category: batchTargetCategory };
        }
        return item;
      })
    );

    try {
      const res = await moveMediaImages(urls, batchTargetCategory);
      if (res.success) {
        // Authoritative update with returned newUrls and categories
        setImages((prev) =>
          prev.map((item) => {
            const movedItem = res.moved?.find((m) => m.oldUrl === item.url);
            if (movedItem) {
              return {
                ...item,
                url: movedItem.newUrl,
                category: (movedItem.targetCategory || batchTargetCategory).toLowerCase(),
                filename: movedItem.filename || item.filename
              };
            }
            return item;
          })
        );
        if (selectedUrl && res.moved) {
          const movedSel = res.moved.find((m) => m.oldUrl === selectedUrl);
          if (movedSel) setSelectedUrl(movedSel.newUrl);
        }
        applyImageMoveSync(res.moved, res.updatedData);
        onDataSync?.(res.updatedData, res.moved);
        showNotification('success', `Moved ${res.movedCount} photo(s) to "${batchTargetCategory}". Categories and references synced across app.`);
        setCheckedUrls(new Set());
        await loadPhotos();
      } else {
        showNotification('error', res.error || 'Failed to move photos');
        await loadPhotos();
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error moving photos');
      await loadPhotos();
    } finally {
      setIsBatchOperating(false);
    }
  };

  const handleBatchDelete = async () => {
    const urls: string[] = confirmDeleteUrls || Array.from(checkedUrls);
    if (urls.length === 0) return;
    setIsBatchOperating(true);
    try {
      const res = await deleteMediaImages(urls);
      if (res.success) {
        const count = res.deletedCount > 0 ? res.deletedCount : urls.length;
        showNotification('success', `Permanently deleted ${count} photo(s).`);
        // Immediately remove deleted photos from UI state
        setImages((prev) => prev.filter((img) => !urls.includes(img.url)));
        setCheckedUrls(new Set());
        setConfirmDeleteUrls(null);
        if (urls.includes(selectedUrl)) {
          setSelectedUrl('');
          setSelectedItem(null);
        }
        await loadPhotos();
      } else {
        showNotification('error', res.error || 'Failed to delete photos');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error deleting photos');
    } finally {
      setIsBatchOperating(false);
      setConfirmDeleteUrls(null);
    }
  };

  const handleDeduplicate = async () => {
    setIsBatchOperating(true);
    try {
      const res = await deduplicateMediaImages();
      if (res.success) {
        if (res.removedCount > 0) {
          const kb = (res.savedBytes / 1024).toFixed(1);
          showNotification('success', `Cleaned ${res.removedCount} duplicate file(s) and freed ${kb} KB! All references updated.`);
        } else {
          showNotification('info', 'No duplicate photos found across folders. All photos are unique!');
        }
        await loadPhotos();
      } else {
        showNotification('error', res.error || 'Failed to clean duplicates');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error deduplicating photos');
    } finally {
      setIsBatchOperating(false);
    }
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
        showNotification('success', `Uploaded "${res.filename || file.name}" to "${res.category || uploadCategory}".`);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      showNotification('error', 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  // Category counts
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
      <div className="bg-white dark:bg-[#0c1633] w-full max-w-5xl h-[92vh] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-[#0c1633] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Universal Media Library
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-normal">
                  {images.length} photos
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {isManageMode
                  ? 'Browse, upload, organize by category, clean duplicates, or copy photo URLs.'
                  : <>Select a photo for <span className="text-sky-500 font-medium">{targetCategoryLabel}</span> or upload a new one.</>
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDeduplicate}
              disabled={isBatchOperating}
              title="Clean duplicate photo files and point all references to canonical images"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clean Duplicates</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUploadDrawer(!showUploadDrawer)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className={`px-4 py-2 text-xs font-medium flex items-center justify-between border-b ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
          }`}>
            <span>{statusMessage.text}</span>
            <button type="button" onClick={() => setStatusMessage(null)} className="hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Upload Drawer (Collapsible) */}
        {showUploadDrawer && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Folder className="w-4 h-4 text-sky-500" />
                <span>Save photo into category folder:</span>
              </div>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as ImageCategory)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {ALL_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}/
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDirectUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isUploading ? 'Uploading...' : 'Choose File from Device'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUploadDrawer(false)}
                className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Toolbar: Search, Category Filters & Batch Multi-Select Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search photos by filename, url, or folder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Actions & Refresh */}
            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                title="Select all filtered photos for batch actions"
              >
                {checkedUrls.size > 0 && checkedUrls.size === filteredImages.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-sky-500" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{checkedUrls.size > 0 ? `Deselect All (${checkedUrls.size})` : 'Select All'}</span>
              </button>

              <button
                type="button"
                onClick={loadPhotos}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh library"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {availableCategories.map((cat) => {
              const isActive = activeCategory === cat;
              const count = cat === 'all' ? images.length : (categoryCounts[cat] || 0);
              const colorInfo = CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <span className="capitalize">{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Batch Operations Floating Bar (Appears when 1+ photos are checked) */}
        {checkedUrls.size > 0 && (
          <div className="bg-sky-500/10 dark:bg-sky-950/40 border-b border-sky-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sky-600 dark:text-sky-400">
                {checkedUrls.size} photo{checkedUrls.size > 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={() => setCheckedUrls(new Set())}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline text-[11px]"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Move to folder */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Move to:</span>
                <select
                  value={batchTargetCategory}
                  onChange={(e) => setBatchTargetCategory(e.target.value as ImageCategory)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {ALL_CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}/
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBatchMove}
                  disabled={isBatchOperating}
                  className="px-3 py-1 rounded-lg font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1 shadow-sm disabled:opacity-50"
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>Move</span>
                </button>
              </div>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

              {/* Delete permanently */}
              <button
                type="button"
                onClick={() => setConfirmDeleteUrls(Array.from(checkedUrls))}
                disabled={isBatchOperating}
                className="px-3 py-1 rounded-lg font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Deletion */}
        {confirmDeleteUrls && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3 text-rose-500">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Photos Completely?</h3>
                  <p className="text-xs text-slate-500">This action permanently deletes the files from the server.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to permanently delete <strong className="text-rose-500">{confirmDeleteUrls.length} photo(s)</strong>? If any entity uses them, the image URL will no longer be available.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteUrls(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  disabled={isBatchOperating}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete Completely</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid of Photos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-xs font-mono">Loading media library photos...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No photos found</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {searchTerm 
                    ? `No photos match query "${searchTerm}". Try a different folder or search term.`
                    : 'Upload photos or click "Select File" to add images to this category.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadDrawer(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload a Photo</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredImages.map((img) => {
                const isSelected = selectedUrl === img.url;
                const isChecked = checkedUrls.has(img.url);
                const catColor = CATEGORY_COLORS[img.category] || CATEGORY_COLORS.general;

                return (
                  <div
                    key={img.url}
                    onClick={() => handleSelect(img)}
                    className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 flex flex-col bg-white dark:bg-slate-900/60 ${
                      isSelected
                        ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-lg scale-[1.01]'
                        : isChecked
                        ? 'border-sky-400 dark:border-sky-500 bg-sky-50/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    {/* Image Thumbnail */}
                    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {brokenUrls.has(img.url) ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 p-2 text-center">
                          <Folder className="w-6 h-6 mb-1 text-slate-400" />
                          <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-500">
                            {img.category}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={() => {
                            setBrokenUrls((prev) => new Set(prev).add(img.url));
                          }}
                        />
                      )}

                      {/* Multi-Select Checkbox in top-left */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleCheck(img.url, e)}
                        className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-sky-600 text-white shadow-md'
                            : 'bg-black/50 text-white opacity-60 hover:opacity-100 group-hover:opacity-100'
                        }`}
                        title={isChecked ? 'Deselect photo' : 'Select photo for batch move or delete'}
                      >
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>

                      {/* Selected Indicator Badge in top-right */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md animate-in zoom-in-50">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Hover Action Strip */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(img.url);
                            showNotification('info', 'Photo URL copied to clipboard');
                          }}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white"
                          title="Copy Photo URL"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white"
                          title="View full resolution in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Metadata strip */}
                    <div className="p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                          {img.category}
                        </span>
                        {img.source === 'uploaded' && (
                          <span className="text-[9px] font-mono text-emerald-500">
                            Disk
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={img.filename}>
                        {img.filename}
                      </p>
                      
                      {/* Quick Move / Delete Actions */}
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                        <select
                          value={img.category.toLowerCase()}
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            e.stopPropagation();
                            const newCat = e.target.value.toLowerCase() as ImageCategory;
                            if (newCat === img.category.toLowerCase()) return;

                            // 1. Optimistic update
                            setImages((prev) =>
                              prev.map((item) =>
                                item.url === img.url ? { ...item, category: newCat } : item
                              )
                            );

                            try {
                              const res = await moveMediaImages([img.url], newCat);
                              if (res.success) {
                                // 2. Authoritative update
                                setImages((prev) =>
                                  prev.map((item) => {
                                    const movedItem = res.moved?.find((m) => m.oldUrl === item.url);
                                    if (movedItem) {
                                      return {
                                        ...item,
                                        url: movedItem.newUrl,
                                        category: (movedItem.targetCategory || newCat).toLowerCase(),
                                        filename: movedItem.filename || item.filename
                                      };
                                    }
                                    return item;
                                  })
                                );
                                if (selectedUrl === img.url && res.moved?.[0]) {
                                  setSelectedUrl(res.moved[0].newUrl);
                                }
                                applyImageMoveSync(res.moved, res.updatedData);
                                onDataSync?.(res.updatedData, res.moved);
                                showNotification('success', `Moved to "${newCat}". Category and references synced across app.`);
                                await loadPhotos();
                              } else {
                                showNotification('error', res.error || `Failed to move image to "${newCat}".`);
                                await loadPhotos();
                              }
                            } catch (err: any) {
                              showNotification('error', err.message || `Failed to move image to "${newCat}".`);
                              await loadPhotos();
                            }
                          }}
                          className="text-[10px] py-0.5 px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none focus:ring-1 focus:ring-sky-500"
                          title="Quick move to folder"
                        >
                          {ALL_CATEGORY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteUrls([img.url]);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete photo completely"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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
                  <img
                    src={selectedUrl}
                    alt="Selected"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.5';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Selected Photo:</span>
                    {selectedItem?.category && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 capitalize">
                        {selectedItem.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-500 truncate max-w-md">{selectedUrl}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {isManageMode ? (
                  <>
                    <Folder className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>Click on any photo to inspect, copy its URL, or change category. Check multiple photos to batch move or delete.</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Click on any photo to choose it for <span className="font-semibold text-slate-600 dark:text-slate-300">{targetCategoryLabel}</span>.</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            {isManageMode ? (
              <>
                {selectedUrl && (
                  <>
                    <a
                      href={selectedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                      title="Open full-size image in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(selectedUrl)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                    >
                      {hasCopiedUrl ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-500">Copied URL!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Image URL</span>
                        </>
                      )}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                >
                  Close
                </button>
              </>
            ) : (
              <>
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
                  <span>Use as {targetCategoryLabel} Image</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
