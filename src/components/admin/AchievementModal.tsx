import React, { useState, useEffect } from 'react';
import { X, Award, Check } from 'lucide-react';
import { Achievement, CustomField } from '../../types';
import { CustomFieldEditor } from './CustomFieldEditor';

interface AchievementModalProps {
  isOpen: boolean;
  achievementToEdit: Achievement | null;
  onClose: () => void;
  onSave: (item: Achievement) => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  achievementToEdit,
  onClose,
  onSave
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
    customFields: []
  });

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
        customFields: []
      });
    }
  }, [achievementToEdit]);

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
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
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
    </div>
  );
};
