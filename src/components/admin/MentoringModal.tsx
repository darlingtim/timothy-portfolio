import React, { useState, useEffect } from 'react';
import { X, Users, Upload, Trash2, Check, Plus, ExternalLink, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { MentoringProgram, CustomField } from '../../types';
import { uploadImageFile } from '../../utils/imageUpload';
import { CustomFieldEditor } from './CustomFieldEditor';
import { MediaLibraryModal } from './MediaLibraryModal';

interface MentoringModalProps {
  isOpen: boolean;
  programToEdit: MentoringProgram | null;
  onClose: () => void;
  onSave: (program: MentoringProgram) => void;
}

export const MentoringModal: React.FC<MentoringModalProps> = ({
  isOpen,
  programToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<MentoringProgram>>({
    title: '',
    organization: '',
    period: '',
    learnersCount: '',
    focus: '',
    description: '',
    highlights: [],
    technologies: [],
    imageUrl: '',
    testimonials: [],
    customFields: []
  });

  const [highlightInput, setHighlightInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  // New testimonial form state
  const [testimonialAuthor, setTestimonialAuthor] = useState('');
  const [testimonialRole, setTestimonialRole] = useState('');
  const [testimonialQuote, setTestimonialQuote] = useState('');

  useEffect(() => {
    if (programToEdit) {
      setFormData({
        ...programToEdit,
        highlights: programToEdit.highlights || [],
        technologies: programToEdit.technologies || [],
        testimonials: programToEdit.testimonials || [],
        customFields: programToEdit.customFields || []
      });
    } else {
      setFormData({
        title: '',
        organization: '',
        period: '2025 – Present',
        learnersCount: '100+ Learners',
        focus: '',
        description: '',
        highlights: [],
        technologies: [],
        imageUrl: '',
        testimonials: [],
        customFields: []
      });
    }
  }, [programToEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    uploadImageFile(file, { category: 'mentoring' })
      .then((result) => {
        if (result.url) {
          setFormData((prev) => ({ ...prev, imageUrl: result.url }));
        }
      })
      .catch((err) => {
        console.error('Failed to upload mentoring photo:', err);
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

  const handleRemoveHighlight = (idx: number) => {
    const list = [...(formData.highlights || [])];
    list.splice(idx, 1);
    setFormData({ ...formData, highlights: list });
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    const current = formData.technologies || [];
    if (!current.includes(techInput.trim())) {
      setFormData({ ...formData, technologies: [...current, techInput.trim()] });
    }
    setTechInput('');
  };

  const handleRemoveTech = (item: string) => {
    setFormData({
      ...formData,
      technologies: (formData.technologies || []).filter((t) => t !== item)
    });
  };

  const handleAddTestimonial = () => {
    if (!testimonialAuthor.trim() || !testimonialQuote.trim()) return;
    setFormData({
      ...formData,
      testimonials: [
        ...(formData.testimonials || []),
        {
          author: testimonialAuthor.trim(),
          role: testimonialRole.trim() || 'Learner / Mentee',
          quote: testimonialQuote.trim()
        }
      ]
    });
    setTestimonialAuthor('');
    setTestimonialRole('');
    setTestimonialQuote('');
  };

  const handleRemoveTestimonial = (idx: number) => {
    const list = [...(formData.testimonials || [])];
    list.splice(idx, 1);
    setFormData({ ...formData, testimonials: list });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.organization?.trim()) return;

    const finalProgram: MentoringProgram = {
      id: programToEdit?.id || `prog-${Date.now()}`,
      title: formData.title.trim(),
      organization: formData.organization.trim(),
      period: formData.period?.trim() || '',
      learnersCount: formData.learnersCount?.trim() || '',
      focus: formData.focus?.trim() || '',
      description: formData.description?.trim() || '',
      highlights: formData.highlights || [],
      technologies: formData.technologies || [],
      imageUrl: formData.imageUrl?.trim() || undefined,
      testimonials: formData.testimonials || [],
      customFields: formData.customFields || []
    };

    onSave(finalProgram);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              {programToEdit ? 'Edit Mentoring Program' : 'Add Mentoring Program'}
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
                Program Title *
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Buildathon Physical Computing Boot Camp"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organization / Partner *
              </label>
              <input
                type="text"
                required
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. Buildathon Holiday Camp (Supported by Raspberry Pi & MTN)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active Period
              </label>
              <input
                type="text"
                value={formData.period || ''}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="e.g. August – September 2024"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Learners / Impact Count
              </label>
              <input
                type="text"
                value={formData.learnersCount || ''}
                onChange={(e) => setFormData({ ...formData, learnersCount: e.target.value })}
                placeholder="e.g. 200+ Students or 50+ Fellows"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Core Focus &amp; Curriculum Domain
            </label>
            <input
              type="text"
              value={formData.focus || ''}
              onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
              placeholder="e.g. Raspberry Pi Pico, MicroPython, Scratch & Sensor Prototyping"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Program Summary &amp; Impact Story
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the cohort, pedagogical strategy, and tangible student outcomes..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Mentoring Photo Upload (Category: mentoring) */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mentoring Workshop Photo / Session Banner
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">
                Folder: static/images/mentoring
              </span>
            </div>

            {formData.imageUrl ? (
              <div className="flex items-center gap-4">
                <div className="relative w-36 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Mentoring Photo Preview"
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
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-xl cursor-pointer bg-white dark:bg-slate-900 transition-colors p-2 text-center group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-sky-500 mb-1 transition-colors" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isUploading ? 'Uploading to static/images/mentoring...' : 'Upload Session Photo'}
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
                    placeholder="/static/images/mentoring/... or https://..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Highlights & Key Outcomes */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Key Highlights &amp; Outcomes
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
                placeholder="e.g. Guided students to build working IoT sensor projects"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {(formData.highlights || []).map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="truncate">{h}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(i)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tools & Technologies */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Technologies &amp; Tools Taught
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                placeholder="e.g. Python, Docker, Raspberry Pi Pico"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Add Tech
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(formData.technologies || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-sky-500/10 text-sky-500 border border-sky-500/20"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(t)}
                    className="hover:text-rose-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Learner Testimonials */}
          <div className="space-y-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Learner / Mentee Testimonials
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={testimonialAuthor}
                onChange={(e) => setTestimonialAuthor(e.target.value)}
                placeholder="Learner name (e.g. Chidiebere N.)"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={testimonialRole}
                onChange={(e) => setTestimonialRole(e.target.value)}
                placeholder="Role (e.g. Secondary Student)"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <textarea
              rows={2}
              value={testimonialQuote}
              onChange={(e) => setTestimonialQuote(e.target.value)}
              placeholder="Quote: 'Mr. Timothy made programming microchips so fun...'"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
            />
            <button
              type="button"
              onClick={handleAddTestimonial}
              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
            >
              Add Testimonial
            </button>

            {formData.testimonials && formData.testimonials.length > 0 && (
              <div className="space-y-2 pt-2">
                {formData.testimonials.map((t, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="italic text-slate-600 dark:text-slate-300">"{t.quote}"</p>
                      <span className="font-semibold text-slate-900 dark:text-white block mt-1">
                        — {t.author} ({t.role})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTestimonial(i)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Mentoring Program</span>
            </button>
          </div>
        </form>
      </div>

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        targetCategoryLabel="Mentoring Program"
        defaultCategoryFilter="mentoring"
        onSelectPhoto={(url) => {
          setFormData((prev) => ({ ...prev, imageUrl: url }));
        }}
      />
    </div>
  );
};
