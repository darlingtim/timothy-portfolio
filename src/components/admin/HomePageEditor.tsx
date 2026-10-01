import React, { useState } from 'react';
import { 
  Profile, 
  HomePageContent, 
  ImpactMetric, 
  Capability, 
  HomeCtaSection 
} from '../../types';
import { 
  Sparkles, 
  Check, 
  RotateCcw, 
  ArrowRight, 
  Eye, 
  Layers, 
  BarChart2, 
  Sliders, 
  Compass, 
  MessageSquare,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface HomePageEditorProps {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  homeContent: HomePageContent;
  onSave: (updatedHomeContent: HomePageContent, updatedProfile: Profile) => void;
  onPreviewHome: () => void;
}

export const HomePageEditor: React.FC<HomePageEditorProps> = ({
  profile,
  setProfile,
  homeContent,
  onSave,
  onPreviewHome
}) => {
  // Local edit states
  const [formData, setFormData] = useState<HomePageContent>(() => ({
    heroGreeting: homeContent.heroGreeting || "Hello, I'm",
    heroCta1Text: homeContent.heroCta1Text || "View My Work",
    heroCta1Link: homeContent.heroCta1Link || "/projects",
    heroCta2Text: homeContent.heroCta2Text || "Download CV",
    heroCta2Link: homeContent.heroCta2Link || "/resume",
    heroCta3Text: homeContent.heroCta3Text || "Certifications & Events",
    heroCta3Link: homeContent.heroCta3Link || "/events",
    connectHeading: homeContent.connectHeading || "Connect with me",
    whatIDoTitle: homeContent.whatIDoTitle || "What I Do",
    whatIDoSubtitle: homeContent.whatIDoSubtitle || "I work at the intersection of technology, education, and impact.",
    ctaSection: homeContent.ctaSection || {
      badge: "Collaboration & Mentorship",
      title: "Let's Build, Solve and Learn Together",
      description: "Whether you're looking for a technology mentor, technical support professional, backend software developer or someone to lead youth digital initiatives, I'd be glad to connect.",
      primaryButtonText: "View My Work",
      primaryButtonLink: "/projects",
      secondaryButtonText: "Contact Me",
      secondaryButtonLink: "/contact"
    }
  }));

  // Direct profile hero text states
  const [localProfile, setLocalProfile] = useState<Profile>({ ...profile });
  const [activeSection, setActiveSection] = useState<'all' | 'hero' | 'metrics' | 'whatIdo' | 'cta'>('all');

  const handleMetricChange = (index: number, field: keyof ImpactMetric, value: string) => {
    const updated = [...(localProfile.impactMetrics || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setLocalProfile({ ...localProfile, impactMetrics: updated });
    }
  };

  const handleCapabilityChange = (index: number, field: keyof Capability, value: string) => {
    const updated = [...(localProfile.capabilities || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setLocalProfile({ ...localProfile, capabilities: updated });
    }
  };

  const handleCtaChange = (field: keyof HomeCtaSection, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ctaSection: {
        ...(prev.ctaSection as HomeCtaSection),
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Profile = {
      ...localProfile,
      homeContent: formData
    };
    setProfile(updatedProfile);
    onSave(formData, updatedProfile);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset Home page text content to standard default values?')) {
      const defaultContent: HomePageContent = {
        heroGreeting: "Hello, I'm",
        heroCta1Text: "View My Work",
        heroCta1Link: "/projects",
        heroCta2Text: "Download CV",
        heroCta2Link: "/resume",
        heroCta3Text: "Certifications & Events",
        heroCta3Link: "/events",
        connectHeading: "Connect with me",
        whatIDoTitle: "What I Do",
        whatIDoSubtitle: "I work at the intersection of technology, education, and impact.",
        ctaSection: {
          badge: "Collaboration & Mentorship",
          title: "Let's Build, Solve and Learn Together",
          description: "Whether you're looking for a technology mentor, technical support professional, backend software developer or someone to lead youth digital initiatives, I'd be glad to connect.",
          primaryButtonText: "View My Work",
          primaryButtonLink: "/projects",
          secondaryButtonText: "Contact Me",
          secondaryButtonLink: "/contact"
        }
      };
      setFormData(defaultContent);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl">
      
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-mono font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Home Page CMS</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Home Page Text &amp; Sections Editor
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Customize all copy, headlines, value statements, impact metrics, capability cards, and calls to action displayed on your landing page.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPreviewHome}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Page</span>
          </button>
        </div>
      </div>

      {/* Section Quick Nav Pills */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('hero')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'hero'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          1. Hero Intro &amp; CTAs
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('metrics')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'metrics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          2. Impact Metrics Strip
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('whatIdo')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'whatIdo'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          3. What I Do Cards
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('cta')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'cta'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          4. Bottom CTA Banner
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: HERO COPY */}
        {(activeSection === 'all' || activeSection === 'hero') && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
                  Section 1
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                  <span>Hero Introduction, Headlines &amp; Action Buttons</span>
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Greeting Badge Text
                </label>
                <input
                  type="text"
                  value={formData.heroGreeting || ''}
                  onChange={(e) => setFormData({ ...formData, heroGreeting: e.target.value })}
                  placeholder="Hello, I'm"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-slate-500">Appears inside the glowing pill above your name.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={localProfile.name || ''}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Professional Role Title / Headline
              </label>
              <input
                type="text"
                value={localProfile.title || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 text-sky-600 dark:text-sky-400 font-medium"
              />
              <span className="text-[11px] text-slate-500">Displayed in prominent colored typography directly below your name.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Primary Value Statement / Tagline
              </label>
              <textarea
                rows={3}
                value={localProfile.tagline || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
              <span className="text-[11px] text-slate-500">The concise elevator pitch explaining what you build, troubleshoot, and solve.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Current Availability Status
              </label>
              <input
                type="text"
                value={localProfile.status || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <span className="text-[11px] text-slate-500">Shown in the pulsing availability badge (e.g. &quot;Available for Software Engineering...&quot;).</span>
            </div>

            {/* Hero 3 Action Buttons Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Hero Call to Action Buttons
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Button 1 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Primary Button (Blue)</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Button Label</label>
                    <input
                      type="text"
                      value={formData.heroCta1Text || ''}
                      onChange={(e) => setFormData({ ...formData, heroCta1Text: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Link Target</label>
                    <input
                      type="text"
                      value={formData.heroCta1Link || ''}
                      onChange={(e) => setFormData({ ...formData, heroCta1Link: e.target.value })}
                      placeholder="/projects"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* Button 2 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secondary Button</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Button Label</label>
                    <input
                      type="text"
                      value={formData.heroCta2Text || ''}
                      onChange={(e) => setFormData({ ...formData, heroCta2Text: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Link Target</label>
                    <input
                      type="text"
                      value={formData.heroCta2Link || ''}
                      onChange={(e) => setFormData({ ...formData, heroCta2Link: e.target.value })}
                      placeholder="/resume"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* Button 3 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Tertiary Button</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Button Label</label>
                    <input
                      type="text"
                      value={formData.heroCta3Text || ''}
                      onChange={(e) => setFormData({ ...formData, heroCta3Text: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Link Target</label>
                    <input
                      type="text"
                      value={formData.heroCta3Link || ''}
                      onChange={(e) => setFormData({ ...formData, heroCta3Link: e.target.value })}
                      placeholder="/events"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Social Connect Section Heading
              </label>
              <input
                type="text"
                value={formData.connectHeading || ''}
                onChange={(e) => setFormData({ ...formData, connectHeading: e.target.value })}
                placeholder="Connect with me"
                className="w-full max-w-sm px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        )}

        {/* SECTION 2: IMPACT METRICS STRIP */}
        {(activeSection === 'all' || activeSection === 'metrics') && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                  Section 2
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-500" />
                  <span>Impact Metrics Numbers &amp; Labels</span>
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              These key statistics are highlighted directly beneath the hero section to establish immediate credibility.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(localProfile.impactMetrics || []).map((metric, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3"
                >
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 block">
                    Metric #{idx + 1}
                  </span>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Big Number / Value</label>
                    <input
                      type="text"
                      value={metric.value}
                      onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                      placeholder="e.g. 500+"
                      className="w-full px-3 py-1.5 text-sm font-bold text-sky-600 dark:text-sky-400 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Label</label>
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                      placeholder="Learners Mentored"
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Detail Note (Optional)</label>
                    <textarea
                      rows={2}
                      value={metric.detail || ''}
                      onChange={(e) => handleMetricChange(idx, 'detail', e.target.value)}
                      placeholder="Description note..."
                      className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 leading-snug"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: WHAT I DO CARDS */}
        {(activeSection === 'all' || activeSection === 'whatIdo') && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
                  Section 3
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  <span>&quot;What I Do&quot; Capability Focus Cards</span>
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Section Title
                </label>
                <input
                  type="text"
                  value={formData.whatIDoTitle || ''}
                  onChange={(e) => setFormData({ ...formData, whatIDoTitle: e.target.value })}
                  placeholder="What I Do"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={formData.whatIDoSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, whatIDoSubtitle: e.target.value })}
                  placeholder="I work at the intersection of technology, education, and impact."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {(localProfile.capabilities || []).slice(0, 4).map((cap, idx) => (
                <div
                  key={cap.id || idx}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                      Card #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-500 uppercase">{cap.id}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Card Title</label>
                    <input
                      type="text"
                      value={cap.title}
                      onChange={(e) => handleCapabilityChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Description</label>
                    <textarea
                      rows={2}
                      value={cap.description}
                      onChange={(e) => handleCapabilityChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">CTA Label</label>
                      <input
                        type="text"
                        value={cap.ctaText || ''}
                        onChange={(e) => handleCapabilityChange(idx, 'ctaText', e.target.value)}
                        placeholder="View More"
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">CTA Target</label>
                      <input
                        type="text"
                        value={cap.ctaLink || ''}
                        onChange={(e) => handleCapabilityChange(idx, 'ctaLink', e.target.value)}
                        placeholder="/projects"
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: BOTTOM CALL TO ACTION BANNER */}
        {(activeSection === 'all' || activeSection === 'cta') && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
                  Section 4
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-sky-500" />
                  <span>Bottom Call to Action Banner</span>
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Banner Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={formData.ctaSection?.badge || ''}
                  onChange={(e) => handleCtaChange('badge', e.target.value)}
                  placeholder="Collaboration & Mentorship"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sky-600 dark:text-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={formData.ctaSection?.title || ''}
                  onChange={(e) => handleCtaChange('title', e.target.value)}
                  placeholder="Let's Build, Solve and Learn Together"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Invitation Description Text
              </label>
              <textarea
                rows={3}
                value={formData.ctaSection?.description || ''}
                onChange={(e) => handleCtaChange('description', e.target.value)}
                placeholder="Whether you're looking for a technology mentor, technical support professional..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Primary Button</span>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Label</label>
                  <input
                    type="text"
                    value={formData.ctaSection?.primaryButtonText || ''}
                    onChange={(e) => handleCtaChange('primaryButtonText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Target URL</label>
                  <input
                    type="text"
                    value={formData.ctaSection?.primaryButtonLink || ''}
                    onChange={(e) => handleCtaChange('primaryButtonLink', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secondary Button</span>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Label</label>
                  <input
                    type="text"
                    value={formData.ctaSection?.secondaryButtonText || ''}
                    onChange={(e) => handleCtaChange('secondaryButtonText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Target URL</label>
                  <input
                    type="text"
                    value={formData.ctaSection?.secondaryButtonLink || ''}
                    onChange={(e) => handleCtaChange('secondaryButtonLink', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>
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
              onClick={onPreviewHome}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>Preview Live Home</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Save Home Page Changes</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
