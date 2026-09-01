import React from 'react';
import { Github, Linkedin, Mail, FileText, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Statement */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-sky-600 text-white font-mono font-bold flex items-center justify-center text-sm">
                TO
              </span>
              <span className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">
                Timothy Ododo
              </span>
            </div>
            <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">
              Technology Mentor &amp; Advocate
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md leading-relaxed">
              Building technology. Supporting people. Sharing knowledge. Helping turn technical challenges into practical solutions.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-500">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Open to Opportunities
              </span>
              <span>•</span>
              <span>Learn2Earn Fellow 2026</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  About &amp; Story
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/experience')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Experience Timeline
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projects')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Project Portfolio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/events')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Events &amp; Summits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/certifications')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Certifications &amp; Awards
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/skills')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Technical Skills
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/resume')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Curriculum Vitae
                </button>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a href="mailto:timothyododo@gmail.com" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>timothyododo@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/in/timothyododo" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3 ml-auto text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://github.com/timothyododo" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3 ml-auto text-slate-400" />
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Contact Form</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Timothy Ododo. All rights reserved.</p>
          <p className="font-mono">
            Engineered with Go net/http &amp; Semantic Web Standards
          </p>
        </div>
      </div>
    </footer>
  );
};
