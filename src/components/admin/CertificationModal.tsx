import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Upload, Trash2, Check, ExternalLink, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { Certification, CustomField } from '../../types';
import { uploadImageFile } from '../../utils/imageUpload';
import { CustomFieldEditor } from './CustomFieldEditor';
import { MediaLibraryModal } from './MediaLibraryModal';

interface CertificationModalProps {
  isOpen: boolean;
  certificationToEdit: Certification | null;
  onClose: () => void;
  onSave: (cert: Certification) => void;
}

export const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  certificationToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<Certification>>({
    name: '',
    issuer: '',
    year: new Date().getFullYear().toString(),
    track: 'Technical',
    credentialUrl: '',
    description: '',
    skillsCovered: [],
    imageUrl: '',
    customFields: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  useEffect(() => {
    if (certificationToEdit) {
      setFormData({
        ...certificationToEdit,
        skillsCovered: certificationToEdit.skillsCovered || [],
        customFields: certificationToEdit.customFields || []
      });
    } else {
      setFormData({
        name: '',
        issuer: '',
        year: new Date().getFullYear().toString(),
        track: 'Technical',
        credentialUrl: '',
        description: '',
        skillsCovered: [],
        imageUrl: '',
        customFields: []
      });
    }
  }, [certificationToEdit]);

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
        console.error('Failed to upload certification photo:', err);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const current = formData.skillsCovered || [];
    if (!current.includes(skillInput.trim())) {
      setFormData({ ...formData, skillsCovered: [...current, skillInput.trim()] });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skillsCovered: (formData.skillsCovered || []).filter((s) => s !== skillToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.issuer?.trim()) return;

    const finalCert: Certification = {
      id: certificationToEdit?.id || `cert-${Date.now()}`,
      name: formData.name.trim(),
      issuer: formData.issuer.trim(),
      year: formData.year || new Date().getFullYear().toString(),
      track: formData.track || 'Technical',
      credentialUrl: formData.credentialUrl?.trim() || '',
      description: formData.description?.trim() || '',
      skillsCovered: formData.skillsCovered || [],
      imageUrl: formData.imageUrl?.trim() || undefined,
      customFields: formData.customFields || []
    };

    onSave(finalCert);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              {certificationToEdit ? 'Edit Professional Certification' : 'Add Professional Certification'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Certification Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Google IT Support Professional Certificate"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issuing Organization *
              </label>
              <input
                type="text"
                required
                value={formData.issuer || ''}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g. Google, Microsoft, Raspberry Pi Foundation"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Year Issued / Validity
              </label>
              <input
                type="text"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g. 2024"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Track Category
              </label>
              <select
                value={formData.track || 'Technical'}
                onChange={(e) => setFormData({ ...formData, track: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Technical">Technical &amp; IT Systems</option>
                <option value="Non-Technical">Non-Technical &amp; Leadership</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Public Verification Credential URL
            </label>
            <input
              type="url"
              value={formData.credentialUrl || ''}
              onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
              placeholder="https://coursera.org/verify/..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Program Description &amp; Scope
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of knowledge areas, capstone projects, or examinations passed..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Certificate Photo Upload (Category: certifications) */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Certificate Photo / Badge Preview
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                Folder: static/images/certifications
              </span>
            </div>

            {formData.imageUrl ? (
              <div className="flex items-center gap-4">
                <div className="relative w-36 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Certificate Preview"
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
                <div className="space-y-2 flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-500 truncate">{formData.imageUrl}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMediaLibraryOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-400 text-xs hover:bg-sky-50 dark:hover:bg-sky-950/40 flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Change from Library</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-500 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-white dark:bg-slate-900 transition-colors p-2 text-center group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 mb-1 transition-colors" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isUploading ? 'Uploading to static/images/certifications...' : 'Upload Certificate Photo'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, SVG, WebP</span>
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
                    className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-sky-300 dark:border-sky-800/80 hover:border-sky-500 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors p-2 text-center group"
                  >
                    <FolderOpen className="w-5 h-5 text-sky-500 mb-1 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                      Choose from Photo Library
                    </span>
                    <span className="text-[10px] text-slate-400">Pick any photo from any category</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 shrink-0">or enter image path / URL:</span>
                  <input
                    type="text"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/static/images/certifications/... or https://..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Domains & Core Skills Covered */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Domains &amp; Core Skills Covered
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. Networking, Linux, Cloud Architecture"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(formData.skillsCovered || []).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-rose-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <CustomFieldEditor
            fields={formData.customFields || []}
            onChange={(fields) => setFormData({ ...formData, customFields: fields })}
          />

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Certification</span>
            </button>
          </div>
        </form>
      </div>

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        targetCategoryLabel="Certification"
        defaultCategoryFilter="certifications"
        onSelectPhoto={(url) => {
          setFormData((prev) => ({ ...prev, imageUrl: url }));
        }}
      />
    </div>
  );
};
