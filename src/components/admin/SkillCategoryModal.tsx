import React, { useState, useEffect } from 'react';
import { X, Layers, Check } from 'lucide-react';
import { SkillCategory } from '../../types';

interface SkillCategoryModalProps {
  isOpen: boolean;
  categoryToEdit: SkillCategory | null;
  onClose: () => void;
  onSave: (category: SkillCategory, originalCategoryId?: string) => void;
}

export const SkillCategoryModal: React.FC<SkillCategoryModalProps> = ({
  isOpen,
  categoryToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<SkillCategory>>({
    id: '',
    name: '',
    description: '',
    skills: []
  });

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({ ...categoryToEdit });
    } else {
      setFormData({
        id: `cat-${Date.now()}`,
        name: '',
        description: '',
        skills: []
      });
    }
  }, [categoryToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const rawId = formData.id?.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalCategory: SkillCategory = {
      id: rawId,
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      skills: formData.skills || []
    };

    onSave(finalCategory, categoryToEdit ? categoryToEdit.id : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg my-8 rounded-2xl bg-white dark:bg-[#0c1633] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {categoryToEdit ? `Edit Category: ${categoryToEdit.name}` : 'Add Skill Category'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Group related technical capabilities, systems tools, or soft skills.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Systems, Cloud & Infrastructure"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Category ID (Slug) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Category Unique Key / Slug *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. systems-cloud, programming, devops"
              value={formData.id || ''}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
              className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-slate-500">
              Used internally to map skills to their respective group.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Category Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Enterprise operating systems, network infrastructure, hardware diagnostics, and security."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{categoryToEdit ? 'Save Category' : 'Create Category'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
