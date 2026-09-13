import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Plus, 
  Layers, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  Image as ImageIcon, 
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { MediaLibraryModal } from './MediaLibraryModal';
import { uploadImageFile, ImageCategory } from '../../utils/imageUpload';

interface MultiPhotoFieldProps {
  label: string;
  category: ImageCategory;
  primaryPhoto?: string;
  onChangePrimaryPhoto: (url: string) => void;
  photos: string[];
  onChangePhotos: (photos: string[]) => void;
  description?: string;
}

export const MultiPhotoField: React.FC<MultiPhotoFieldProps> = ({
  label,
  category,
  primaryPhoto = '',
  onChangePrimaryPhoto,
  photos = [],
  onChangePhotos,
  description
}) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryMode, setLibraryMode] = useState<'primary' | 'additional'>('primary');
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openLibraryForPrimary = () => {
    setLibraryMode('primary');
    setIsLibraryOpen(true);
  };

  const openLibraryForAdditional = () => {
    setLibraryMode('additional');
    setIsLibraryOpen(true);
  };

  const handleLibrarySelect = (url: string) => {
    if (libraryMode === 'primary') {
      onChangePrimaryPhoto(url);
    } else {
      if (!photos.includes(url) && url !== primaryPhoto) {
        onChangePhotos([...photos, url]);
      }
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImageFile(file, { category });
      if (res.url) {
        if (!primaryPhoto) {
          onChangePrimaryPhoto(res.url);
        } else {
          onChangePhotos([...photos, res.url]);
        }
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    const clean = urlInputValue.trim();
    if (!clean) return;
    if (!primaryPhoto) {
      onChangePrimaryPhoto(clean);
    } else if (!photos.includes(clean)) {
      onChangePhotos([...photos, clean]);
    }
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    onChangePhotos(updated);
  };

  const handlePromoteToPrimary = (index: number) => {
    const targetUrl = photos[index];
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    if (primaryPhoto) {
      updatedPhotos.unshift(primaryPhoto);
    }
    onChangePrimaryPhoto(targetUrl);
    onChangePhotos(updatedPhotos);
  };

  const handleMovePhoto = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= photos.length) return;
    const updated = [...photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChangePhotos(updated);
  };

  const allPhotosCount = (primaryPhoto ? 1 : 0) + photos.length;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-sky-500" />
            <span>{label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-normal bg-sky-500/10 text-sky-600 dark:text-sky-400">
              {allPhotosCount} {allPhotosCount === 1 ? 'photo' : 'photos'}
            </span>
          </label>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-1.5">
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
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-1 transition-colors"
            title="Upload from computer"
          >
            <Upload className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            type="button"
            onClick={openLibraryForAdditional}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1 shadow-sm transition-colors"
            title="Select from Media Library"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Browse Library</span>
          </button>
        </div>
      </div>

      {/* Primary Cover Photo Card */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-800/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Primary Cover Photo
          </span>
          {primaryPhoto && (
            <button
              type="button"
              onClick={() => onChangePrimaryPhoto('')}
              className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove Cover</span>
            </button>
          )}
        </div>

        {primaryPhoto ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 group">
              <img 
                src={primaryPhoto} 
                alt="Primary Cover" 
                className="w-full h-full object-cover" 
                onError={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
              />
              <a
                href={primaryPhoto}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="View full image"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate max-w-md">
                {primaryPhoto}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openLibraryForPrimary}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Change Cover
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={openLibraryForPrimary}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-sky-500/50 hover:bg-sky-500/5 transition-all"
          >
            <ImageIcon className="w-6 h-6 mx-auto text-slate-400 mb-1" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">No primary cover photo set</p>
            <p className="text-[11px] text-slate-400">Click to choose from Media Library or upload</p>
          </div>
        )}
      </div>

      {/* Additional Photos Gallery List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            Additional Gallery Photos ({photos.length})
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
          >
            {showUrlInput ? 'Cancel' : '+ Add via URL'}
          </button>
        </div>

        {/* URL Input collapse */}
        {showUrlInput && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-1">
            <input
              type="text"
              placeholder="Paste image URL (https://... or /static/images/...)"
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInputValue.trim()}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        )}

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {photos.map((url, idx) => (
              <div 
                key={`${url}-${idx}`}
                className="group relative rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={url} 
                    alt={`Gallery ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
                  />

                  {/* Number Badge */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-mono flex items-center justify-center">
                    {idx + 1}
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove from gallery"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Reorder and promote controls overlay */}
                  <div className="absolute bottom-1 inset-x-1 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-lg text-white">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePhoto(idx, 'left')}
                      className="p-1 rounded hover:bg-white/20 disabled:opacity-30"
                      title="Move earlier"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePromoteToPrimary(idx)}
                      className="text-[10px] font-medium hover:text-amber-300 flex items-center gap-0.5 px-1"
                      title="Make Primary Cover Photo"
                    >
                      <Star className="w-2.5 h-2.5 text-amber-400" />
                      <span>Make Cover</span>
                    </button>

                    <button
                      type="button"
                      disabled={idx === photos.length - 1}
                      onClick={() => handleMovePhoto(idx, 'right')}
                      className="p-1 rounded hover:bg-white/20 disabled:opacity-30"
                      title="Move later"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-1.5">
                  <p className="text-[10px] font-mono text-slate-500 truncate" title={url}>
                    {url.split('/').pop() || url}
                  </p>
                </div>
              </div>
            ))}

            {/* Quick Add Card */}
            <button
              type="button"
              onClick={openLibraryForAdditional}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-sky-500 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-medium">Add Photo</span>
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center bg-white/40 dark:bg-slate-800/30">
            <p className="text-xs text-slate-500">No additional photos attached yet.</p>
            <button
              type="button"
              onClick={openLibraryForAdditional}
              className="mt-1 text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add photos from library or computer</span>
            </button>
          </div>
        )}
      </div>

      {/* Media Library Modal instance */}
      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPhoto={handleLibrarySelect}
        targetCategoryLabel={libraryMode === 'primary' ? `${label} Cover` : `${label} Gallery`}
        defaultCategoryFilter={category}
      />
    </div>
  );
};
