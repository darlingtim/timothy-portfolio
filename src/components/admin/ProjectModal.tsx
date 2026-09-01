import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Upload, FolderGit2, Check, ExternalLink } from 'lucide-react';
import { Project, CustomField } from '../../types';
import { CustomFieldEditor } from './CustomFieldEditor';

interface ProjectModalProps {
  isOpen: boolean;
  projectToEdit: Project | null;
  onClose: () => void;
  onSave: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  projectToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    tagline: '',
    shortDescription: '',
    category: 'Full Stack',
    categories: ['Full Stack'],
    isFeatured: true,
    year: new Date().getFullYear().toString(),
    technologies: ['TypeScript', 'React'],
    github: '',
    liveUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    overview: '',
    problem: '',
    solution: '',
    keyFeatures: ['Interactive UI', 'High performance'],
    architecture: 'Modern modular architecture',
    stack: { Frontend: 'React, TailwindCSS', Backend: 'Go / Node.js' },
    challenges: '',
    solutionApproach: '',
    learnings: '',
    futureImprovements: '',
    status: 'Published',
    customFields: []
  });

  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projectToEdit) {
      setFormData({ ...projectToEdit });
    } else {
      setFormData({
        name: '',
        tagline: '',
        shortDescription: '',
        category: 'Full Stack',
        categories: ['Full Stack'],
        isFeatured: true,
        year: new Date().getFullYear().toString(),
        technologies: ['Go', 'TypeScript', 'React'],
        github: '',
        liveUrl: '',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        overview: '',
        problem: '',
        solution: '',
        keyFeatures: ['Sub-second response time', 'Modular design'],
        architecture: 'Clean Hexagonal Go Architecture',
        stack: { Frontend: 'React', Backend: 'Go (Golang)' },
        challenges: '',
        solutionApproach: '',
        learnings: '',
        futureImprovements: '',
        status: 'Published',
        customFields: []
      });
    }
  }, [projectToEdit]);

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

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData({
      ...formData,
      keyFeatures: [...(formData.keyFeatures || []), featureInput.trim()]
    });
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      keyFeatures: (formData.keyFeatures || []).filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const slug =
      projectToEdit?.slug ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const finalProject: Project = {
      slug,
      name: formData.name.trim(),
      tagline: formData.tagline || '',
      shortDescription: formData.shortDescription || formData.overview || '',
      category: customCategoryInput.trim() || formData.category || 'Software',
      categories: formData.categories || [customCategoryInput.trim() || formData.category || 'Software'],
      isFeatured: formData.isFeatured ?? true,
      year: formData.year || new Date().getFullYear().toString(),
      technologies: formData.technologies || ['TypeScript'],
      github: formData.github || '',
      liveUrl: formData.liveUrl || '',
      imageUrl: formData.imageUrl || '',
      overview: formData.overview || formData.shortDescription || '',
      problem: formData.problem || '',
      solution: formData.solution || '',
      keyFeatures: formData.keyFeatures || [],
      architecture: formData.architecture || '',
      stack: formData.stack || {},
      challenges: formData.challenges || '',
      solutionApproach: formData.solutionApproach || '',
      learnings: formData.learnings || '',
      futureImprovements: formData.futureImprovements || '',
      status: (formData.status as any) || 'Published',
      dateAdded: formData.dateAdded || new Date().toISOString().split('T')[0],
      customFields: formData.customFields || []
    };

    onSave(finalProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0c1633] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {projectToEdit ? `Edit Project: ${projectToEdit.name}` : 'Create New Project'}
              </h3>
              <p className="text-xs text-slate-500">
                Full customization with zero field constraints. Add any custom metadata.
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

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Primary Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. A1Pal AI Study Companion"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Scalable multi-tenant assessment system"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Category (or type custom)
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-1/2 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Go">Go (Golang)</option>
                    <option value="AI & Web">AI &amp; Web</option>
                    <option value="CLI / DevOps">CLI / DevOps</option>
                    <option value="Education">Education &amp; Hardware</option>
                    <option value="Mobile">Mobile App</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Custom Category name..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="w-1/2 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Published">Published</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Archived">Archived</option>
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
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload / URL */}
            <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
                Project Cover Image
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-16 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover" />
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
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload local image file</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/timothyododo/repo"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Live Demo / Production URL
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  placeholder="https://myproject.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
                Technologies &amp; Frameworks
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                  placeholder="e.g. Go, Docker, Redis, MicroPython (Press Enter to add)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                >
                  Add Tech
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(formData.technologies || []).map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-rose-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Short Description & Problem & Solution */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Short Description / Overview *
              </label>
              <textarea
                rows={3}
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="High-level summary of what this project accomplishes..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  The Problem
                </label>
                <textarea
                  rows={3}
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  placeholder="What friction or challenge led to building this?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  The Solution &amp; Architecture
                </label>
                <textarea
                  rows={3}
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="How was this engineered to solve the problem?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
                Key Features List
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  placeholder="e.g. Sub-millisecond response time with Redis cache (Enter to add)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                >
                  Add Feature
                </button>
              </div>
              <div className="space-y-1.5 pt-1">
                {(formData.keyFeatures || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-slate-800 dark:text-slate-200">• {feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Dynamic Fields - No field limit! */}
            <CustomFieldEditor
              customFields={formData.customFields || []}
              onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              title="Project Dynamic Metadata (No limits)"
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
            form="project-form"
            className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{projectToEdit ? 'Save Project Changes' : 'Create Project'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
