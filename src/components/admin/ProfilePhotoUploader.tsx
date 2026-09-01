import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ProfilePhotoUploaderProps {
  currentAvatarUrl?: string;
  onSaveAvatar: (newUrl: string) => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80"
];

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  currentAvatarUrl = '',
  onSaveAvatar
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
      onSaveAvatar(dataUrl);
      setIsUploading(false);
      triggerSuccess();
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    onSaveAvatar(urlInput.trim());
    setUrlInput('');
    triggerSuccess();
  };

  const handleSelectPreset = (url: string) => {
    setPreviewUrl(url);
    onSaveAvatar(url);
    triggerSuccess();
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    onSaveAvatar('');
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Profile Photo Manager
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload from your computer, provide an image link, or select a preset.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Updated across site!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Live Preview Avatar Card */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full ring-4 ring-sky-500/30 overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-lg">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="font-display text-2xl font-bold text-slate-400">TO</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium transition-opacity cursor-pointer"
            >
              <Upload className="w-5 h-5 mb-1" />
              <span>Change Photo</span>
            </button>
          </div>

          <div>
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
              Live Preview
            </span>
            <span className="text-[11px] text-slate-500">
              Appears on Hero, Header, and Sidebar
            </span>
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          )}
        </div>

        {/* Upload Options and Inputs */}
        <div className="md:col-span-8 space-y-5">
          {/* File Upload Trigger */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-950/40 text-center transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white block">
              {isUploading ? "Processing photo..." : "Click to browse or drop an image file"}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Supports PNG, JPG, JPEG, WebP, SVG (High Resolution recommended)
            </span>
          </div>

          {/* Web URL Form */}
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
              Or paste direct Image Web URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/my-portrait.jpg"
                className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Apply URL
              </button>
            </div>
          </form>

          {/* Preset Quick Select */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-mono text-slate-500 block">
              Or choose from curated professional portraits:
            </span>
            <div className="flex items-center gap-3">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(url)}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                    previewUrl === url ? "border-sky-500 ring-2 ring-sky-500/40" : "border-transparent"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Preset ${i + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
