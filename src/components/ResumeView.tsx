import React from 'react';
import { Profile, Experience, SkillsData, Certification, Education } from '../types';
import { Printer, Download, Mail, Github, Linkedin, MapPin, Globe, CheckCircle2 } from 'lucide-react';

interface ResumeViewProps {
  profile: Profile;
  experiences: Experience[];
  skills: SkillsData;
  certifications: Certification[];
  education: Education[];
  onNavigateContact: () => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({
  profile,
  experiences,
  skills,
  certifications,
  education,
  onNavigateContact,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-8 animate-fade-in">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm no-print">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
            Curriculum Vitae
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Optimized for recruitment, Learn2Earn matching, and international opportunities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={onNavigateContact}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Contact
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="resume-sheet p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-8 text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {profile.name}
              </h2>
              <p className="text-lg font-semibold text-sky-600 dark:text-sky-400 font-display mt-0.5">
                {profile.title}
              </p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                {profile.subtitle}
              </p>
            </div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1 sm:text-right">
              <div>{profile.email}</div>
              <div>{profile.location}</div>
              <div className="text-sky-600 dark:text-sky-400">linkedin.com/in/timothyododo</div>
            </div>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold">
            Professional Profile
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {profile.bio}
          </p>
        </section>

        {/* Core Competencies */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold">
            Core Competencies
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {skills.categories.map((c) => (
              <div key={c.id} className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="font-bold block text-slate-900 dark:text-slate-200">{c.name}</span>
                <span className="text-slate-500">{c.skills.map(s => s.name).slice(0, 4).join(', ')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold">
            Experience &amp; Leadership
          </h3>
          <div className="space-y-6">
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="font-bold text-base text-slate-900 dark:text-slate-100">{exp.role}</span>
                    <span className="text-slate-500 dark:text-slate-400"> — {exp.organization}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{exp.period}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {exp.summary}
                </p>
                <ul className="space-y-1 pl-4 list-disc text-xs text-slate-700 dark:text-slate-300">
                  {exp.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education & Certifications */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold">
              Education
            </h3>
            {education.map((edu, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100">{edu.degree}</div>
                <div className="text-sky-600 dark:text-sky-400 font-semibold">{edu.institution}, {edu.location}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">★ {edu.scholarshipDetail} ({edu.period})</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold">
              Key Certifications
            </h3>
            <ul className="space-y-2 text-xs">
              {certifications.map((c) => (
                <li key={c.id}>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{c.name}</span>
                  <span className="text-slate-500 font-mono"> — {c.issuer} ({c.year})</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
};
