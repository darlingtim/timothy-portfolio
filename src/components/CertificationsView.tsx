import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Cpu, 
  Globe, 
  Layers, 
  GraduationCap, 
  ArrowRight,
  Star,
  Trophy,
  Users
} from 'lucide-react';
import { Certification, Achievement, Education } from '../types';

interface CertificationsViewProps {
  certifications: Certification[];
  achievements: Achievement[];
  education: Education[];
  onNavigate: (path: string) => void;
}

export const CertificationsView: React.FC<CertificationsViewProps> = ({
  certifications,
  achievements,
  education,
  onNavigate
}) => {
  const [activeTrack, setActiveTrack] = useState<'All' | 'Technical' | 'Non-Technical'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Certifications
  const filteredCerts = certifications.filter((cert) => {
    const matchesTrack = 
      activeTrack === 'All' || 
      (cert.track ? cert.track === activeTrack : true);

    const matchesSearch = 
      cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.skillsCovered.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTrack && matchesSearch;
  });

  // Filter Achievements / Awards
  const filteredAchievements = achievements.filter((ach) => {
    const matchesTrack = 
      activeTrack === 'All' || 
      (ach.track ? ach.track === activeTrack : true);

    const matchesSearch = 
      ach.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTrack && matchesSearch;
  });

  const technicalCertCount = certifications.filter(c => c.track === 'Technical').length;
  const nonTechCertCount = certifications.filter(c => c.track === 'Non-Technical').length;
  const technicalAchCount = achievements.filter(a => a.track === 'Technical').length;
  const nonTechAchCount = achievements.filter(a => a.track === 'Non-Technical').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070e24] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Header Banner */}
      <div className="relative bg-[#0c1633] text-white py-14 sm:py-18 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accreditations, Honors &amp; Verified Distinctions</span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Professional Certifications &amp; Awards
          </h1>
          
          <p className="text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
            Verified certifications in IT systems administration, embedded hardware pedagogy, cloud infrastructure, alongside prestigious academic scholarships, fellowship honors, and UN SDG leadership recognitions.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-4xl">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-emerald-400">{certifications.length}</span>
              <span className="text-xs text-slate-400 block font-mono">Professional Certifications</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-amber-400">100%</span>
              <span className="text-xs text-slate-400 block font-mono">Full B.Sc. Scholarship</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-sky-400">{technicalCertCount + technicalAchCount}</span>
              <span className="text-xs text-slate-400 block font-mono">Technical Credentials</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-purple-400">{nonTechCertCount + nonTechAchCount}</span>
              <span className="text-xs text-slate-400 block font-mono">Non-Tech / Civic Honors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          
          {/* Navigation Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTrack('All')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTrack === 'All'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Credentials &amp; Awards ({certifications.length + achievements.length})</span>
            </button>

            <button
              onClick={() => setActiveTrack('Technical')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTrack === 'Technical'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Technical &amp; IT ({technicalCertCount + technicalAchCount})</span>
            </button>

            <button
              onClick={() => setActiveTrack('Non-Technical')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTrack === 'Non-Technical'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Non-Technical &amp; Leadership ({nonTechCertCount + nonTechAchCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by certification, issuer, or skill..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* SECTION 1: ACADEMIC SCHOLARSHIP SPOTLIGHT */}
        <div className="py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6 text-amber-500" />
                <span>Academic Degrees &amp; Scholarships</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Distinguished educational foundation with full merit scholarship recognition.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-slate-900/50 to-slate-950 text-slate-900 dark:text-white space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 text-xs font-mono font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>{edu.isScholarship ? 'Full Merit Scholarship Recipient' : 'Academic Degree'}</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {edu.degree} &mdash; {edu.institution}
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                    {edu.period} &bull; {edu.location}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {edu.scholarshipDetail}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {edu.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-amber-500 font-bold">★</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: PROFESSIONAL CERTIFICATIONS */}
        <div className="py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <span>Professional IT, Cloud &amp; Pedagogy Certifications</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Accredited industry credentials verifying technical systems mastery and leadership competency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCerts.map((cert) => {
              const isTech = cert.track === 'Technical' || !cert.track;
              return (
                <div
                  key={cert.id}
                  className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        isTech 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {cert.track || 'Technical'} &bull; {cert.year}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{cert.issuer}</span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                      {cert.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {cert.description}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-mono text-slate-500 font-semibold block uppercase">
                        Domains &amp; Core Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cert.skillsCovered.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-sky-500 hover:text-sky-400 flex items-center gap-1"
                      >
                        <span>View Credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCerts.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <p className="text-xs text-slate-400">No certifications found in this category.</p>
            </div>
          )}
        </div>

        {/* SECTION 3: AWARDS, FELLOWSHIPS & RECOGNITIONS */}
        <div className="py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>Honors, Fellowships &amp; Community Recognitions</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Special recognitions across government innovation initiatives, technical fellowships, and youth leadership bodies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((ach) => {
              const isTech = ach.track === 'Technical' || !ach.track;
              return (
                <div
                  key={ach.id}
                  className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-3 flex flex-col justify-between shadow-sm hover:border-amber-500/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isTech 
                            ? 'bg-sky-500/10 text-sky-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {ach.track || 'Technical'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {ach.category}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{ach.year}</span>
                    </div>

                    <h4 className="font-display font-bold text-base text-slate-900 dark:text-white pt-1">
                      {ach.title}
                    </h4>

                    <span className="text-xs text-sky-500 font-semibold block">{ach.issuer}</span>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      Honor Conferred
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <p className="text-xs text-slate-400">No awards or honors found in this category.</p>
            </div>
          )}
        </div>

        {/* Bottom CTA to Events */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Explore Live Summits &amp; Field Operations
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              See Timothy&apos;s on-ground contributions at Anambra Innovation Week, Raspberry Pi Buildathons, and National Tech Fellowships.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/events')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-sm transition-all"
          >
            <span>View Events &amp; Summits</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
