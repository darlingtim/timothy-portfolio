import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Code, 
  FolderGit2, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Image as ImageIcon, 
  Mail, 
  Settings, 
  Camera, 
  ShieldCheck, 
  Database, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  ArrowRight, 
  Download, 
  Upload, 
  Search, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Send,
  Reply,
  CornerDownRight,
  Sparkles,
  Phone,
  MapPin,
  Globe,
  RotateCw,
  Calendar,
  Pin,
  Layers,
  BarChart2,
  Sliders
} from 'lucide-react';
import { 
  Profile, 
  Project, 
  Experience, 
  GalleryItem, 
  Achievement, 
  SkillsData, 
  Education, 
  ContactMessage, 
  SiteSettings,
  Certification,
  MessageReply,
  CustomField,
  CarouselConfig,
  EventContribution,
  Skill,
  SkillCategory
} from '../../types';
import { saveStored } from '../../data';
import { CustomFieldEditor } from './CustomFieldEditor';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';
import { EmailReplyModal } from './EmailReplyModal';
import { ProjectModal } from './ProjectModal';
import { ExperienceModal } from './ExperienceModal';
import { GalleryModal } from './GalleryModal';
import { AchievementModal } from './AchievementModal';
import { EventModal } from './EventModal';
import { SkillModal } from './SkillModal';
import { SkillCategoryModal } from './SkillCategoryModal';
import { CarouselSettingsManager } from './CarouselSettingsManager';
import { GitDeployManager } from './GitDeployManager';

interface AdminDashboardProps {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  galleryItems: GalleryItem[];
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  skills: SkillsData;
  setSkills: React.Dispatch<React.SetStateAction<SkillsData>>;
  certifications: Certification[];
  setCertifications: React.Dispatch<React.SetStateAction<Certification[]>>;
  education: Education[];
  setEducation: React.Dispatch<React.SetStateAction<Education[]>>;
  messages: ContactMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  carouselConfig: CarouselConfig;
  setCarouselConfig: React.Dispatch<React.SetStateAction<CarouselConfig>>;
  events: EventContribution[];
  setEvents: React.Dispatch<React.SetStateAction<EventContribution[]>>;
  isDark: boolean;
  onToggleTheme: () => void;
  onVisitPortfolio: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profile,
  setProfile,
  projects,
  setProjects,
  experiences,
  setExperiences,
  galleryItems,
  setGalleryItems,
  achievements,
  setAchievements,
  skills,
  setSkills,
  certifications,
  setCertifications,
  education,
  setEducation,
  messages,
  setMessages,
  siteSettings,
  setSiteSettings,
  carouselConfig,
  setCarouselConfig,
  events,
  setEvents,
  isDark,
  onToggleTheme,
  onVisitPortfolio,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & filter states
  const [projectSearch, setProjectSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'replied'>('all');

  // Modals for CRUD
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [experienceToEdit, setExperienceToEdit] = useState<Experience | null>(null);

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryToEdit, setGalleryToEdit] = useState<GalleryItem | null>(null);

  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [achievementToEdit, setAchievementToEdit] = useState<Achievement | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventContribution | null>(null);

