import React from 'react';
import { SkillsData, Certification, Education, CommunityRole } from '../types';
import { CheckCircle2, Award, GraduationCap, Users } from 'lucide-react';

interface SkillsViewProps {
  skills: SkillsData;
  certifications: Certification[];
  education: Education[];
  community: CommunityRole[];
  onNavigate: (path: string) => void;
  isStandalone?: boolean;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  certifications,
  education,
  community,
  onNavigate,
  isStandalone = false
}) => {
  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'Strong':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'Practical Experience':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Working Proficiency':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Developing':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
    }
  };

  return (
    <section className={`py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 ${isStandalone ? '' : 'bg-slate-50/50 dark:bg-slate-900/30'}`} id="skills">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
            Capability Matrix
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Technical Proficiencies &amp; Credentials
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Organised by capability with objective proficiency labels reflecting verified project and diagnostic experience.
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.categories.map((category) => (
            <div 
              key={category.id} 
              className="p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.skills.map((skill, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {skill.name}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getBadgeClass(skill.level)}`}>
                        {skill.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      {skill.highlight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Education & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          
          {/* Certifications */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
                Certifications
              </h3>
            </div>

            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                        {cert.name}
                      </h4>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-mono font-medium">
                        {cert.issuer} • {cert.year}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cert.description}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1">
                    {cert.skillsCovered.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
                Education
              </h3>
            </div>

            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                        ★ {edu.scholarshipDetail}
                      </div>
                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
                        {edu.degree}
                      </h4>
                      <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                        {edu.institution}, {edu.location}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {edu.period}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {edu.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2">
                        <span className="text-sky-500">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Community Leadership */}
              <div className="pt-4 space-y-3">
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Civic &amp; Community Leadership</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {community.map((comm, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 text-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-200">
                        {comm.organization}
                      </div>
                      <div className="text-sky-600 dark:text-sky-400 font-mono text-[11px]">
                        {comm.role}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                        {comm.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
