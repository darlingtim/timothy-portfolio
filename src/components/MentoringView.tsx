import React from 'react';
import { Users, GraduationCap, Award, CheckCircle2, Quote, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { MentoringProgram, ImpactMetric } from '../types';

interface MentoringViewProps {
  programs: MentoringProgram[];
  onNavigate: (path: string) => void;
}

export const MentoringView: React.FC<MentoringViewProps> = ({ programs, onNavigate }) => {
  return (
    <div className="py-12 sm:py-16 space-y-16">
      
      {/* Top Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold border border-purple-200 dark:border-purple-800">
            <Heart className="w-3.5 h-3.5" />
            <span>Youth Empowerment &amp; Digital Education</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mentoring &amp; Technical Training
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            I believe technology education should be practical, inclusive, and empowering. Through boot camps, peer study circles, and community workshops, I guide learners from zero background to building real digital and hardware solutions.
          </p>
        </div>
      </section>

      {/* Impact Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-200 dark:border-blue-800/60 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              200+
            </div>
            <div className="font-semibold text-slate-900 dark:text-white text-base">
              Secondary School Learners
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Trained in hardware programming, MicroPython, and physical computing at Buildathon Holiday Camp.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-200 dark:border-purple-800/60 text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              50+
            </div>
            <div className="font-semibold text-slate-900 dark:text-white text-base">
              Engineering Peers Mentored
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Guided through backend architecture, idiomatic Go, REST APIs, and containerized deployments.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-200 dark:border-amber-800/60 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              15+
            </div>
            <div className="font-semibold text-slate-900 dark:text-white text-base">
              Workshops &amp; Seminars
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Organized with Solution Innovation District, 3MTT Nigeria, and community tech hubs.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Mentoring Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Featured Mentorship Programs
        </h2>

        <div className="space-y-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {prog.title}
                  </h3>
                  <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                    {prog.organization}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
                    {prog.period}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-bold border border-sky-200 dark:border-sky-800">
                    {prog.learnersCount}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                {prog.description}
              </p>

              {/* Highlights */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                  Key Outcomes &amp; Curriculum
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {prog.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 pt-2">
                {prog.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Testimonials */}
              {prog.testimonials && prog.testimonials.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {prog.testimonials.map((t, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 italic text-sm text-slate-600 dark:text-slate-300 relative">
                      <Quote className="w-5 h-5 text-sky-500/40 mb-1" />
                      <p>"{t.quote}"</p>
                      <div className="mt-2 text-xs font-semibold not-italic text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        <span>— {t.author}</span>
                        <span className="text-slate-500">{t.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-slate-900 text-white dark:bg-[#0c1633] border border-slate-800 space-y-4">
          <h3 className="font-display text-2xl sm:text-3xl font-bold">
            Looking for a Tech Mentor or Workshop Facilitator?
          </h3>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Whether for high school STEM boot camps, university dev clubs, or public sector digital literacy initiatives, I'm ready to collaborate.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all"
            >
              Get in Touch
            </button>
            <button
              onClick={() => onNavigate('/gallery')}
              className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              View Photo Gallery
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
