import React, { useState, useEffect } from 'react';
import { X, Award, Check, Upload, Trash2, ExternalLink, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { Achievement, CustomField } from '../../types';
import { uploadImageFile } from '../../utils/imageUpload';
import { CustomFieldEditor } from './CustomFieldEditor';
import { MediaLibraryModal } from './MediaLibraryModal';

interface AchievementModalProps {
  isOpen: boolean;
  achievementToEdit: Achievement | null;
  onClose: () => void;
  onSave: (item: Achievement) => void;
  onDelete?: (id: string) => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  achievementToEdit,
  onClose,
  onSave,
  onDelete
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<Achievement>>({
    title: '',
    issuer: '',
    year: new Date().getFullYear().toString(),
    track: 'Technical',
    category: 'Certification',
    description: '',
    icon: 'award',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    credentialUrl: '',
    customFields: []
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  useEffect(() => {
    if (achievementToEdit) {
      setFormData({ ...achievementToEdit });
    } else {
      setFormData({
        title: '',
        issuer: '',
        year: new Date().getFullYear().toString(),
        category: 'Certification',
        description: '',
        icon: 'award',
        date: new Date().toISOString().split('T')[0],
        imageUrl: '',
        credentialUrl: '',
        customFields: []
      });
    }
  }, [achievementToEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    uploadImageFile(file, { category: 'certifications' })
      .then((result) => {
        if (result.url) {
          setFormData((prev) => ({ ...prev, imageUrl: result.url }));
        }
      })
      .catch((err) => {
        console.error('Failed to upload certificate/award photo:', err);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.issuer?.trim()) return;

    const finalAch: Achievement = {
      id: achievementToEdit?.id || `ach-${Date.now()}`,
      title: formData.title.trim(),
      issuer: formData.issuer.trim(),
      year: formData.year || new Date().getFullYear().toString(),
      track: (formData.track as any) || 'Technical',
      category: (formData.category as any) || 'Certification',
      description: formData.description || '',
      icon: formData.icon || 'award',
      date: formData.date || '',
      imageUrl: formData.imageUrl?.trim() || undefined,
      credentialUrl: formData.credentialUrl?.trim() || undefined,
      customFields: formData.customFields || []
    };

    onSave(finalAch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1633] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {achievementToEdit ? `Edit Achievement: ${achievementToEdit.title}` : 'Add Achievement / Award'}
              </h3>
              <p className="text-xs text-slate-500">
                Certificates, honors, hackathon awards, and recognitions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form id="achievement-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Award / Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Google IT Support Professional"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Issuer / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="e.g. Google / Coursera / SID"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Track Classification
                </label>
                <select
                  value={formData.track || 'Technical'}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="Technical">Technical (IT, Cloud, Dev, Hardware)</option>
                  <option value="Non-Technical">Non-Technical (Leadership, Peace, SDGs, Scholarship)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="Certification">Certification</option>
                  <option value="Award">Award</option>
                  <option value="Recognition">Recognition</option>
                  <option value="Fellowship">Fellowship</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Year
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Description / Significance
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this credential or honor signify?"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Certificate / Award Photo Upload */}
            <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                    Certificate Photo / Award Badge
                  </label>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                  Folder: static/images/certifications
                </span>
              </div>

              {formData.imageUrl ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Certificate preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={formData.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-xs font-mono text-slate-500 truncate">{formData.imageUrl}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaLibraryOpen(true)}
                        className="px-2.5 py-1 rounded border border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-400 text-xs hover:bg-sky-50 dark:hover:bg-sky-950/40 flex items-center gap-1 transition-colors font-medium"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Change from Library</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="px-2.5 py-1 rounded border border-rose-300 dark:border-rose-800 text-rose-500 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-xl cursor-pointer bg-white dark:bg-slate-900 transition-colors p-2 text-center group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-500 mb-1 transition-colors" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isUploading ? 'Uploading...' : 'Upload Image File'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsMediaLibraryOpen(true)}
                      className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-sky-300 dark:border-sky-800/80 hover:border-sky-500 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors p-2 text-center group"
                    >
                      <FolderOpen className="w-5 h-5 text-sky-500 mb-1 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                        Choose from Photo Library
                      </span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Or enter image URL: /static/images/certifications/... or https://..."
                    className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Custom metadata */}
            <CustomFieldEditor
              customFields={formData.customFields || []}
              onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              title="Achievement Custom Fields (Credential ID, Verification URL, etc.)"
            />

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            {achievementToEdit && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(achievementToEdit.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Distinction</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
          <button
            type="submit"
            form="achievement-form"
            className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{achievementToEdit ? 'Save Changes' : 'Add Achievement'}</span>
          </button>
        </div>

      </div>

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        targetCategoryLabel="Achievement / Certificate"
        defaultCategoryFilter="certifications"
        onSelectPhoto={(url) => {
          setFormData((prev) => ({ ...prev, imageUrl: url }));
        }}
      />
    </div>
  );
};
