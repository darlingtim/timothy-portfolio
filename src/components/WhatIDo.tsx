import React from 'react';
import { Code, Shield, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Capability } from '../types';

interface WhatIDoProps {
  capabilities: Capability[];
  onNavigate: (path: string) => void;
}

export const WhatIDo: React.FC<WhatIDoProps> = ({ capabilities, onNavigate }) => {
  const getCardStyle = (index: number) => {
    switch (index % 4) {
      case 0:
        return {
          icon: <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          iconBg: 'bg-blue-100 dark:bg-blue-950/80',
          ctaText: 'View Projects',
          ctaPath: '/projects'
        };
      case 1:
        return {
          icon: <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/80',
          ctaText: 'Learn More',
          ctaPath: '/experience'
        };
      case 2:
        return {
          icon: <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
          iconBg: 'bg-purple-100 dark:bg-purple-950/80',
          ctaText: 'See Impact',
          ctaPath: '/mentoring'
        };
      case 3:
      default:
        return {
          icon: <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-100 dark:bg-amber-950/80',
          ctaText: 'Explore Initiatives',
          ctaPath: '/about'
        };
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 dark:bg-[#070e24]/60 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What I Do
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            I work at the intersection of technology, education, and impact.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.slice(0, 4).map((cap, i) => {
            const style = getCardStyle(i);
            const ctaLabel = cap.ctaText || style.ctaText;
            const ctaTarget = cap.ctaLink || style.ctaPath;

            return (
              <div
                key={cap.id || i}
                className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800/80 hover:border-sky-500/40 dark:hover:border-sky-500/40 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  {/* Icon badge */}
                  <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center`}>
                    {style.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {cap.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                {/* Card CTA Link */}
                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={() => onNavigate(ctaTarget)}
                    className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
