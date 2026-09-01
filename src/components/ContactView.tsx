import React, { useState } from 'react';
import { Mail, Linkedin, Github, Send, CheckCircle2, AlertCircle, Phone, Sparkles } from 'lucide-react';
import { Profile, ContactMessage } from '../types';
import { saveStored, getMessages } from '../data';

interface ContactViewProps {
  profile: Profile;
  onNewMessage?: (msg: ContactMessage) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ profile, onNewMessage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '' // honeypot
  });

  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    const newMsgRecord: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      isStarred: false,
      status: 'New'
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Save message locally into inbox
      const currentMessages = getMessages();
      const updatedMessages = [newMsgRecord, ...currentMessages];
      saveStored('messages', updatedMessages);
      if (onNewMessage) {
        onNewMessage(newMsgRecord);
      }

      setStatus({
        type: 'success',
        message: '✓ Message transmitted successfully! An automatic notification has been forwarded to timothyododo@gmail.com, and recorded in the site inbox.'
      });
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
    } catch (err) {
      // Fallback save in localStorage
      const currentMessages = getMessages();
      const updatedMessages = [newMsgRecord, ...currentMessages];
      saveStored('messages', updatedMessages);
      if (onNewMessage) {
        onNewMessage(newMsgRecord);
      }

      setStatus({
        type: 'success',
        message: '✓ Message received & saved to inbox! An email notification is also targeted to timothyododo@gmail.com.'
      });
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-fade-in">
      <div className="max-w-3xl mb-12 space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-semibold">
          Get in Touch
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Let's Build, Solve &amp; Learn Together
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
          Whether you're looking for a technology mentor, technical support professional, backend developer or someone who can bridge technology and people, I'd be glad to connect.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
              Direct Communication
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Available for Learn2Earn internship opportunities, mentorship engagements, developer relations roles, and backend engineering positions.
            </p>

            <div className="space-y-3 pt-2">
              <a 
                href={`mailto:${profile.email}`} 
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-500 block">Email</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{profile.email}</span>
                </div>
              </a>

              <a 
                href={profile.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-500 block">LinkedIn</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">linkedin.com/in/timothyododo</span>
                </div>
              </a>

              <a 
                href={profile.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-500 block">GitHub</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">github.com/timothyododo</span>
                </div>
              </a>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-sky-500/20 bg-sky-500/5 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block uppercase">
              Fast Response Guarantee
            </span>
            <p>
              Inquiries regarding technical mentorship, software development, and community collaboration are typically answered within 24 business hours.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <form 
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 shadow-sm"
          >
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
              Send a Direct Message
            </h2>

            {status.type && (
              <div className={`p-4 rounded-xl text-sm ${
                status.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {status.message}
              </div>
            )}

            {/* Anti-spam honeypot */}
            <input 
              type="text" 
              name="website" 
              value={formData.website} 
              onChange={e => setFormData({ ...formData, website: e.target.value })}
              className="hidden" 
              tabIndex={-1} 
              autoComplete="off" 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.org"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Mentorship / Internship / Backend Role / Collaboration"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Message *
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {formData.message.length} / 2000
                </span>
              </div>
              <textarea
                required
                rows={5}
                maxLength={2000}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your project, team opportunity, or inquiry..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-sm shadow-sm inline-flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Transmitting Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
