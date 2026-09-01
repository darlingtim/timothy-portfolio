import React from 'react';
import { Capability } from '../types';
import { GraduationCap, Megaphone, LifeBuoy, Server, Cloud, Cpu } from 'lucide-react';

interface CapabilitiesProps {
  capabilities: Capability[];
}

export const Capabilities: React.FC<CapabilitiesProps> = ({ capabilities }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'mentorship': return <GraduationCap className="w-6 h-6" />;
      case 'advocacy': return <Megaphone className="w-6 h-6" />;
      case 'it-support': return <LifeBuoy className="w-6 h-6" />;
      case 'backend': return <Server className="w-6 h-6" />;
      case 'cloud-devops': return <Cloud className="w-6 h-6" />;
      case 'ai-development': return <Cpu className="w-6 h-6" />;
      default: return <Server className="w-6 h-6" />;
    }
  };

  return (
    <section className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30" id="capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
            Core Competencies
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            What I Bring to Organisations &amp; Teams
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            A balanced combination of hands-on systems programming, structured diagnostic troubleshooting, and clear technical instruction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => (
            <div 
              key={cap.id} 
              className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500/40 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-5">
                {getIcon(cap.id)}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mb-2.5">
                {cap.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {cap.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
