import React, { useState, useEffect } from 'react';
import { X, Code, Check, Tag, Award, Sparkles, BarChart2 } from 'lucide-react';
import { Skill, SkillCategory, CustomField } from '../../types';
import { CustomFieldEditor } from './CustomFieldEditor';

interface SkillModalProps {
  isOpen: boolean;
  skillToEdit: { skill: Skill; categoryId: string } | null;
  categories: SkillCategory[];
  defaultCategoryId?: string;
  onClose: () => void;
  onSave: (skill: Skill, targetCategoryId: string, originalSkillName?: string) => void;
}

export const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  skillToEdit,
  categories,
  defaultCategoryId,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [categoryId, setCategoryId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Skill>>({
    name: '',
    level: 'Strong',
    highlight: '',
    tag: '',
    proficiency: 85,
    customFields: []
  });

  useEffect(() => {
    if (skillToEdit) {
      setCategoryId(skillToEdit.categoryId);
      setFormData({
        name: skillToEdit.skill.name,
        level: skillToEdit.skill.level,
        highlight: skillToEdit.skill.highlight || '',
        tag: skillToEdit.skill.tag || '',
        proficiency: skillToEdit.skill.proficiency ?? 85,
        customFields: skillToEdit.skill.customFields || []
      });
    } else {
      setCategoryId(defaultCategoryId || (categories[0]?.id ?? ''));
      setFormData({
        name: '',
        level: 'Strong',
        highlight: '',
        tag: '',
        proficiency: 85,
        customFields: []
      });
    }
  }, [skillToEdit, defaultCategoryId, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !categoryId) return;

    const finalSkill: Skill = {
      name: formData.name.trim(),
      level: formData.level || 'Strong',
      highlight: formData.highlight?.trim() || '',
      tag: formData.tag?.trim() || 'General',
      proficiency: Number(formData.proficiency) || 80,
      customFields: formData.customFields || []
    };

    onSave(
      finalSkill, 
      categoryId, 
      skillToEdit ? skillToEdit.skill.name : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl my-8 rounded-2xl bg-white dark:bg-[#0c1633] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {skillToEdit ? `Edit Skill: ${skillToEdit.skill.name}` : 'Add New Skill'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure proficiency ratings, highlighted competencies, and domain tags.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Skill Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Skill / Technology Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Go (Golang), Docker, Linux Administration, Python"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Proficiency Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Proficiency Rating *
              </label>
              <select
                value={formData.level || 'Strong'}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Strong">Strong (Core Strength)</option>
                <option value="Practical Experience">Practical Experience (Hands-on)</option>
                <option value="Working Proficiency">Working Proficiency</option>
                <option value="Expert">Expert</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Developing">Developing / Foundational</option>
              </select>
            </div>

            {/* Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Domain / Short Tag *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Backend, Hardware, Cloud, OS"
                value={formData.tag || ''}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Proficiency Percentage Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                Proficiency Percentage:
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                {formData.proficiency ?? 85}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={formData.proficiency ?? 85}
              onChange={(e) => setFormData({ ...formData, proficiency: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Highlight / Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Highlight / Key Focus Areas *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Concurrency, net/http, REST APIs, CLI tools, log/slog, high throughput"
              value={formData.highlight || ''}
              onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              Briefly describe key technologies, libraries, or diagnostic techniques associated with this skill.
            </p>
          </div>

          {/* Custom Fields */}
          <CustomFieldEditor
            customFields={formData.customFields || []}
            onChange={(fields) => setFormData({ ...formData, customFields: fields })}
            title="Skill Custom Metadata (Optional)"
          />

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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{skillToEdit ? 'Save Changes' : 'Create Skill'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
