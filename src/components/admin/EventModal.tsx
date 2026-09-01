import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Calendar, MapPin, Users, Sparkles, Upload, Check } from 'lucide-react';
import { EventContribution, CustomField } from '../../types';
import { CustomFieldEditor } from './CustomFieldEditor';

interface EventModalProps {
  isOpen: boolean;
  eventToEdit: EventContribution | null;
  onClose: () => void;
  onSave: (event: EventContribution) => void;
}

const CATEGORIES: EventContribution['category'][] = [
  'Summit & Innovation',
  'STEM & Hardware Training',
  'Community & Advocacy',
  'Developer Conference',
  'Hackathon'
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  eventToEdit,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<EventContribution>({
    id: '',
    title: '',
    role: '',
    organization: '',
    date: '',
    location: '',
    track: 'Technical',
    category: 'Summit & Innovation',
    badge: '',
    summary: '',
    impactMetric: '',
    highlights: [''],
    technologies: [],
    imageUrl: '',
    eventUrl: '',
    certificateUrl: '',
    customFields: []
  });

  const [techInput, setTechInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        ...eventToEdit,
        highlights: eventToEdit.highlights?.length ? eventToEdit.highlights : [''],
        technologies: eventToEdit.technologies || [],
        customFields: eventToEdit.customFields || []
      });
    } else {
      setFormData({
        id: `event-${Date.now()}`,
        title: '',
        role: '',
        organization: '',
        date: '',
        location: '',
        category: 'Summit & Innovation',
        badge: '',
        summary: '',
        impactMetric: '',
        highlights: [''],
        technologies: [],
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        eventUrl: '',
        certificateUrl: '',
        customFields: []
      });
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, imageUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleHighlightChange = (index: number, val: string) => {
    const next = [...formData.highlights];
    next[index] = val;
    setFormData({ ...formData, highlights: next });
  };

  const handleAddHighlight = () => {
    setFormData({ ...formData, highlights: [...formData.highlights, ''] });
  };

  const handleRemoveHighlight = (index: number) => {
    const next = formData.highlights.filter((_, i) => i !== index);
    setFormData({ ...formData, highlights: next.length ? next : [''] });
  };

  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!techInput.trim()) return;
    if (!formData.technologies?.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), techInput.trim()]
      });
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
    if (!formData.title.trim() || !formData.role.trim()) {
      alert('Event title and role are required.');
      return;
    }
    onSave({
      ...formData,
      highlights: formData.highlights.filter((h) => h.trim().length > 0)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {eventToEdit ? 'Edit Event Contribution' : 'Add New Event / Summit Contribution'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showcase major conferences, workshops, bootcamps and state innovation summits.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Event Name / Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Anambra Innovation Week 2024"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Your Role / Title *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Lead Technology Trainer / Operations Coordinator"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Organizing Body / Partner
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. Solution Innovation District (SID)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Track Classification *
              </label>
              <select
                value={formData.track || 'Technical'}
                onChange={(e) => setFormData({ ...formData, track: e.target.value as any })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="Technical">Technical (Hardware, Systems, Coding, Tech Ops)</option>
                <option value="Non-Technical">Non-Technical (Civic Advocacy, Peace, Leadership, SDGs)</option>
                <option value="Hybrid">Hybrid (Cross-Domain)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Distinction Badge (Optional)
              </label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Government Innovation Flagship"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Date / Period
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g. November 2024 / August – September 2024"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
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
                placeholder="e.g. Awka, Anambra State, Nigeria"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Impact Metric & Cover Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Verified Impact Metric
              </label>
              <input
                type="text"
                value={formData.impactMetric || ''}
                onChange={(e) => setFormData({ ...formData, impactMetric: e.target.value })}
                placeholder="e.g. 1,000+ participants supported / 200+ students trained"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono font-semibold text-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Official Event Link
              </label>
              <input
                type="url"
                value={formData.eventUrl || ''}
                onChange={(e) => setFormData({ ...formData, eventUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Cover Photo */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
              Event Cover Photo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {formData.imageUrl && (
                <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                  <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 w-full space-y-2">
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFile}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Overview &amp; Purpose
            </label>
            <textarea
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Describe the scale and significance of this event..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Key Deliverables & Highlights */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Key Contributions &amp; Highlights
              </label>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="text-xs text-sky-500 hover:text-sky-400 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bullet Point</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.highlights.map((h, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                    placeholder={`Highlight #${index + 1}`}
                    className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  {formData.highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(index)}
                      className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Technologies & Domain Tags */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
              Technologies &amp; Domain Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
                placeholder="e.g. Raspberry Pi Pico, Python, Technical Support"
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(formData.technologies || []).map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-sky-500/10 text-sky-400 flex items-center gap-1.5"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(t)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Unlimited Custom Fields */}
          <CustomFieldEditor
            customFields={formData.customFields || []}
            onChange={(fields) => setFormData({ ...formData, customFields: fields })}
            title="Additional Event Metadata (No limits)"
          />

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Event Contribution</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
