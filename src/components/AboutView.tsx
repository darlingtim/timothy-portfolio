import React from 'react';
import { Profile } from '../types';
import { CheckCircle2, ArrowRight, Zap, Target, BookOpen, HeartHandshake } from 'lucide-react';

interface AboutViewProps {
  profile: Profile;
  onNavigate: (path: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ profile, onNavigate }) => {
  const progressionSteps = [
    { title: 'Technology Learner', desc: 'Rapidly assimilating new architectures, hardware interfaces, and backend paradigms.' },
    { title: 'Technology Educator', desc: 'Demystifying complex logic for 200+ students across hardware and software computing.' },
    { title: 'Technology Advocate', desc: 'Mobilising grass-roots digital adoption with SID (Anambra State Govt ICT arm).' },
    { title: 'Community Leader', desc: 'Coordinating 3MTT Cohort 2 and fostering cross-peer accountability.' },
    { title: 'IT Support Specialist', desc: 'Google-certified hardware, networking, and systems administration troubleshooter.' },
    { title: 'Software Engineer & DevOps', desc: 'Engineering resilient Go backends, distributed systems, and automated CI/CD pipelines.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16 animate-fade-in">
      
      {/* Hero Intro */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
          Biography &amp; Philosophy
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          About Timothy Ododo
        </h1>
        <p className="text-lg sm:text-xl text-sky-600 dark:text-sky-400 font-mono font-medium">
          Technology Mentor &amp; Advocate • Software Engineering Practitioner
        </p>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6 text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
          <p>
            I am a multidisciplinary technology professional with a passion for operating at the intersection of technical systems and human potential. My work spans backend engineering in Go and Python, enterprise IT support, cloud and DevOps operations, physical computing, and large-scale technical training.
          </p>

          <p>
            What sets my approach apart is the ability to <strong>learn technology rapidly, solve difficult diagnostic problems, build reliable software, and effectively teach those concepts to others</strong>. Whether developing robust APIs or mentoring secondary school students through their first hardware programming challenges, I focus on practical solutions with measurable impact.
          </p>

          <div className="p-6 rounded-2xl border border-sky-500/20 bg-sky-500/5 space-y-3">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">
              The Rapid Learning Differentiator
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Prior to being deployed as lead hardware instructor at the <em>Buildathon Holiday Camp</em>, I mastered Raspberry Pi Pico and MicroPython physical computing within just three days. This agility enables me to adapt seamlessly to unfamiliar tech stacks, legacy codebases, and emerging engineering tools.
            </p>
          </div>

          <p>
            Currently, as a <strong>Learn2Earn NG Fellow &amp; Ambassador</strong> and a full-scholarship <strong>B.Sc. Computer Science student at IU International University of Applied Sciences (Germany)</strong>, I focus on high-performance backend systems in Go, structured logging, containerization, and ethical AI-assisted workflows.
          </p>
        </div>

        {/* Sidebar Proof Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Quick Facts
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span><strong>Role:</strong> Technology Mentor &amp; Advocate</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span><strong>Education:</strong> B.Sc. Computer Science, IU Germany (Full Scholarship)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span><strong>Core Stack:</strong> Go (Golang), Python, Linux, Docker, REST APIs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span><strong>Certifications:</strong> Google IT Support Professional</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Let's Connect
            </h3>
            <p className="text-xs text-slate-500">
              Interested in collaborating, hiring for an internship or engineering role, or scheduling a technical talk?
            </p>
            <button
              onClick={() => onNavigate('/contact')}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>

      {/* Professional Journey Progression */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
            Career Evolution
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Multidisciplinary Growth Matrix
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressionSteps.map((step, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                0{idx + 1}.
              </span>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
