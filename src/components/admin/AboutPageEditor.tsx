import React, { useState } from 'react';
import { Profile, AboutPageContent, QuickFact, ProgressionStep } from '../../types';
import { 
  BookOpen, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye, 
  Sparkles, 
  Layers, 
  FileText, 
  Compass, 
  CheckCircle2, 
  Briefcase 
} from 'lucide-react';

interface AboutPageEditorProps {
  profile: Profile;
  aboutContent: AboutPageContent;
  onSave: (updatedAboutContent: AboutPageContent) => void;
  onPreviewAbout: () => void;
}

export const AboutPageEditor: React.FC<AboutPageEditorProps> = ({
  profile,
  aboutContent,
  onSave,
  onPreviewAbout
}) => {
  const [formData, setFormData] = useState<AboutPageContent>(() => ({
    eyebrow: aboutContent.eyebrow || 'Biography & Philosophy',
    heading: aboutContent.heading || `About ${profile.name}`,
    subheading: aboutContent.subheading || profile.title || 'Technology Mentor & Advocate • Software Engineering Practitioner',
    storyParagraph1: aboutContent.storyParagraph1 || (
      profile.bio ? profile.bio : "I am a multidisciplinary technology professional with a passion for operating at the intersection of technical systems and human potential. My work spans backend engineering in Go and Python, enterprise IT support, cloud and DevOps operations, physical computing, and large-scale technical training."
    ),
    storyParagraph2: aboutContent.storyParagraph2 || (
      profile.tagline ? profile.tagline : "What sets my approach apart is the ability to learn technology rapidly, solve difficult diagnostic problems, build reliable software, and effectively teach those concepts to others. Whether developing robust APIs or mentoring secondary school students through their first hardware programming challenges, I focus on practical solutions with measurable impact."
    ),
    calloutTitle: aboutContent.calloutTitle || 'The Rapid Learning Differentiator',
    calloutText: aboutContent.calloutText || "Prior to being deployed as lead hardware instructor at the Buildathon Holiday Camp, I mastered Raspberry Pi Pico and MicroPython physical computing within just three days. This agility enables me to adapt seamlessly to unfamiliar tech stacks, legacy codebases, and emerging engineering tools.",
    storyParagraph3: aboutContent.storyParagraph3 || "Currently, as a Learn2Earn NG Fellow & Ambassador and a full-scholarship B.Sc. Computer Science student at IU International University of Applied Sciences (Germany), I focus on high-performance backend systems in Go, structured logging, containerization, and ethical AI-assisted workflows.",
    quickFactsTitle: aboutContent.quickFactsTitle || 'Quick Facts',
    quickFacts: aboutContent.quickFacts && aboutContent.quickFacts.length > 0 ? aboutContent.quickFacts : [
      { label: 'Role', value: 'Technology Mentor & Advocate' },
      { label: 'Education', value: 'B.Sc. Computer Science, IU Germany (Full Scholarship)' },
      { label: 'Core Stack', value: 'Go (Golang), Python, Linux, Docker, REST APIs' },
      { label: 'Certifications', value: 'Google IT Support Professional' }
    ],
    connectCardTitle: aboutContent.connectCardTitle || "Let's Connect",
    connectCardText: aboutContent.connectCardText || "Interested in collaborating, hiring for an internship or engineering role, or scheduling a technical talk?",
    connectCardButtonText: aboutContent.connectCardButtonText || "Get in Touch",
    progressionEyebrow: aboutContent.progressionEyebrow || 'Career Evolution',
    progressionTitle: aboutContent.progressionTitle || 'Multidisciplinary Growth Matrix',
    progressionSteps: aboutContent.progressionSteps && aboutContent.progressionSteps.length > 0 ? aboutContent.progressionSteps : [
      { title: 'Technology Learner', desc: 'Rapidly assimilating new architectures, hardware interfaces, and backend paradigms.' },
      { title: 'Technology Educator', desc: 'Demystifying complex logic for 200+ students across hardware and software computing.' },
      { title: 'Technology Advocate', desc: 'Mobilising grass-roots digital adoption with SID (Anambra State Govt ICT arm).' },
      { title: 'Community Leader', desc: 'Coordinating 3MTT Cohort 2 and fostering cross-peer accountability.' },
      { title: 'IT Support Specialist', desc: 'Google-certified hardware, networking, and systems administration troubleshooter.' },
      { title: 'Software Engineer & DevOps', desc: 'Engineering resilient Go backends, distributed systems, and automated CI/CD pipelines.' }
    ]
  }));

  const [activeTab, setActiveTab] = useState<'all' | 'bio' | 'callout' | 'facts' | 'progression'>('all');

  // Quick Facts handlers
  const handleQuickFactChange = (index: number, field: keyof QuickFact, val: string) => {
    const updated = [...(formData.quickFacts || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: val };
      setFormData({ ...formData, quickFacts: updated });
    }
  };

  const handleAddQuickFact = () => {
    const updated = [...(formData.quickFacts || []), { label: 'New Metric', value: 'Value' }];
    setFormData({ ...formData, quickFacts: updated });
  };

  const handleRemoveQuickFact = (index: number) => {
    const updated = (formData.quickFacts || []).filter((_, i) => i !== index);
    setFormData({ ...formData, quickFacts: updated });
  };

  // Progression steps handlers
  const handleProgressionChange = (index: number, field: keyof ProgressionStep, val: string) => {
    const updated = [...(formData.progressionSteps || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: val };
      setFormData({ ...formData, progressionSteps: updated });
    }
  };

  const handleAddProgressionStep = () => {
    const updated = [
      ...(formData.progressionSteps || []), 
      { title: 'New Career Milestone', desc: 'Describe your responsibilities, growth, and achievements in this phase.' }
    ];
    setFormData({ ...formData, progressionSteps: updated });
  };

  const handleRemoveProgressionStep = (index: number) => {
    const updated = (formData.progressionSteps || []).filter((_, i) => i !== index);
    setFormData({ ...formData, progressionSteps: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset About page text content to standard default values?')) {
      const defaultContent: AboutPageContent = {
        eyebrow: 'Biography & Philosophy',
        heading: `About ${profile.name}`,
        subheading: 'Technology Mentor & Advocate • Software Engineering Practitioner',
        storyParagraph1: "I am a multidisciplinary technology professional with a passion for operating at the intersection of technical systems and human potential. My work spans backend engineering in Go and Python, enterprise IT support, cloud and DevOps operations, physical computing, and large-scale technical training.",
        storyParagraph2: "What sets my approach apart is the ability to learn technology rapidly, solve difficult diagnostic problems, build reliable software, and effectively teach those concepts to others. Whether developing robust APIs or mentoring secondary school students through their first hardware programming challenges, I focus on practical solutions with measurable impact.",
        calloutTitle: 'The Rapid Learning Differentiator',
        calloutText: "Prior to being deployed as lead hardware instructor at the Buildathon Holiday Camp, I mastered Raspberry Pi Pico and MicroPython physical computing within just three days. This agility enables me to adapt seamlessly to unfamiliar tech stacks, legacy codebases, and emerging engineering tools.",
        storyParagraph3: "Currently, as a Learn2Earn NG Fellow & Ambassador and a full-scholarship B.Sc. Computer Science student at IU International University of Applied Sciences (Germany), I focus on high-performance backend systems in Go, structured logging, containerization, and ethical AI-assisted workflows.",
        quickFactsTitle: 'Quick Facts',
        quickFacts: [
          { label: 'Role', value: 'Technology Mentor & Advocate' },
          { label: 'Education', value: 'B.Sc. Computer Science, IU Germany (Full Scholarship)' },
          { label: 'Core Stack', value: 'Go (Golang), Python, Linux, Docker, REST APIs' },
          { label: 'Certifications', value: 'Google IT Support Professional' }
        ],
        connectCardTitle: "Let's Connect",
        connectCardText: "Interested in collaborating, hiring for an internship or engineering role, or scheduling a technical talk?",
        connectCardButtonText: "Get in Touch",
        progressionEyebrow: 'Career Evolution',
        progressionTitle: 'Multidisciplinary Growth Matrix',
        progressionSteps: [
          { title: 'Technology Learner', desc: 'Rapidly assimilating new architectures, hardware interfaces, and backend paradigms.' },
          { title: 'Technology Educator', desc: 'Demystifying complex logic for 200+ students across hardware and software computing.' },
          { title: 'Technology Advocate', desc: 'Mobilising grass-roots digital adoption with SID (Anambra State Govt ICT arm).' },
          { title: 'Community Leader', desc: 'Coordinating 3MTT Cohort 2 and fostering cross-peer accountability.' },
          { title: 'IT Support Specialist', desc: 'Google-certified hardware, networking, and systems administration troubleshooter.' },
          { title: 'Software Engineer & DevOps', desc: 'Engineering resilient Go backends, distributed systems, and automated CI/CD pipelines.' }
        ]
      };
      setFormData(defaultContent);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl">
      
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-800 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-mono font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>About Page CMS</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            About Page Text, Story &amp; Career Matrix
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Craft your professional narrative, technical differentiator, quick facts card, and multidisciplinary career progression steps.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPreviewAbout}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <Eye className="w-4 h-4" />
            <span>Preview About Page</span>
          </button>
        </div>
      </div>

      {/* Section Quick Nav Pills */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bio')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'bio'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          1. Header &amp; Story Bio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('callout')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'callout'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          2. Highlight Callout Box
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('facts')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'facts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          3. Quick Facts &amp; Sidebar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('progression')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'progression'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          4. Career Growth Matrix
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: HEADER & MAIN STORY */}
        {(activeTab === 'all' || activeTab === 'bio') && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
                  Section 1
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-500" />
                  <span>About Header &amp; Narrative Story</span>
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Header Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={formData.eyebrow || ''}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                  placeholder="Biography & Philosophy"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sky-600 dark:text-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Main Page Heading
                </label>
                <input
                  type="text"
                  value={formData.heading || ''}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  placeholder={`About ${profile.name}`}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Sub-headline / Title
              </label>
              <input
                type="text"
                value={formData.subheading || ''}
                onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                placeholder="Technology Mentor & Advocate • Software Engineering Practitioner"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sky-600 dark:text-sky-400 font-mono font-medium"
              />
            </div>

            {/* Paragraph 1 */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Story Paragraph 1 (Background &amp; Multidisciplinary Scope)
              </label>
              <textarea
                rows={4}
                value={formData.storyParagraph1 || ''}
                onChange={(e) => setFormData({ ...formData, storyParagraph1: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 leading-relaxed"
              />
            </div>

            {/* Paragraph 2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Story Paragraph 2 (Problem Solving &amp; Teaching Philosophy)
              </label>
              <textarea
                rows={4}
                value={formData.storyParagraph2 || ''}
                onChange={(e) => setFormData({ ...formData, storyParagraph2: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 leading-relaxed"
              />
            </div>

            {/* Paragraph 3 */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Story Paragraph 3 (Current Fellowship, Degree &amp; Ongoing Focus)
              </label>
              <textarea
                rows={4}
                value={formData.storyParagraph3 || ''}
                onChange={(e) => setFormData({ ...formData, storyParagraph3: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* SECTION 2: CALLOUT BOX */}
        {(activeTab === 'all' || activeTab === 'callout') && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
                  Section 2
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Highlight / Differentiator Callout Box</span>
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Callout Box Heading
              </label>
              <input
                type="text"
                value={formData.calloutTitle || ''}
                onChange={(e) => setFormData({ ...formData, calloutTitle: e.target.value })}
                placeholder="The Rapid Learning Differentiator"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Callout Story &amp; Proof Evidence
              </label>
              <textarea
                rows={3}
                value={formData.calloutText || ''}
                onChange={(e) => setFormData({ ...formData, calloutText: e.target.value })}
                placeholder="Prior to being deployed as lead hardware instructor at the Buildathon Holiday Camp..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* SECTION 3: QUICK FACTS SIDEBAR */}
        {(activeTab === 'all' || activeTab === 'facts') && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                  Section 3
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Quick Facts Card &amp; Sidebar CTA</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddQuickFact}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Fact</span>
              </button>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Quick Facts Title
              </label>
              <input
                type="text"
                value={formData.quickFactsTitle || ''}
                onChange={(e) => setFormData({ ...formData, quickFactsTitle: e.target.value })}
                placeholder="Quick Facts"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>

            {/* List of Facts */}
            <div className="space-y-3">
              {(formData.quickFacts || []).map((fact, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
                >
                  <div className="w-1/3">
                    <label className="text-[10px] text-slate-500 block">Label</label>
                    <input
                      type="text"
                      value={fact.label}
                      onChange={(e) => handleQuickFactChange(idx, 'label', e.target.value)}
                      placeholder="Role / Stack"
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block">Value</label>
                    <input
                      type="text"
                      value={fact.value}
                      onChange={(e) => handleQuickFactChange(idx, 'value', e.target.value)}
                      placeholder="e.g. Technology Mentor"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuickFact(idx)}
                    className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 mt-3"
                    title="Remove Fact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sidebar "Let's Connect" Card text */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 space-y-3 mt-4">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                Sidebar &quot;Let&apos;s Connect&quot; Mini-Card
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Card Heading</label>
                  <input
                    type="text"
                    value={formData.connectCardTitle || ''}
                    onChange={(e) => setFormData({ ...formData, connectCardTitle: e.target.value })}
                    placeholder="Let's Connect"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Button Text</label>
                  <input
                    type="text"
                    value={formData.connectCardButtonText || ''}
                    onChange={(e) => setFormData({ ...formData, connectCardButtonText: e.target.value })}
                    placeholder="Get in Touch"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Card Invitation Text</label>
                <textarea
                  rows={2}
                  value={formData.connectCardText || ''}
                  onChange={(e) => setFormData({ ...formData, connectCardText: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: CAREER EVOLUTION / MULTIDISCIPLINARY MATRIX */}
        {(activeTab === 'all' || activeTab === 'progression') && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">
                  Section 4
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  <span>Multidisciplinary Growth Matrix Steps</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddProgressionStep}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Section Eyebrow
                </label>
                <input
                  type="text"
                  value={formData.progressionEyebrow || ''}
                  onChange={(e) => setFormData({ ...formData, progressionEyebrow: e.target.value })}
                  placeholder="Career Evolution"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={formData.progressionTitle || ''}
                  onChange={(e) => setFormData({ ...formData, progressionTitle: e.target.value })}
                  placeholder="Multidisciplinary Growth Matrix"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {(formData.progressionSteps || []).map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                      Step 0{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProgressionStep(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Delete Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Step Title
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleProgressionChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Technology Educator"
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Step Description / Accomplishments
                    </label>
                    <textarea
                      rows={2}
                      value={step.desc}
                      onChange={(e) => handleProgressionChange(idx, 'desc', e.target.value)}
                      placeholder="Description of this growth phase..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="sticky bottom-6 z-20 p-4 rounded-2xl bg-white/95 dark:bg-[#0c1633]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPreviewAbout}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>Preview About Page</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Save About Page Changes</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
