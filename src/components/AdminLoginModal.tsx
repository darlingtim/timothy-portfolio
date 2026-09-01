import React, { useState } from 'react';
import { Lock, Shield, X, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('timothyododo@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#0c1633] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#070e24] p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Portfolio Admin Login</h2>
              <p className="text-xs text-slate-400">Access CMS &amp; Content Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <span>
              <strong>One-Click Sign In:</strong> Admin credentials for Timothy Ododo are pre-loaded for instant demo access.
            </span>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
              Password / Passkey
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </div>

        </form>

        <div className="bg-slate-50 dark:bg-slate-900/60 px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs text-slate-500 font-mono">
            Timothy Ododo • Portfolio Management System
          </span>
        </div>
      </div>
    </div>
  );
};
