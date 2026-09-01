import React, { useState } from 'react';
import { Sun, Moon, Menu, X, Lock, Shield, User, ExternalLink } from 'lucide-react';
import { Profile } from '../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  profile: Profile;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onGoToAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPath, 
  onNavigate, 
  isDark, 
  onToggleTheme, 
  profile,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onGoToAdmin
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Skills', path: '/skills' },
    { label: 'Projects', path: '/projects' },
    { label: 'Experience', path: '/experience' },
    { label: 'Events', path: '/events' },
    { label: 'Certifications', path: '/certifications' },
    { label: 'Mentoring', path: '/mentoring' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#081028]/95 dark:bg-[#080e21]/95 text-white border-b border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand with Avatar Circle */}
        <button 
          onClick={() => handleNav('/')} 
          className="flex items-center gap-3 text-left group focus-visible:outline-sky-400 rounded-lg"
          aria-label="Timothy Ododo Homepage"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 border-2 border-sky-400/40 text-white font-mono font-bold text-base flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden">
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
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-sky-400 transition-colors leading-tight">
              {profile.name}
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
                  ? 'text-sky-400 bg-sky-950/60 border border-sky-800/40 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Admin Action Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={onGoToAdmin}
              className="ml-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all inline-flex items-center gap-1.5 border border-emerald-400/30"
              title="Open Portfolio Admin Dashboard"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="ml-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 transition-all inline-flex items-center gap-1.5 shadow-sm"
              title="Login to Portfolio Admin"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin Login</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="ml-2 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAdminLoggedIn ? (
            <button
              onClick={onGoToAdmin}
              className="p-1.5 rounded-lg bg-emerald-600/80 text-white text-xs font-medium flex items-center gap-1 px-2.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="p-1.5 rounded-lg bg-slate-800 text-sky-400 border border-slate-700 text-xs font-medium flex items-center gap-1 px-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border border-slate-800 text-slate-400"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-slate-800 text-slate-300"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#081028] px-4 pt-2 pb-6 space-y-1.5 shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentPath === item.path
                  ? 'text-sky-400 bg-sky-950/80 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800">
            {isAdminLoggedIn ? (
              <button
                onClick={() => { setMobileOpen(false); onGoToAdmin(); }}
                className="w-full py-2.5 rounded-lg text-center font-semibold bg-emerald-600 text-white text-sm flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Go to Admin Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); onOpenAdminLogin(); }}
                className="w-full py-2.5 rounded-lg text-center font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 text-sm flex items-center justify-center gap-2 border border-slate-700"
              >
                <Lock className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
