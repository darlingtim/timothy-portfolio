import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Cpu, 
  Globe, 
  Layers, 
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { EventContribution } from '../types';

interface EventsViewProps {
  events: EventContribution[];
  onNavigate: (path: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onNavigate
}) => {
  const [activeTrack, setActiveTrack] = useState<'All' | 'Technical' | 'Non-Technical'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter events based on track & search query
  const filteredEvents = events.filter((evt) => {
    const matchesTrack = 
      activeTrack === 'All' || 
      (evt.track ? evt.track === activeTrack : true);

    const matchesSearch = 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.technologies || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTrack && matchesSearch;
  });

  const technicalCount = events.filter(e => e.track === 'Technical').length;
  const nonTechnicalCount = events.filter(e => e.track === 'Non-Technical').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070e24] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Header Banner */}
      <div className="relative bg-[#0c1633] text-white py-14 sm:py-18 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Field Operations, Summits &amp; Youth Leadership</span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Events Attended &amp; Key Technical Contributions
          </h1>
          
          <p className="text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
            A comprehensive track record of high-impact state government innovation weeks, hardware engineering bootcamps, technical meetups, and grassroots civic leadership assemblies where Timothy played a lead role.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-4xl">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-sky-400">1,000+</span>
              <span className="text-xs text-slate-400 block font-mono">Summit Attendees Supported</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-emerald-400">200+</span>
              <span className="text-xs text-slate-400 block font-mono">Hardware Students Trained</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-purple-400">{technicalCount}</span>
              <span className="text-xs text-slate-400 block font-mono">Technical &amp; STEM Events</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-amber-400">{nonTechnicalCount}</span>
              <span className="text-xs text-slate-400 block font-mono">Civic &amp; Youth Summits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Technical vs Non-Technical Filter Tabs & Search */}
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
              <span>All Events ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTrack('Technical')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTrack === 'Technical'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Technical &amp; STEM ({technicalCount})</span>
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
              <span>Non-Technical &amp; Civic Leadership ({nonTechnicalCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by event, role, tech, or organization..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 shadow-xs"
            />
          </div>
        </div>

        {/* Events Cards Grid */}
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredEvents.map((evt) => {
              const isTechnical = evt.track === 'Technical' || !evt.track;
              return (
                <div
                  key={evt.id}
                  className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0c1633] overflow-hidden shadow-md hover:shadow-xl hover:border-sky-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Event Banner Image with Badges */}
                    {evt.imageUrl && (
                      <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-900">
                        <img
                          src={evt.imageUrl}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1633] via-transparent to-transparent opacity-85" />
                        
                        {/* Track & Category Badges */}
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold backdrop-blur-md border ${
                            isTechnical 
                              ? 'bg-sky-950/80 text-sky-300 border-sky-500/30' 
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                          }`}>
                            {evt.track || 'Technical'}
                          </span>
                          
                          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-black/75 text-white backdrop-blur-md border border-white/10">
                            {evt.category}
                          </span>

                          {evt.badge && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-600/90 text-white backdrop-blur-md">
                              {evt.badge}
                            </span>
                          )}
                        </div>

                        {/* Impact Metric Floating Overlay */}
                        {evt.impactMetric && (
                          <div className="absolute bottom-3 left-3.5 right-3.5 px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-sky-400/30 text-white flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-300">Verified Impact:</span>
                            <span className="font-bold text-sky-400 font-display">{evt.impactMetric}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-semibold text-sky-500 dark:text-sky-400 block mb-1">
                            {evt.organization}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{evt.date}</span>
                        </div>
                        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white leading-snug">
                          {evt.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{evt.role}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.location}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {evt.summary}
                      </p>

                      {/* Highlights */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                          Key Deliverables &amp; Outcomes:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {evt.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies / Domain Tags */}
                      {evt.technologies && evt.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {evt.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  {evt.eventUrl && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex justify-end">
                      <a
                        href={evt.eventUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-sky-500 hover:text-sky-400 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Official Event Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <p className="text-slate-500 text-sm">No events found matching your search and filter criteria.</p>
            </div>
          )}
        </div>

        {/* Bottom CTA to Certifications */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Looking for Formal Certifications &amp; Accreditations?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore Timothy&apos;s verified IT credentials, educator certifications, and university scholarship honors.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/certifications')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-sm transition-all"
          >
            <span>View Certifications &amp; Awards</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
