import React from 'react';
import { Project } from '../types';
import { ArrowLeft, ExternalLink, Code, CheckCircle2, ShieldAlert, Sparkles, Layers } from 'lucide-react';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onNavigateContact: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ 
  project, 
  onBack,
  onNavigateContact 
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12 animate-fade-in">
      
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all projects</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
            {project.category}
          </span>
          <span className="text-xs font-mono text-slate-500">
            Year: {project.year}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          {project.name}
        </h1>

        <p className="text-lg sm:text-xl text-sky-600 dark:text-sky-400 font-mono">
          {project.tagline}
        </p>

        {/* Action Links */}
        <div className="pt-2 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Open Live Demo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300 text-sm font-semibold inline-flex items-center gap-2 transition-all"
            >
              <Code className="w-4 h-4" />
              <span>View Source on GitHub</span>
            </a>
          )}
        </div>
      </div>

      {/* Project Overview */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Project Overview
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
          {project.overview}
        </p>
      </section>

      {/* Problem & Solution Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
            The Problem
          </span>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
            What Problem Does This Solve?
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.problem}
          </p>
        </div>

        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
            The Solution
          </span>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
            What Did Timothy Build?
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.solution}
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Key Features &amp; Capabilities
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.keyFeatures.map((feat, idx) => (
            <li key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Architecture */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          System Architecture &amp; Design
        </h2>
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            {project.architecture}
          </p>
        </div>
      </section>

      {/* Tech Stack Breakdown */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(project.stack).map(([layer, tech]) => (
            <div key={layer} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs font-mono uppercase text-sky-600 dark:text-sky-400 font-semibold block mb-1">
                {layer}
              </span>
              <span className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">
                {tech}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Challenges & How I Solved Them */}
      <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
            Engineering Rigor
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Technical Challenges &amp; How I Solved Them
          </h2>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>The Technical Hurdle</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {project.challenges}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>My Engineering Solution</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {project.solutionApproach}
            </p>
          </div>
        </div>
      </section>

      {/* Learnings & Future Improvements */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">What I Learned</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.learnings}
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">Future Improvements</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.futureImprovements}
          </p>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold"
        >
          ← Back to Portfolio
        </button>

        <button
          onClick={onNavigateContact}
          className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm"
        >
          Discuss this Project with Timothy
        </button>
      </div>

    </div>
  );
};
