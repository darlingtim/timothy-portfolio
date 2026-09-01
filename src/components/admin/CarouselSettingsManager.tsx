import React, { useState, useRef } from 'react';
import { 
  RotateCw, 
  Pin, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  Image as ImageIcon, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { CarouselConfig, CarouselPhoto } from '../../types';

interface CarouselSettingsManagerProps {
  config: CarouselConfig;
  onSaveConfig: (updated: CarouselConfig) => void;
}

export const CarouselSettingsManager: React.FC<CarouselSettingsManagerProps> = ({
  config,
  onSaveConfig
}) => {
  const [formData, setFormData] = useState<CarouselConfig>(config);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (mode: 'carousel' | 'steady') => {
    const updated = {
      ...formData,
      mode,
      autoPlay: mode === 'carousel'
    };
    setFormData(updated);
  };

  const handleSteadyPhotoSelect = (id: string) => {
    const updated = {
      ...formData,
      mode: 'steady' as const,
      steadyPhotoId: id,
      autoPlay: false
    };
    setFormData(updated);
  };

  const handleToggleInclude = (id: string) => {
    const updatedPhotos = formData.photos.map(p => 
      p.id === id ? { ...p, isIncludedInCarousel: !p.isIncludedInCarousel } : p
    );
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const handleDeletePhoto = (id: string) => {
    const updatedPhotos = formData.photos.filter(p => p.id !== id);
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const newPhotos = [...formData.photos];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newPhotos.length) return;
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIdx];
    newPhotos[targetIdx] = temp;
    setFormData({ ...formData, photos: newPhotos });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newPhoto: CarouselPhoto = {
        id: `photo-${Date.now()}`,
        url: dataUrl,
        caption: newPhotoCaption.trim() || 'Timothy Ododo Portfolio Photo',
        tag: newPhotoTag.trim() || 'Portfolio',
        isIncludedInCarousel: true,
        order: formData.photos.length + 1,
        dateAdded: new Date().toISOString()
      };
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto]
      }));
      setNewPhotoCaption('');
      setNewPhotoTag('');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrlPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    const newPhoto: CarouselPhoto = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Timothy Ododo Portfolio Photo',
      tag: newPhotoTag.trim() || 'Portfolio',
      isIncludedInCarousel: true,
      order: formData.photos.length + 1,
      dateAdded: new Date().toISOString()
    };
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoTag('');
  };

  const handleSave = () => {
    onSaveConfig(formData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-semibold text-sm shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>Carousel &amp; Steady Photo settings saved globally to server!</span>
        </div>
      )}

      {/* Intro & Mode Selector Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <span>Intro Section Photo Carousel &amp; Steady Control</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure whether the intro hero section displays a fading photo carousel or stays steady on your favorite picture.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <Check className="w-4 h-4" />
            <span>Save Carousel Settings</span>
          </button>
        </div>

        {/* Mode Toggle Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => handleModeChange('carousel')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              formData.mode === 'carousel'
                ? 'border-sky-500 bg-sky-50/20 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2.5 rounded-xl ${formData.mode === 'carousel' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <RotateCw className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Fading Photo Carousel
                </h4>
                <span className="text-xs text-slate-500">
                  Smoothly cross-dissolves through selected photos
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Cycles through all active photos with elegant cross-dissolve fade transitions. Works on both mobile and desktop.
            </p>
          </div>

          <div
            onClick={() => handleModeChange('steady')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              formData.mode === 'steady'
                ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2.5 rounded-xl ${formData.mode === 'steady' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <Pin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Steady Picture Locked
                </h4>
                <span className="text-xs text-slate-500">
                  Locks permanently on any chosen photo of choice
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Keeps a single, steady signature photograph displayed in the hero section without auto-advancing.
            </p>
          </div>
        </div>

        {/* Carousel Timing Setting */}
        {formData.mode === 'carousel' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-sky-500" />
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                  Transition Fade Interval
                </span>
                <span className="text-xs text-slate-500">
                  How many seconds each photo displays before smoothly fading into the next
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[3, 4, 5, 7].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setFormData({ ...formData, intervalSeconds: sec })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                    formData.intervalSeconds === sec
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photos Library & Manager */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Photos Library ({formData.photos.length})
            </h4>
            <p className="text-xs text-slate-500">
              Manage photos, set captions, and choose which one is the Steady Default or included in the carousel.
            </p>
          </div>
        </div>

        {/* Existing Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.photos.map((photo, index) => {
            const isSteady = formData.steadyPhotoId === photo.id;
            return (
              <div
                key={photo.id}
                className={`rounded-2xl border-2 overflow-hidden flex flex-col justify-between transition-all ${
                  isSteady 
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div>
                  <div className="h-44 relative overflow-hidden bg-slate-900">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Tag badge */}
                    {photo.tag && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur-xs">
                        {photo.tag}
                      </span>
                    )}

                    {/* Steady Indicator */}
                    {isSteady && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                        <Pin className="w-3 h-3" />
                        Steady Default
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                        Caption / Description:
                      </label>
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            photos: formData.photos.map(p => p.id === photo.id ? { ...p, caption: val } : p)
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                        Category Tag:
                      </label>
                      <input
                        type="text"
                        value={photo.tag || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            photos: formData.photos.map(p => p.id === photo.id ? { ...p, tag: val } : p)
                          });
                        }}
                        placeholder="e.g. STEM Trainer"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => handleSteadyPhotoSelect(photo.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors ${
                      isSteady 
                        ? 'bg-amber-500/20 text-amber-500' 
                        : 'text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                    <span>{isSteady ? 'Locked Steady' : 'Set as Steady'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMovePhoto(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMovePhoto(index, 'down')}
                      disabled={index === formData.photos.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Photo Card */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
          <h5 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-500" />
            <span>Add New Photo to Carousel</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Photo Caption
              </label>
              <input
                type="text"
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                placeholder="e.g. Speaking at Innovation Summit"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category Tag
              </label>
              <input
                type="text"
                value={newPhotoTag}
                onChange={(e) => setNewPhotoTag(e.target.value)}
                placeholder="e.g. Innovation Tech Lead"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Direct Web URL
              </label>
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Reading file...' : 'Upload Image from Computer'}</span>
              </button>
            </div>

            {newPhotoUrl && (
              <button
                type="button"
                onClick={handleAddUrlPhoto}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add from URL</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
