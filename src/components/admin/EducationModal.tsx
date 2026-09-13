import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  Upload, 
  Trash2, 
  Check, 
  ExternalLink, 
  Image as ImageIcon, 
  FolderOpen, 
  Plus, 
  Sparkles, 
  Award, 
  Building, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import { Education, CustomField } from '../../types';
import { uploadImageFile } from '../../utils/imageUpload';
import { CustomFieldEditor } from './CustomFieldEditor';
import { MediaLibraryModal } from './MediaLibraryModal';

interface EducationModalProps {
  isOpen: boolean;
  educationToEdit: Education | null;
  onClose: () => void;
  onSave: (edu: Education) => void;
}

export const EducationModal: React.FC<EducationModalProps> = ({
  isOpen,
  educationToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<Education>>({
    id: '',
    degree: '',
    institution: '',
    location: '',
    period: '',
    isScholarship: false,
    scholarshipDetail: '',
    grade: '',
    fieldOfStudy: '',
    credentialUrl: '',
    imageUrl: '',
    photos: [],
    highlights: [],
    customFields: []
  });

  const [highlightInput, setHighlightInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'main' | 'gallery'>('main');

  useEffect(() => {
    if (educationToEdit) {
      setFormData({
        ...educationToEdit,
        id: educationToEdit.id || `edu-${Date.now()}`,
        highlights: educationToEdit.highlights || [],
        photos: educationToEdit.photos || [],
        customFields: educationToEdit.customFields || []
      });
    } else {
      setFormData({
        id: `edu-${Date.now()}`,
        degree: '',
        institution: '',
        location: '',
        period: '',
        isScholarship: false,
        scholarshipDetail: '',
        grade: '',
        fieldOfStudy: '',
        credentialUrl: '',
        imageUrl: '',
        photos: [],
        highlights: [],
        customFields: []
      });
    }
    setHighlightInput('');
    setPhotoInput('');
  }, [educationToEdit]);

  // Main Image Upload
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMain(true);
    uploadImageFile(file, { category: 'education' })
      .then((result) => {
        if (result.url) {
          setFormData((prev) => ({ ...prev, imageUrl: result.url }));
        }
      })
      .catch((err) => {
        console.error('Failed to upload education image:', err);
      })
      .finally(() => {
        setIsUploadingMain(false);
      });
  };

  // Gallery Image Upload
  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGallery(true);
    uploadImageFile(file, { category: 'education' })
      .then((result) => {
        if (result.url) {
          setFormData((prev) => ({
            ...prev,
            photos: [...(prev.photos || []), result.url]
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to upload education gallery photo:', err);
      })
      .finally(() => {
        setIsUploadingGallery(false);
      });
  };

  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    const current = formData.highlights || [];
    setFormData({
      ...formData,
      highlights: [...current, highlightInput.trim()]
    });
    setHighlightInput('');
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlights: (formData.highlights || []).filter((_, i) => i !== index)
    });
  };

  const handleAddPhotoUrl = () => {
    if (!photoInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), photoInput.trim()]
    }));
    setPhotoInput('');
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.degree?.trim() || !formData.institution?.trim()) {
      alert('Degree and Institution are required.');
      return;
    }

    const finalEdu: Education = {
      id: formData.id || `edu-${Date.now()}`,
      degree: formData.degree.trim(),
      institution: formData.institution.trim(),
      location: formData.location?.trim() || '',
      period: formData.period?.trim() || '',
      isScholarship: Boolean(formData.isScholarship),
      scholarshipDetail: formData.scholarshipDetail?.trim() || '',
      grade: formData.grade?.trim() || '',
      fieldOfStudy: formData.fieldOfStudy?.trim() || '',
      credentialUrl: formData.credentialUrl?.trim() || '',
      imageUrl: formData.imageUrl?.trim() || '',
      photos: formData.photos || [],
      highlights: formData.highlights || [],
      customFields: formData.customFields || []
    };

    onSave(finalEdu);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c1633] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {educationToEdit ? 'Edit Education & Academic Record' : 'Add Education Record'}
              </h3>
              <p className="text-xs text-slate-500">
                Degrees, diplomas, university qualifications, scholarships, and academic highlights.
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

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* Degree & Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                Degree / Qualification *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B.Sc. Computer Science"
                value={formData.degree || ''}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-500" />
                Institution / University *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IU International University of Applied Sciences"
                value={formData.institution || ''}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-xs font-medium"
              />
            </div>
          </div>

          {/* Location & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Germany (Online / Distance) or Nigeria"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Period / Years
              </label>
              <input
                type="text"
                placeholder="e.g. 2024 – Present or 2019 – 2023"
                value={formData.period || ''}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Field of Study & Grade/Honors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Specialization / Field of Study
              </label>
              <input
                type="text"
                placeholder="e.g. Software Systems & Cloud Computing"
                value={formData.fieldOfStudy || ''}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Grade / CGPA / Academic Standing
              </label>
              <input
                type="text"
                placeholder="e.g. First Class Honours / Distinction"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Scholarship & Honors Card */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Scholarship / Academic Honor
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isScholarship)}
                  onChange={(e) => setFormData({ ...formData, isScholarship: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {formData.isScholarship && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  Scholarship Details &amp; Award Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full Tuition Scholarship Awardee / Academic Merit Recognition"
                  value={formData.scholarshipDetail || ''}
                  onChange={(e) => setFormData({ ...formData, scholarshipDetail: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            )}
          </div>

          {/* Verification / Transcript URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              Verification / Portal Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://iu.org or official transcript link"
              value={formData.credentialUrl || ''}
              onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-xs font-mono"
            />
          </div>

          {/* Primary Campus / Diploma Photo */}
          <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                Primary Photo / University Crest / Certificate
              </label>
              <button
                type="button"
                onClick={() => {
                  setMediaTarget('main');
                  setIsMediaLibraryOpen(true);
                }}
                className="text-[11px] font-mono text-blue-500 hover:text-blue-400 flex items-center gap-1"
              >
                <FolderOpen className="w-3 h-3" />
                Browse Media Library
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {formData.imageUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 bg-slate-900 group">
                  <img
                    src={formData.imageUrl}
                    alt="Education preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-slate-100 dark:bg-slate-900/50">
                  <GraduationCap className="w-6 h-6 opacity-40" />
                  <span className="text-[9px] font-mono mt-1">No Image</span>
                </div>
              )}

              <div className="flex-1 space-y-2 w-full">
                <input
                  type="text"
                  placeholder="Paste direct image URL or upload below"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer text-xs font-medium transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingMain ? 'Uploading...' : 'Upload Image from Computer'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    disabled={isUploadingMain}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Multi-Photo Gallery Section */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                Additional Photos (Campus, Convocation, Seminars)
              </label>
              <button
                type="button"
                onClick={() => {
                  setMediaTarget('gallery');
                  setIsMediaLibraryOpen(true);
                }}
                className="text-[11px] font-mono text-blue-500 hover:text-blue-400 flex items-center gap-1"
              >
                <FolderOpen className="w-3 h-3" />
                Add from Media Library
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste photo URL"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhotoUrl();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
              <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer text-xs font-medium rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingGallery ? '...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageUpload}
                  disabled={isUploadingGallery}
                  className="hidden"
                />
              </label>
            </div>

            {formData.photos && formData.photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                {formData.photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden h-20 border border-slate-200 dark:border-slate-700 bg-slate-900">
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Highlights & Coursework */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Key Highlights &amp; Academic Coursework
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Focused on computing, systems analysis, and algorithm design"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {formData.highlights && formData.highlights.length > 0 && (
              <div className="space-y-2 pt-2">
                {formData.highlights.map((h, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">
                      &bull; {h}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(index)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Fields Editor */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <CustomFieldEditor
              fields={formData.customFields || []}
              onChange={(fields: CustomField[]) => setFormData({ ...formData, customFields: fields })}
            />
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{educationToEdit ? 'Save Changes' : 'Create Record'}</span>
          </button>
        </div>

      </div>

      {/* Media Library Modal Picker */}
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        targetCategoryLabel="Education"
        defaultCategoryFilter="all"
        onSelectPhoto={(url) => {
          if (mediaTarget === 'main') {
            setFormData((prev) => ({ ...prev, imageUrl: url }));
          } else {
            setFormData((prev) => ({ ...prev, photos: [...(prev.photos || []), url] }));
          }
          setIsMediaLibraryOpen(false);
        }}
      />
    </div>
  );
};