  // Skills & Category Modals & Filter states
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<{ skill: Skill; categoryId: string } | null>(null);
  const [defaultSkillCategoryId, setDefaultSkillCategoryId] = useState<string>('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<SkillCategory | null>(null);

  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('all');

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [messageToReply, setMessageToReply] = useState<ContactMessage | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Skills & Categories CRUD
  const handleSaveSkill = (skill: Skill, targetCategoryId: string, originalSkillName?: string) => {
    let categoryFound = false;
    const currentCategories = skills?.categories || [];
    const updatedCategories = currentCategories.map((cat) => {
      let catSkills = [...(cat.skills || [])];
      
      // If moving from another category, remove from old category
      if (originalSkillName && cat.id !== targetCategoryId) {
        catSkills = catSkills.filter((s) => s.name !== originalSkillName);
      }
      
      // If this is the target category
      if (cat.id === targetCategoryId) {
        categoryFound = true;
        const targetLookupName = originalSkillName || skill.name;
        const existingIdx = catSkills.findIndex((s) => s.name === targetLookupName);
        if (existingIdx >= 0) {
          catSkills[existingIdx] = skill;
        } else {
          catSkills.push(skill);
        }
      }
      return { ...cat, skills: catSkills };
    });

    let finalCategories = updatedCategories;
    if (!categoryFound) {
      finalCategories = [
        ...updatedCategories,
        {
          id: targetCategoryId,
          name: targetCategoryId,
          description: '',
          skills: [skill]
        }
      ];
    }

    const updated: SkillsData = { categories: finalCategories };
    setSkills(updated);
    saveStored('skills', updated);
    showToast(`Skill "${skill.name}" saved successfully!`);
  };

  const handleDeleteSkill = (skillName: string, categoryId: string) => {
    if (!confirm(`Are you sure you want to remove the skill "${skillName}"?`)) return;
    const currentCategories = skills?.categories || [];
    const updatedCategories = currentCategories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          skills: (cat.skills || []).filter((s) => s.name !== skillName)
        };
      }
      return cat;
    });
    const updated: SkillsData = { categories: updatedCategories };
    setSkills(updated);
    saveStored('skills', updated);
    showToast(`Skill "${skillName}" removed.`);
  };

  const handleSaveCategory = (category: SkillCategory, originalCategoryId?: string) => {
    const currentCategories = skills?.categories || [];
    let updatedCategories: SkillCategory[];
    if (originalCategoryId) {
      updatedCategories = currentCategories.map((c) =>
        c.id === originalCategoryId ? { ...category, skills: c.skills || [] } : c
      );
      showToast(`Category "${category.name}" updated!`);
    } else {
      updatedCategories = [...currentCategories, { ...category, skills: [] }];
      showToast(`Category "${category.name}" added!`);
    }
    const updated: SkillsData = { categories: updatedCategories };
    setSkills(updated);
    saveStored('skills', updated);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const currentCategories = skills?.categories || [];
    const targetCat = currentCategories.find((c) => c.id === categoryId);
    if (!targetCat) return;

    if (targetCat.skills && targetCat.skills.length > 0) {
      if (
        !confirm(
          `Category "${targetCat.name}" contains ${targetCat.skills.length} skills. Deleting it will remove the category and all its skills. Are you sure?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Delete category "${targetCat.name}"?`)) return;
    }

    const updatedCategories = currentCategories.filter((c) => c.id !== categoryId);
    const updated: SkillsData = { categories: updatedCategories };
    setSkills(updated);
    saveStored('skills', updated);
    showToast(`Category "${targetCat.name}" removed.`);
  };

  const getSkillBadgeClass = (level: string) => {
    switch (level) {
      case 'Strong':
      case 'Expert':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'Practical Experience':
      case 'Advanced':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Working Proficiency':
      case 'Intermediate':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Developing':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Carousel config save
  const handleSaveCarouselConfig = (updated: CarouselConfig) => {
    setCarouselConfig(updated);
    saveStored('carouselConfig', updated);
    showToast('Carousel & Steady Photo configuration saved permanently!');
  };

  // Events CRUD
  const handleSaveEvent = (evt: EventContribution) => {
    const exists = events.some((e) => e.id === evt.id);
    let updated: EventContribution[];
    if (exists) {
      updated = events.map((e) => (e.id === evt.id ? evt : e));
      showToast(`Updated event "${evt.title}"`);
    } else {
      updated = [evt, ...events];
      showToast(`Added event "${evt.title}"`);
    }
    setEvents(updated);
    saveStored('eventContributions', updated);
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm('Are you sure you want to delete this event contribution?')) return;
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveStored('eventContributions', updated);
    showToast('Event contribution deleted.');
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveStored('profile', profile);
    showToast('Profile & Bio updated successfully!');
  };

  const handleUpdateAvatar = (newUrl: string) => {
    const updated = { ...profile, avatarUrl: newUrl };
    setProfile(updated);
    saveStored('profile', updated);
    showToast('Profile photo updated across the entire site!');
  };

  // Projects CRUD
  const handleSaveProject = (project: Project) => {
    const exists = projects.some((p) => p.slug === project.slug);
    let updated: Project[];
    if (exists) {
      updated = projects.map((p) => (p.slug === project.slug ? project : p));
      showToast(`Updated project "${project.name}"`);
    } else {
      updated = [project, ...projects];
      showToast(`Created project "${project.name}"`);
    }
    setProjects(updated);
    saveStored('projects', updated);
  };

  const handleDeleteProject = (slug: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const updated = projects.filter((p) => p.slug !== slug);
    setProjects(updated);
    saveStored('projects', updated);
    showToast('Project removed.');
  };

  // Experiences CRUD
  const handleSaveExperience = (exp: Experience) => {
    const exists = experiences.some((e) => e.id === exp.id);
    let updated: Experience[];
    if (exists) {
      updated = experiences.map((e) => (e.id === exp.id ? exp : e));
      showToast(`Updated experience at "${exp.organization}"`);
    } else {
      updated = [exp, ...experiences];
      showToast(`Added experience at "${exp.organization}"`);
    }
    setExperiences(updated);
    saveStored('experiences', updated);
  };

  const handleDeleteExperience = (id: string) => {
    if (!confirm('Are you sure you want to delete this experience record?')) return;
    const updated = experiences.filter((e) => e.id !== id);
    setExperiences(updated);
    saveStored('experiences', updated);
    showToast('Experience record deleted.');
  };

  // Gallery CRUD
  const handleSaveGallery = (item: GalleryItem) => {
    const exists = galleryItems.some((g) => g.id === item.id);
    let updated: GalleryItem[];
    if (exists) {
      updated = galleryItems.map((g) => (g.id === item.id ? item : g));
      showToast(`Updated photo "${item.title}"`);
    } else {
      updated = [item, ...galleryItems];
      showToast(`Added photo "${item.title}"`);
    }
    setGalleryItems(updated);
    saveStored('gallery', updated);
  };

  const handleDeleteGallery = (id: string) => {
    if (!confirm('Delete this gallery photo?')) return;
    const updated = galleryItems.filter((g) => g.id !== id);
    setGalleryItems(updated);
    saveStored('gallery', updated);
    showToast('Gallery photo deleted.');
  };

  // Achievements CRUD
  const handleSaveAchievement = (ach: Achievement) => {
    const exists = achievements.some((a) => a.id === ach.id);
    let updated: Achievement[];
    if (exists) {
      updated = achievements.map((a) => (a.id === ach.id ? ach : a));
      showToast(`Updated achievement "${ach.title}"`);
    } else {
      updated = [ach, ...achievements];
      showToast(`Added achievement "${ach.title}"`);
    }
    setAchievements(updated);
    saveStored('achievements', updated);
  };

  const handleDeleteAchievement = (id: string) => {
    if (!confirm('Delete this achievement record?')) return;
    const updated = achievements.filter((a) => a.id !== id);
    setAchievements(updated);
    saveStored('achievements', updated);
    showToast('Achievement deleted.');
  };

  // Messages Actions & Direct Reply
  const handleToggleMessageRead = (id: string) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, isRead: !m.isRead } : m));
    setMessages(updated);
    saveStored('messages', updated);
  };

  const handleToggleMessageStar = (id: string) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m));
    setMessages(updated);
    saveStored('messages', updated);
  };

  const handleDeleteMessage = (id: string) => {
    if (!confirm('Delete this message?')) return;
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    saveStored('messages', updated);
    showToast('Message deleted.');
  };

  const handleSendReply = (originalMessageId: string, reply: MessageReply) => {
    const updated = messages.map((m) => {
      if (m.id === originalMessageId) {
        const existingReplies = m.replies || [];
        return {
          ...m,
          isRead: true,
          status: 'Replied' as const,
          replies: [...existingReplies, reply]
        };
      }
      return m;
    });
    setMessages(updated);
    saveStored('messages', updated);
    showToast(`Reply sent to recipient and logged in communication thread!`);
  };

  // Backup / Export
  const handleExportBackup = () => {
    const backupData = {
      profile,
      projects,
      experiences,
      galleryItems,
      achievements,
      skills,
      certifications,
      education,
      messages,
      siteSettings,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `timothy_ododo_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Portfolio JSON backup downloaded!');
  };

  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  const filteredMessages = messages.filter((m) => {
    if (messageFilter === 'unread') return !m.isRead;
    if (messageFilter === 'replied') return m.status === 'Replied' || (m.replies && m.replies.length > 0);
    return true;
  });

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(projectSearch.toLowerCase()) ||
      (p.technologies || []).some((t) => t.toLowerCase().includes(projectSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-[#070d1e] text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation (Matching Image 2) */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0a122c] text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Top Profile Card in Sidebar */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="relative group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 border border-sky-400/40 flex items-center justify-center font-bold text-white shadow-md overflow-hidden shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>TO</span>
              )}
            </div>
            <button
              onClick={() => {
                setActiveTab('photo');
                setSidebarOpen(false);
              }}
              title="Change Profile Photo"
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-white truncate leading-snug">
              {profile.name}
            </h2>
            <span className="text-xs text-sky-400 font-mono tracking-wider block">
              Portfolio Admin
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          {/* Main Dashboard */}
          <div>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Content Management Group */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3">
              CONTENT MANAGEMENT
            </span>

            <button
              onClick={() => {
                setActiveTab('profile');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile &amp; About</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('photo');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'photo'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Camera className="w-4 h-4 text-slate-400" />
              <span>Update Profile Photo</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('carousel');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'carousel'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <RotateCw className="w-4 h-4 text-slate-400" />
              <span>Carousel &amp; Steady Photo</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('skills');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'skills'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Code className="w-4 h-4 text-slate-400" />
              <span>Skills</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('projects');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'projects'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <FolderGit2 className="w-4 h-4 text-slate-400" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('experience');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'experience'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>Experience</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('events');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'events'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Events &amp; Summits</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('education');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'education'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>Education</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('achievements');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-4 h-4 text-slate-400" />
              <span>Achievements</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('gallery');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span>Gallery</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('messages');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'messages'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Messages &amp; Email</span>
              </div>
              {unreadMessagesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          </div>

          {/* Site Management Group */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3">
              SITE MANAGEMENT
            </span>

            <button
              onClick={() => {
                setActiveTab('git-deploy');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'git-deploy'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-4 h-4 text-slate-400" />
                <span>Git &amp; Auto-Deploy</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded">
                CI/CD
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <Database className="w-4 h-4 text-slate-400" />
              <span>Backup / Export JSON</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-sm">
          <button
            onClick={onVisitPortfolio}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition-colors"
          >
            <span className="font-medium">Visit Portfolio</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-[#0c142c] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white capitalize">
                {activeTab === 'photo' ? 'Profile Photo Manager' : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onVisitPortfolio}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Site</span>
            </button>

            <div 
              onClick={() => setActiveTab('photo')}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer"
              title="Click to update profile photo"
            >
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden ring-2 ring-sky-500/20">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>TO</span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                  {profile.name}
                </span>
                <span className="text-[10px] text-sky-500 font-mono">
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* TAB 1: MAIN DASHBOARD (Image 2) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              {/* Welcome Banner */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
                    Welcome back, {profile.name}! 👋
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base font-normal">
                    Here's what's happening with your portfolio, messages, and content.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('photo')}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
                >
                  <Camera className="w-4 h-4" />
                  <span>Update Profile Photo</span>
                </button>
              </div>

              {/* 6 Top Stat Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div
                  onClick={() => setActiveTab('skills')}
                  className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Skills</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Code className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {(skills?.categories || []).reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)}
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-2 flex items-center gap-1">
                    Manage skills &rarr;
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('projects')}
                  className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800/80 hover:border-blue-500 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Projects</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {projects.length}
                  </div>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-2 flex items-center gap-1">
                    View all projects &rarr;
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('experience')}
                  className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Experiences</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {experiences.length}
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
                    View all experiences &rarr;
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('gallery')}
                  className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800/80 hover:border-purple-500 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gallery Items</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {galleryItems.length}
                  </div>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-2 flex items-center gap-1">
                    View gallery &rarr;
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('achievements')}
                  className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800/80 hover:border-amber-500 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Achievements</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {achievements.length}
                  </div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1">
                    View all achievements &rarr;
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('messages')}
                  className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#0c1633] border border-slate-200 dark:border-slate-800/80 hover:border-sky-500 shadow-sm transition-all flex flex-col justify-between col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Messages</span>
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{messages.length}</span>
                    {unreadMessagesCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                        {unreadMessagesCount} new
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-2 flex items-center gap-1">
                    Reply &amp; manage &rarr;
                  </span>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setProjectToEdit(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Project</span>
                </button>

                <button
                  onClick={() => {
                    setExperienceToEdit(null);
                    setIsExperienceModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>

                <button
                  onClick={() => {
                    setGalleryToEdit(null);
                    setIsGalleryModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Gallery Photo</span>
                </button>

                <button
                  onClick={() => setActiveTab('photo')}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Change Profile Photo</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile &amp; Bio</span>
                </button>
              </div>

              {/* Recent Inquiries & Direct Reply Preview */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-sky-500" />
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Recent Inquiries &amp; Messages
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-xs text-sky-500 font-semibold hover:underline"
                  >
                    View All ({messages.length}) &rarr;
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p className="text-xs text-slate-500">No contact messages received yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {messages.slice(0, 3).map((msg) => (
                      <div key={msg.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{msg.name}</span>
                            <span className="text-xs text-slate-500">&lt;{msg.email}&gt;</span>
                            {!msg.isRead && (
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/10 text-blue-500 font-bold">
                                New
                              </span>
                            )}
                            {msg.status === 'Replied' && (
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                                Replied
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-xl">
                            {msg.subject}: &quot;{msg.message}&quot;
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setMessageToReply(msg);
                              setIsReplyModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Reply Directly</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PROFILE PHOTO MANAGER */}
          {activeTab === 'photo' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl">
              <ProfilePhotoUploader
                currentAvatarUrl={profile.avatarUrl}
                onSaveAvatar={handleUpdateAvatar}
              />
            </div>
          )}

          {/* TAB 2.5: CAROUSEL & STEADY PHOTO MANAGER */}
          {activeTab === 'carousel' && (
            <div className="space-y-6 animate-in fade-in max-w-5xl">
              <CarouselSettingsManager
                config={carouselConfig}
                onSaveConfig={handleSaveCarouselConfig}
              />
            </div>
          )}

          {/* TAB 3: PROFILE & ABOUT CMS */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in max-w-4xl">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* Photo Manager Card */}
                <ProfilePhotoUploader
                  currentAvatarUrl={profile.avatarUrl}
                  onSaveAvatar={handleUpdateAvatar}
                />

                {/* Core Personal Details */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-4">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Personal Identity &amp; Bio
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        Location / Base
                      </label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        type="text"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+234..."
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Professional Headline / Role Title
                    </label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Tagline / Mission Statement
                    </label>
                    <textarea
                      rows={2}
                      value={profile.tagline}
                      onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Comprehensive Bio / Story
                    </label>
                    <textarea
                      rows={5}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Current Availability Status
                    </label>
                    <input
                      type="text"
                      value={profile.status}
                      onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Social Profiles */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-4">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Social &amp; Professional Links
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={profile.github}
                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={profile.linkedin}
                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        Twitter / X URL
                      </label>
                      <input
                        type="url"
                        value={profile.twitter || ''}
                        onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Unlimited Custom Fields */}
                <CustomFieldEditor
                  customFields={profile.customFields || []}
                  onChange={(fields) => setProfile({ ...profile, customFields: fields })}
                  title="Profile Custom Metadata (No limits)"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Profile &amp; Bio Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3.5: SKILLS & TECHNICAL CAPABILITIES CMS */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-in fade-in max-w-6xl">
              {/* Header with Title & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-500" />
                    <span>Skills &amp; Technical Capabilities CMS</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add, edit, categorize, and organize proficiencies, diagnostic skills, and domain tags.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => {
                      setCategoryToEdit(null);
                      setIsCategoryModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </button>

                  <button
                    onClick={() => {
                      setSkillToEdit(null);
                      setDefaultSkillCategoryId(skills?.categories?.[0]?.id || '');
                      setIsSkillModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Skill</span>
                  </button>
                </div>
              </div>

              {/* Skills Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Total Skills
                  </span>
                  <div className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                    {(skills?.categories || []).reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Categories
                  </span>
                  <div className="text-2xl font-display font-bold text-purple-600 dark:text-purple-400">
                    {(skills?.categories || []).length}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Core Strengths
                  </span>
                  <div className="text-2xl font-display font-bold text-sky-500">
                    {(skills?.categories || []).flatMap((c) => c.skills || []).filter((s) => s.level === 'Strong' || s.level === 'Expert').length}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Hands-On Experience
                  </span>
                  <div className="text-2xl font-display font-bold text-emerald-500">
                    {(skills?.categories || []).flatMap((c) => c.skills || []).filter((s) => s.level === 'Practical Experience' || s.level === 'Advanced' || s.level === 'Working Proficiency').length}
                  </div>
                </div>
              </div>

              {/* Search & Category Filter Chips */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills by name (e.g. Go, Docker), highlight, or domain tag..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                  {skillSearch && (
                    <button
                      onClick={() => setSkillSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 mr-1">Filter Category:</span>
                  <button
                    onClick={() => setSelectedSkillCategory('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                      selectedSkillCategory === 'all'
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Categories ({(skills?.categories || []).reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)})
                  </button>

                  {(skills?.categories || []).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedSkillCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                        selectedSkillCategory === cat.id
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-inherit font-mono">
                        {(cat.skills || []).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Groups & Skill Cards */}
              <div className="space-y-6">
                {(skills?.categories || [])
                  .filter((cat) => selectedSkillCategory === 'all' || cat.id === selectedSkillCategory)
                  .map((category) => {
                    const filteredCategorySkills = (category.skills || []).filter((skill) => {
                      if (!skillSearch.trim()) return true;
                      const query = skillSearch.toLowerCase();
                      return (
                        skill.name.toLowerCase().includes(query) ||
                        (skill.highlight || '').toLowerCase().includes(query) ||
                        (skill.tag || '').toLowerCase().includes(query) ||
                        category.name.toLowerCase().includes(query)
                      );
                    });

                    // If searching and this category has no matches, skip it
                    if (skillSearch.trim() && filteredCategorySkills.length === 0) {
                      return null;
                    }

                    return (
                      <div
                        key={category.id}
                        className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-4 shadow-sm"
                      >
                        {/* Category Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                                {category.name}
                              </h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {category.skills?.length || 0} skills
                              </span>
                            </div>
                            {category.description && (
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                {category.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setCategoryToEdit(category);
                                setIsCategoryModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-950/30 transition-colors"
                              title="Edit Category Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSkillToEdit(null);
                                setDefaultSkillCategoryId(category.id);
                                setIsSkillModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Skill Here</span>
                            </button>
                          </div>
                        </div>

                        {/* Skill Cards Grid */}
                        {filteredCategorySkills.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No skills in this category match your search.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {filteredCategorySkills.map((skill, sIdx) => (
                              <div
                                key={skill.name || sIdx}
                                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#070d1e]/70 flex flex-col justify-between space-y-3 hover:border-blue-500/40 transition-colors group"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <h5 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                                      {skill.name}
                                    </h5>
                                    <span
                                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getSkillBadgeClass(
                                        skill.level
                                      )}`}
                                    >
                                      {skill.level}
                                    </span>
                                  </div>

                                  {skill.tag && (
                                    <span className="inline-block text-[10px] font-mono text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded mb-2">
                                      #{skill.tag}
                                    </span>
                                  )}

                                  {skill.proficiency !== undefined && (
                                    <div className="space-y-1 my-2">
                                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                        <span>Proficiency</span>
                                        <span className="font-semibold text-blue-500">{skill.proficiency}%</span>
                                      </div>
                                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                                          style={{ width: `${Math.min(Math.max(skill.proficiency, 5), 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {skill.highlight && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-3">
                                      {skill.highlight}
                                    </p>
                                  )}

                                  {skill.customFields && skill.customFields.length > 0 && (
                                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                                      {skill.customFields.map((cf) => (
                                        <div key={cf.id} className="truncate">
                                          <strong>{cf.label}:</strong> {cf.value}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSkillToEdit({ skill, categoryId: category.id });
                                      setIsSkillModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                                    title="Edit Skill"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSkill(skill.name, category.id)}
                                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                    title="Delete Skill"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS CMS */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects by name, technology or category..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setProjectToEdit(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Project</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.slug}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] overflow-hidden flex flex-col justify-between shadow-sm hover:border-blue-500/50 transition-all"
                  >
                    <div>
                      <div className="h-44 bg-slate-200 dark:bg-slate-900 relative overflow-hidden">
                        {proj.imageUrl ? (
                          <img
                            src={proj.imageUrl}
                            alt={proj.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                            No Cover Image
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs">
                          {proj.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <h4 className="font-display font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                          {proj.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {proj.shortDescription || proj.tagline}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {(proj.technologies || []).slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400"
                            >
                              {tech}
                            </span>
                          ))}
                          {(proj.technologies || []).length > 4 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{(proj.technologies || []).length - 4}
                            </span>
                          )}
                        </div>

                        {proj.customFields && proj.customFields.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-0.5">
                            {proj.customFields.slice(0, 2).map((cf) => (
                              <div key={cf.id} className="truncate">
                                <strong className="text-slate-700 dark:text-slate-300">{cf.label}:</strong> {cf.value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                      <span className="text-[11px] font-mono text-slate-500">Year: {proj.year}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setProjectToEdit(proj);
                            setIsProjectModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                          title="Edit Project"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.slug)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-500"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EXPERIENCES CMS */}
          {activeTab === 'experience' && (
            <div className="space-y-6 animate-in fade-in max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Work &amp; Fellowship Experiences
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage leadership roles, mentorship programs, and engineering engagements.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setExperienceToEdit(null);
                    setIsExperienceModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                          {exp.role}
                        </h4>
                        <span className="text-xs font-semibold text-sky-500">{exp.organization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {exp.period}
                        </span>
                        <button
                          onClick={() => {
                            setExperienceToEdit(exp);
                            setIsExperienceModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">{exp.summary}</p>

                    <div className="space-y-1">
                      {(exp.highlights || []).map((h, i) => (
                        <div key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                          <span className="text-emerald-500">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {exp.customFields && exp.customFields.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex flex-wrap gap-3">
                        {exp.customFields.map((cf) => (
                          <div key={cf.id} className="bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800">
                            <strong>{cf.label}:</strong> {cf.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5.5: EVENTS & SUMMITS CMS */}
          {activeTab === 'events' && (
            <div className="space-y-6 animate-in fade-in max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Events Attended &amp; Key Technical Contributions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage summit appearances, hardware camps, and major state government innovation weeks.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEventToEdit(null);
                    setIsEventModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Event Contribution</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-400/20">
                          {evt.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{evt.date}</span>
                      </div>

                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                        {evt.title}
                      </h4>
                      <span className="text-xs text-sky-500 font-semibold block">{evt.role} &bull; {evt.organization}</span>
                      
                      {evt.impactMetric && (
                        <div className="mt-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs font-mono text-emerald-500 font-bold">
                          Impact: {evt.impactMetric}
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                        {evt.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEventToEdit(evt);
                          setIsEventModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: GALLERY CMS */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Photo &amp; Workshop Gallery
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload images from local computer or provide URLs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setGalleryToEdit(null);
                    setIsGalleryModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 bg-slate-200 dark:bg-slate-900 relative">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-white">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                        {item.location && (
                          <span className="text-[11px] text-slate-400 font-mono block">
                            📍 {item.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                      <span className="text-[10px] font-mono text-slate-400">{item.date}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setGalleryToEdit(item);
                            setIsGalleryModalOpen(true);
                          }}
                          className="p-1 rounded text-purple-400 hover:bg-purple-950/40"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGallery(item.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ACHIEVEMENTS CMS */}
          {activeTab === 'achievements' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Achievements &amp; Certifications
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certificates, awards, recognitions, and fellowships.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAchievementToEdit(null);
                    setIsAchievementModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Achievement</span>
                </button>
              </div>

              <div className="space-y-3">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                          {ach.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-500">
                          {ach.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {ach.issuer} &bull; {ach.year} &mdash; {ach.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setAchievementToEdit(ach);
                          setIsAchievementModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: MESSAGES & DIRECT EMAIL REPLY */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-in fade-in max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Messages &amp; Direct Email Center
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incoming inquiries trigger notifications to <span className="font-mono text-sky-400 font-semibold">timothyododo@gmail.com</span>. Reply directly to any email.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMessageFilter('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      messageFilter === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    All ({messages.length})
                  </button>
                  <button
                    onClick={() => setMessageFilter('unread')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      messageFilter === 'unread' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Unread ({unreadMessagesCount})
                  </button>
                  <button
                    onClick={() => setMessageFilter('replied')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      messageFilter === 'replied' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Replied
                  </button>
                </div>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-slate-400">
                  <Mail className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No messages found in this view.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-6 rounded-2xl border transition-all ${
                        !msg.isRead
                          ? 'border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/10 ring-1 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {msg.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {msg.name}
                              </span>
                              <a
                                href={`mailto:${msg.email}`}
                                className="text-xs text-sky-500 hover:underline font-mono"
                              >
                                &lt;{msg.email}&gt;
                              </a>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">{msg.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleMessageStar(msg.id)}
                            className={`p-1.5 rounded-lg text-slate-400 hover:text-amber-400 ${
                              msg.isStarred ? 'text-amber-400' : ''
                            }`}
                            title="Star message"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>

                          <button
                            onClick={() => handleToggleMessageRead(msg.id)}
                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                          </button>

                          <button
                            onClick={() => {
                              setMessageToReply(msg);
                              setIsReplyModalOpen(true);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Reply to Email</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 pl-0 sm:pl-13">
                        <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                          Subject: {msg.subject}
                        </h4>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                          {msg.message}
                        </div>

                        {/* Thread Replies History */}
                        {msg.replies && msg.replies.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] font-mono font-bold uppercase text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Replies Sent from Site ({msg.replies.length}):
                            </span>
                            {msg.replies.map((rep) => (
                              <div
                                key={rep.id}
                                className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1"
                              >
                                <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                                  <span>From: {rep.sentBy}</span>
                                  <span>{new Date(rep.date).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                  {rep.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: SETTINGS CMS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1633] space-y-5">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Site &amp; System Configuration
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Site Title
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteTitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Contact Receiver Email (Notification Target)
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, contactEmail: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                    />
                    <span className="text-[11px] text-slate-500">
                      All messages submitted on the contact form trigger notifications to this address.
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                        Allow Public Inquiries
                      </span>
                      <span className="text-xs text-slate-500">
                        Enable or disable contact form submissions
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteSettings.allowMessages}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, allowMessages: e.target.checked })
                      }
                      className="w-5 h-5 rounded accent-sky-600"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      saveStored('settings', siteSettings);
                      showToast('Settings saved successfully!');
                    }}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: GIT & AUTO-DEPLOY */}
          {activeTab === 'git-deploy' && (
            <GitDeployManager
              portfolioData={{
                profile,
                projects,
                experiences,
                skills,
                certifications,
                education,
                events,
                achievements,
                galleryItems,
                siteSettings,
                carouselConfig,
              }}
              showToast={showToast}
            />
          )}

        </main>
      </div>

      {/* CRUD MODALS */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        projectToEdit={projectToEdit}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        onSave={handleSaveProject}
      />

      <ExperienceModal
        isOpen={isExperienceModalOpen}
        experienceToEdit={experienceToEdit}
        onClose={() => {
          setIsExperienceModalOpen(false);
          setExperienceToEdit(null);
        }}
        onSave={handleSaveExperience}
      />

      <GalleryModal
        isOpen={isGalleryModalOpen}
        itemToEdit={galleryToEdit}
        onClose={() => {
          setIsGalleryModalOpen(false);
          setGalleryToEdit(null);
        }}
        onSave={handleSaveGallery}
      />

      <AchievementModal
        isOpen={isAchievementModalOpen}
        achievementToEdit={achievementToEdit}
        onClose={() => {
          setIsAchievementModalOpen(false);
          setAchievementToEdit(null);
        }}
        onSave={handleSaveAchievement}
      />

      <EventModal
        isOpen={isEventModalOpen}
        eventToEdit={eventToEdit}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        onSave={handleSaveEvent}
      />

      <SkillModal
        isOpen={isSkillModalOpen}
        skillToEdit={skillToEdit}
        categories={skills?.categories || []}
        defaultCategoryId={defaultSkillCategoryId}
        onClose={() => {
          setIsSkillModalOpen(false);
          setSkillToEdit(null);
        }}
        onSave={handleSaveSkill}
      />

      <SkillCategoryModal
        isOpen={isCategoryModalOpen}
        categoryToEdit={categoryToEdit}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSaveCategory}
      />

      <EmailReplyModal
        isOpen={isReplyModalOpen}
        message={messageToReply}
        onClose={() => {
          setIsReplyModalOpen(false);
          setMessageToReply(null);
        }}
        onSendReply={handleSendReply}
      />

    </div>
  );
};
