import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import { GalleryItem, CustomField } from '../../types';
import { CustomFieldEditor } from './CustomFieldEditor';

interface GalleryModalProps {
  isOpen: boolean;
  itemToEdit: GalleryItem | null;
  onClose: () => void;
  onSave: (item: GalleryItem) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'Training',
    date: new Date().toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    description: '',
    location: 'Awka, Anambra State',
    tags: ['Training', 'Mentorship'],
    customFields: []
  });

  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({ ...itemToEdit });
    } else {
      setFormData({
        title: '',
        category: 'Training',
        date: new Date().toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
        description: '',
        location: 'Anambra State',
        tags: ['Training', 'Mentorship'],
        customFields: []
      });
    }
  }, [itemToEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const current = formData.tags || [];
    if (!current.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...current, tagInput.trim()] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((t) => t !== tag)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const finalItem: GalleryItem = {
      id: itemToEdit?.id || `gal-${Date.now()}`,
      title: formData.title.trim(),
      category: (formData.category as any) || 'Training',
      date: formData.date || new Date().toISOString().split('T')[0],
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      description: formData.description || '',
      location: formData.location || '',
      tags: formData.tags || [],
      customFields: formData.customFields || []
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1633] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {itemToEdit ? `Edit Photo: ${itemToEdit.title}` : 'Add Gallery Photo'}
              </h3>
              <p className="text-xs text-slate-500">
                Upload image file or provide URL with custom tags and details.
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
          <form id="gallery-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Image Preview & Upload */}
            <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
                Photo Asset
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-20 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
                  )}
                </div>
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload image file</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Title / Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Raspberry Pi Physical Computing Lab"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
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
                  <option value="Training">Training &amp; Bootcamps</option>
                  <option value="Community">Community &amp; Advocacy</option>
                  <option value="Workshop">Hands-on Workshops</option>
                  <option value="Certificate">Certificates &amp; Credentials</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                  placeholder="e.g. Awka, Anambra State / Online"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Description / Context
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain what was happening in this photo..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
                Tags &amp; Keywords
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag (Press Enter to add)..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg"
                >
                  Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(formData.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Custom metadata */}
            <CustomFieldEditor
              customFields={formData.customFields || []}
              onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              title="Gallery Item Custom Fields (No limits)"
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
            form="gallery-form"
            className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{itemToEdit ? 'Save Changes' : 'Add to Gallery'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
