import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Briefcase, Check, Upload, Image as ImageIcon, ExternalLink, Sparkles, FolderOpen } from 'lucide-react';
import { Experience, CustomField } from '../../types';
import { CustomFieldEditor } from './CustomFieldEditor';
import { uploadImageFile } from '../../utils/imageUpload';
import { MediaLibraryModal } from './MediaLibraryModal';

interface ExperienceModalProps {
  isOpen: boolean;
  experienceToEdit: Experience | null;
  onClose: () => void;
  onSave: (experience: Experience) => void;
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  experienceToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<Experience>>({
    role: '',
    organization: '',
    period: '2026 – Present',
    location: 'Nigeria / Remote',
    type: 'Software Engineering & Mentorship',
    isFeatured: true,
    summary: '',
    highlights: [''],
    technologies: ['Go', 'TypeScript'],
    imageUrl: '',
    companyUrl: '',
    customFields: []
  });

  const [highlightInput, setHighlightInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  useEffect(() => {
    if (experienceToEdit) {
      setFormData({ ...experienceToEdit });
    } else {
      setFormData({
        role: '',
        organization: '',
        period: '2026 – Present',
        location: 'Nigeria / Remote',
        type: 'Software Engineering & Leadership',
        isFeatured: true,
        summary: '',
        highlights: [
          'Engineered core services and guided peer developers.',
          'Maintained high system reliability and clean documentation.'
        ],
        technologies: ['Go', 'Docker', 'Linux', 'REST APIs'],
        imageUrl: '',
        companyUrl: '',
        customFields: []
      });
    }
  }, [experienceToEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    uploadImageFile(file, { category: 'experience' })
      .then((result) => {
        if (result.url) {
          setFormData((prev) => ({ ...prev, imageUrl: result.url }));
        }
      })
      .catch((err) => {
        console.error('Upload error:', err);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData({
      ...formData,
      highlights: [...(formData.highlights || []), highlightInput.trim()]
    });
    setHighlightInput('');
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlights: (formData.highlights || []).filter((_, i) => i !== index)
    });
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    const current = formData.technologies || [];
    if (!current.includes(techInput.trim())) {
      setFormData({ ...formData, technologies: [...current, techInput.trim()] });
    }
    setTechInput('');
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      technologies: (formData.technologies || []).filter((t) => t !== tech)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role?.trim() || !formData.organization?.trim()) return;

    const finalExp: Experience = {
      id: experienceToEdit?.id || `exp-${Date.now()}`,
      role: formData.role.trim(),
      organization: formData.organization.trim(),
      period: formData.period || 'Present',
      location: formData.location || 'Remote',
      type: formData.type || 'Engineering',
      isFeatured: formData.isFeatured ?? true,
      summary: formData.summary || '',
      highlights: formData.highlights?.filter((h) => h.trim().length > 0) || [],
      technologies: formData.technologies || [],
      companyUrl: formData.companyUrl || '',
      imageUrl: formData.imageUrl?.trim() || undefined,
      customFields: formData.customFields || []
    };

    onSave(finalExp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0c1633] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {experienceToEdit ? `Edit Experience: ${experienceToEdit.role}` : 'Add Experience / Role'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure role details, key impact achievements, and custom metadata.
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="experience-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Role / Position Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Lead Technology Mentor / Backend Engineer"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Organization / Company *
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Learn2Earn NG / SID Anambra"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Period / Timeline
                </label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="e.g. 2024 – Present or Aug – Sep 2024"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Nigeria / Remote or Awka, Anambra"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Category / Engagement Type
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g. Fellowship, Technical Training, IT Consulting"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Organization Website / URL
                </label>
                <input
                  type="url"
                  value={formData.companyUrl}
                  onChange={(e) => setFormData({ ...formData, companyUrl: e.target.value })}
                  placeholder="https://organization.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Experience Photo / Workplace / Team Badge (Category: experience) */}
            <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-500" />
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Experience / Workplace / Team Photo
                  </label>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-semibold">
                  Folder: static/images/experience
                </span>
              </div>

              {formData.imageUrl ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-36 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Experience preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={formData.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded bg-white/20 text-white hover:bg-white/40"
                        title="View photo"
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
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Upload from Computer */}
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 rounded-xl cursor-pointer bg-white dark:bg-slate-900 transition-colors p-2 text-center group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 mb-1 transition-colors" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isUploading ? 'Uploading to static/images/experience...' : 'Upload New Photo'}
                      </span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>

                    {/* Choose from Library (Cross-category) */}
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
                      placeholder="/static/images/experience/... or https://..."
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Executive Summary
              </label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="High level overview of your responsibilities and core achievements..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Key Highlights */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
                Key Accomplishments &amp; Bullet Points
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                  placeholder="Add bullet point achievement (Press Enter to add)..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                >
                  Add Bullet
                </button>
              </div>
              <div className="space-y-1.5 pt-1">
                {(formData.highlights || []).map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-slate-800 dark:text-slate-200">• {h}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
                Tools &amp; Technologies Used
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                  placeholder="e.g. Go, Docker, MicroPython (Enter to add)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                >
                  Add Tool
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(formData.technologies || []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(t)}
                      className="hover:text-rose-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Unlimited Custom Fields */}
            <CustomFieldEditor
              customFields={formData.customFields || []}
              onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              title="Experience Dynamic Metadata (No limits)"
            />

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="experience-form"
            className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{experienceToEdit ? 'Save Experience Changes' : 'Create Experience'}</span>
          </button>
        </div>

      </div>

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        targetCategoryLabel="Experience"
        defaultCategoryFilter="experience"
        onSelectPhoto={(url) => {
          setFormData((prev) => ({ ...prev, imageUrl: url }));
        }}
      />
    </div>
  );
};
