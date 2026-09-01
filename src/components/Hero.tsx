import React from 'react';
import { ArrowRight, Download, Github, Linkedin, Twitter, Mail, Sparkles } from 'lucide-react';
import { Profile, CarouselConfig } from '../types';
import { HeroPhotoCarousel } from './HeroPhotoCarousel';

interface HeroProps {
  profile: Profile;
  carouselConfig?: CarouselConfig;
  onUpdateCarouselConfig?: (config: CarouselConfig) => void;
  onNavigate: (path: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  profile, 
  carouselConfig,
  onUpdateCarouselConfig,
  onNavigate 
}) => {
  // Fallback default carousel config if not provided
  const config: CarouselConfig = carouselConfig || {
    mode: 'carousel',
    steadyPhotoId: 'photo-1',
    intervalSeconds: 4,
    autoPlay: true,
    showIndicators: true,
    showArrows: true,
    showCaptions: true,
    photos: [
      {
        id: 'photo-1',
        url: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
        caption: `${profile.name} — Technology Mentor & Advocate`,
        tag: 'Executive Profile',
        isIncludedInCarousel: true,
        order: 1
      }
    ]
  };

  return (
    <section className="relative overflow-hidden bg-[#070e24] text-white py-12 sm:py-16 lg:py-20 border-b border-slate-800">
      
      {/* Background Animated Constellation / Grid Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-nodes" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="#38bdf8" opacity="0.4" />
              <path d="M 30 0 L 30 60 M 0 30 L 60 30" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-nodes)" />
        </svg>
      </div>

      {/* Ambient Radial Glows */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Text Content & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left order-2 lg:order-1">
            
            {/* Greeting */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs sm:text-sm font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hello, I'm</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {profile.name}
              </h1>
            </div>

            {/* Sub-headline with highlights */}
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-semibold text-sky-400 leading-snug">
                {profile.title}
              </p>
            </div>

            {/* Main Value Statement */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              {profile.tagline}
            </p>

            {/* CTAs matching screenshot */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('/projects')}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-900/40 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <span>View My Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/resume')}
                className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm sm:text-base transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Download CV</span>
              </button>

              <button
                onClick={() => onNavigate('/events')}
                className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm sm:text-base transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Certifications &amp; Events</span>
              </button>
            </div>

            {/* Connect With Me Social Links */}
            <div className="pt-6 border-t border-slate-800/80 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-medium">
                Connect with me
              </span>
              <div className="flex items-center gap-3">
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-400 transition-colors"
                    aria-label="GitHub Profile"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-400 transition-colors"
                    aria-label="LinkedIn Profile"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-400 transition-colors"
                    aria-label="Twitter Profile"
                    title="Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {profile.email && (
                  <button
                    onClick={() => onNavigate('/contact')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-400 transition-colors"
                    aria-label="Send Email"
                    title="Email Contact"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Hero Fading Photo Carousel with Steady-Lock Mode */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
            <HeroPhotoCarousel 
              config={config} 
              onUpdateConfig={onUpdateCarouselConfig}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
