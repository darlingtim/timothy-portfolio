import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { ImpactMetrics } from './components/ImpactMetrics';
import { WhatIDo } from './components/WhatIDo';
import { ExperienceView } from './components/ExperienceView';
import { ProjectsView } from './components/ProjectsView';
import { ProjectDetailView } from './components/ProjectDetailView';
import { SkillsView } from './components/SkillsView';
import { ResumeView } from './components/ResumeView';
import { ContactView } from './components/ContactView';
import { AboutView } from './components/AboutView';
import { MentoringView } from './components/MentoringView';
import { GalleryView } from './components/GalleryView';
import { EventsView } from './components/EventsView';
import { CertificationsView } from './components/CertificationsView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  getProfile, 
  getProjects, 
  getExperiences, 
  getGalleryItems, 
  getAchievements, 
  getSkills, 
  getCertifications, 
  getEducation, 
  getCommunity,
  getMentoringPrograms,
  getMessages,
  getSiteSettings,
  getCarouselConfig,
  getEventContributions,
  fetchServerData,
  saveStored
} from './data';
import { 
  Profile, 
  Project, 
  Experience, 
  GalleryItem, 
  Achievement, 
  SkillsData, 
  Certification, 
  Education, 
  CommunityRole, 
  MentoringProgram, 
  ContactMessage, 
  SiteSettings,
  CarouselConfig,
  EventContribution
} from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  
  // Theme state: Night theme is default, toggle overrides regardless of device OS preferences
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme_preference');
      if (stored !== null) {
        return stored === 'dark';
      }
      // Night/dark theme is the default regardless of device settings
      return true;
    }
    return true;
  });

  // Admin Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('timothy_admin_auth') === 'true';
    }
    return false;
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [inAdminDashboard, setInAdminDashboard] = useState<boolean>(false);

  // Dynamic state stores initialized from local persistence / defaults
  const [profile, setProfile] = useState<Profile>(getProfile);
  const [projects, setProjects] = useState<Project[]>(getProjects);
  const [experiences, setExperiences] = useState<Experience[]>(getExperiences);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(getGalleryItems);
  const [achievements, setAchievements] = useState<Achievement[]>(getAchievements);
  const [skills, setSkills] = useState<SkillsData>(getSkills);
  const [certifications, setCertifications] = useState<Certification[]>(getCertifications);
  const [education, setEducation] = useState<Education[]>(getEducation);
  const [community, setCommunity] = useState<CommunityRole[]>(getCommunity);
  const [mentoringPrograms, setMentoringPrograms] = useState<MentoringProgram[]>(getMentoringPrograms);
  const [messages, setMessages] = useState<ContactMessage[]>(getMessages);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings);
  const [carouselConfig, setCarouselConfig] = useState<CarouselConfig>(getCarouselConfig);
  const [events, setEvents] = useState<EventContribution[]>(getEventContributions);

  // Hydrate from server on mount to ensure cross-device consistency
  useEffect(() => {
    fetchServerData().then((serverData) => {
      if (serverData) {
        if (serverData.profile) setProfile(serverData.profile);
        if (serverData.projects) setProjects(serverData.projects);
        if (serverData.experiences) setExperiences(serverData.experiences);
        if (serverData.gallery) setGalleryItems(serverData.gallery);
        if (serverData.achievements) setAchievements(serverData.achievements);
        if (serverData.skills) setSkills(serverData.skills);
        if (serverData.certifications) setCertifications(serverData.certifications);
        if (serverData.education) setEducation(serverData.education);
        if (serverData.messages) setMessages(serverData.messages);
        if (serverData.settings) setSiteSettings(serverData.settings);
        if (serverData.carouselConfig) setCarouselConfig(serverData.carouselConfig);
        if (serverData.eventContributions) setEvents(serverData.eventContributions);
      }
    });
  }, []);

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_preference', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_preference', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedProjectSlug(null);
    setInAdminDashboard(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProject = (slug: string) => {
    setSelectedProjectSlug(slug);
    setInAdminDashboard(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('timothy_admin_auth', 'true');
    setInAdminDashboard(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('timothy_admin_auth');
    setInAdminDashboard(false);
    setCurrentPath('/');
  };

  const selectedProject = selectedProjectSlug 
    ? projects.find(p => p.slug === selectedProjectSlug)
    : null;

  // Render Full Admin Dashboard View if active
  if (inAdminDashboard && isAdminLoggedIn) {
    return (
      <AdminDashboard
        profile={profile}
        setProfile={setProfile}
        projects={projects}
        setProjects={setProjects}
        experiences={experiences}
        setExperiences={setExperiences}
        galleryItems={galleryItems}
        setGalleryItems={setGalleryItems}
        achievements={achievements}
        setAchievements={setAchievements}
        skills={skills}
        setSkills={setSkills}
        certifications={certifications}
        setCertifications={setCertifications}
        education={education}
        setEducation={setEducation}
        messages={messages}
        setMessages={setMessages}
        siteSettings={siteSettings}
        setSiteSettings={setSiteSettings}
        carouselConfig={carouselConfig}
        setCarouselConfig={setCarouselConfig}
        events={events}
        setEvents={setEvents}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onVisitPortfolio={() => { setInAdminDashboard(false); handleNavigate('/'); }}
        onLogout={handleAdminLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070e24] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navigation matching Image 1 */}
      <Header 
        currentPath={currentPath}
        onNavigate={handleNavigate}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        profile={profile}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onGoToAdmin={() => setInAdminDashboard(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {selectedProject ? (
          <ProjectDetailView 
            project={selectedProject}
            onBack={() => setSelectedProjectSlug(null)}
            onNavigateContact={() => handleNavigate('/contact')}
          />
        ) : (
          <>
            {currentPath === '/' && (
              <div className="space-y-0">
                {/* 1. Hero Section with Carousel / Steady Photo Toggle */}
                <Hero 
                  profile={profile} 
                  carouselConfig={carouselConfig}
                  onUpdateCarouselConfig={(updated) => {
                    setCarouselConfig(updated);
                    saveStored('carouselConfig', updated);
                  }}
                  onNavigate={handleNavigate} 
                />
                
                {/* 2. Stats Bar */}
                <ImpactMetrics metrics={profile.impactMetrics} />
                
                {/* 3. What I Do 4-Card Section */}
                <WhatIDo capabilities={profile.capabilities} onNavigate={handleNavigate} />
                
                {/* 4. Featured Projects Section */}
                <ProjectsView 
                  projects={projects} 
                  onSelectProject={handleSelectProject}
                  onNavigate={handleNavigate}
                />

                {/* 5. Experience Timeline Preview */}
                <ExperienceView 
                  experiences={experiences.filter(e => e.isFeatured)} 
                  onNavigate={handleNavigate} 
                />

                {/* 6. Skills & Certifications Preview */}
                <SkillsView 
                  skills={skills}
                  certifications={certifications}
                  education={education}
                  community={community}
                  onNavigate={handleNavigate}
                />

                {/* 7. Bottom Call to Action Section */}
                <section className="py-16 bg-[#0a1128] text-white border-t border-slate-800">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
                      Collaboration &amp; Mentorship
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                      Let's Build, Solve and Learn Together
                    </h2>
                    <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                      Whether you're looking for a technology mentor, technical support professional, backend software developer or someone to lead youth digital initiatives, I'd be glad to connect.
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-4">
                      <button
                        onClick={() => handleNavigate('/projects')}
                        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-all"
                      >
                        View My Work
                      </button>
                      <button
                        onClick={() => handleNavigate('/contact')}
                        className="px-6 py-3 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
                      >
                        Contact Me
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {currentPath === '/about' && (
              <AboutView profile={profile} onNavigate={handleNavigate} />
            )}

            {currentPath === '/experience' && (
              <ExperienceView 
                experiences={experiences} 
                onNavigate={handleNavigate}
                isStandalone={true}
              />
            )}

            {currentPath === '/projects' && (
              <ProjectsView 
                projects={projects} 
                onSelectProject={handleSelectProject}
                onNavigate={handleNavigate}
                isStandalone={true}
              />
            )}

            {currentPath === '/events' && (
              <EventsView 
                events={events}
                onNavigate={handleNavigate}
              />
            )}

            {currentPath === '/certifications' && (
              <CertificationsView 
                certifications={certifications}
                achievements={achievements}
                education={education}
                onNavigate={handleNavigate}
              />
            )}

            {currentPath === '/skills' && (
              <SkillsView 
                skills={skills}
                certifications={certifications}
                education={education}
                community={community}
                onNavigate={handleNavigate}
                isStandalone={true}
              />
            )}

            {currentPath === '/mentoring' && (
              <MentoringView
                programs={mentoringPrograms}
                onNavigate={handleNavigate}
              />
            )}

            {currentPath === '/gallery' && (
              <GalleryView 
                galleryItems={galleryItems}
              />
            )}

            {currentPath === '/resume' && (
              <ResumeView 
                profile={profile}
                experiences={experiences}
                skills={skills}
                certifications={certifications}
                education={education}
                onNavigateContact={() => handleNavigate('/contact')}
              />
            )}

            {currentPath === '/contact' && (
              <ContactView 
                profile={profile} 
                onNewMessage={(newMsg) => setMessages((prev) => [newMsg, ...prev])}
              />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Admin Login Dialog */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleAdminLogin}
      />

    </div>
  );
}
