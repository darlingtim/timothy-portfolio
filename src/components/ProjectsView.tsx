import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { ArrowUpRight, Search, Code, ExternalLink, ArrowRight } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (path: string) => void;
  isStandalone?: boolean;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  projects, 
  onSelectProject, 
  onNavigate,
  isStandalone = false 
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterCategories = [
    { label: 'All Projects', id: 'all' },
    { label: 'Go', id: 'go' },
    { label: 'Backend', id: 'backend' },
    { label: 'Python', id: 'python' },
    { label: 'Web Application', id: 'web' },
    { label: 'AI', id: 'ai' },
    { label: 'Education & Hardware', id: 'education' },
    { label: 'Tools & DevOps', id: 'tools' },
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const catLower = p.category.toLowerCase();
      const allCats = p.categories.map(c => c.toLowerCase()).join(' ');
      const nameLower = p.name.toLowerCase();
      const techLower = p.technologies.map(t => t.toLowerCase()).join(' ');
      const queryLower = searchQuery.toLowerCase().trim();

      const matchesFilter = activeFilter === 'all' || 
                            catLower.includes(activeFilter) || 
                            allCats.includes(activeFilter);

      const matchesSearch = !queryLower || 
                            nameLower.includes(queryLower) || 
                            catLower.includes(queryLower) || 
                            techLower.includes(queryLower);

      return matchesFilter && matchesSearch;
    });
  }, [projects, activeFilter, searchQuery]);

  const displayList = isStandalone ? filteredProjects : projects.filter(p => p.isFeatured);

  return (
    <section className={`py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 ${isStandalone ? '' : 'bg-slate-50/40 dark:bg-slate-900/30'}`} id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
              Engineering Portfolio
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isStandalone ? 'Projects & Case Studies' : 'Featured Projects & Systems'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Practical backend applications, diagnostic tools, and physical computing solutions solving concrete problems.
            </p>
          </div>

          {!isStandalone && (
            <button
              onClick={() => onNavigate('/projects')}
              className="self-start px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-sky-500 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 text-sm font-medium transition-colors"
            >
              Explore Full Portfolio ({projects.length}) →
            </button>
          )}
        </div>

        {/* Filter Controls (Shown on Standalone page) */}
        {isStandalone && (
          <div className="mb-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {filterCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                      activeFilter === cat.id
                        ? 'bg-sky-600 text-white font-semibold shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-sky-500'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

            </div>

            <div className="text-xs font-mono text-slate-500">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayList.map((project) => (
            <article 
              key={project.slug} 
              className="flex flex-col justify-between p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500/40 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
                    {project.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {project.year}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                  <button 
                    onClick={() => onSelectProject(project.slug)}
                    className="hover:text-sky-600 dark:hover:text-sky-400 text-left transition-colors"
                  >
                    {project.name}
                  </button>
                </h3>

                <p className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-3">
                  {project.tagline}
                </p>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {project.shortDescription}
                </p>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5 mb-5">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Problem:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400 line-clamp-2">{project.problem}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Solution:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400 line-clamp-2">{project.solution}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-1 mb-5">
                  {project.technologies.map((t, idx) => (
                    <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onSelectProject(project.slug)}
                    className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Read Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-3">
                    {project.github && (
                      <a 
                        href={project.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
                        title="View GitHub Repository"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-sky-600 hover:underline flex items-center gap-1"
                        title="Open Live Deployment"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {displayList.length === 0 && (
          <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <p className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">No matching projects found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search query or reset your category filter.</p>
            <button 
              onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
              className="px-4 py-2 text-xs font-mono font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
