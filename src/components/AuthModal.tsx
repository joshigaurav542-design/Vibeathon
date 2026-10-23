import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  History,
  Check
} from 'lucide-react';
import { UserProfile, UserLoginRecord } from '../types';
import { dbGetUserLogins } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [plan, setPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Pro');
  const [recentLogins, setRecentLogins] = useState<UserLoginRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      dbGetUserLogins().then((logs) => setRecentLogins(logs));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    const updatedUser: UserProfile = {
      ...currentUser,
      email: email.trim(),
      name: name.trim(),
      role: role.trim() || 'Principal AI Orchestrator',
      plan,
      lastLoginAt: Date.now(),
    };

    onLoginSuccess(updatedUser);
    onClose();
  };

  const handleQuickLogin = (demoName: string, demoEmail: string, demoRole: string, demoPlan: 'Free' | 'Pro' | 'Enterprise') => {
    const updatedUser: UserProfile = {
      ...currentUser,
      name: demoName,
      email: demoEmail,
      role: demoRole,
      plan: demoPlan,
      lastLoginAt: Date.now(),
    };
    onLoginSuccess(updatedUser);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Account & Login Audit</h2>
              <p className="text-[11px] text-slate-500">Synced to Supabase `user_profiles` & `user_logins`</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 text-xs">
          {/* Quick Demo Switcher */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Switch Account
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Gaurav Joshi', 'joshigaurav542@gmail.com', 'Principal AI Architect', 'Enterprise')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900 transition-all text-left flex flex-col gap-0.5"
              >
                <span className="font-bold text-slate-900">Gaurav Joshi</span>
                <span className="text-[11px] text-slate-500">Principal AI Architect • Enterprise</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Anubhav Chand', 'anubhavchand7@gmail.com', 'Staff Software Engineer', 'Pro')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900 transition-all text-left flex flex-col gap-0.5"
              >
                <span className="font-bold text-slate-900">Anubhav Chand</span>
                <span className="text-[11px] text-slate-500">Staff Software Engineer • Pro</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Or Sign In With Email
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Job Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Communications Director"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Subscription Tier</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Pro">Pro ($29/mo)</option>
                  <option value="Enterprise">Enterprise ($99/mo)</option>
                  <option value="Free">Free Tier</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              Sign In & Record Login to Supabase
            </button>
          </form>

          {/* Recent Logins Table */}
          {recentLogins.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3 h-3 text-blue-600" />
                Recent Supabase Login Records ({recentLogins.length})
              </span>
              <div className="max-h-32 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {recentLogins.map((rec) => (
                  <div key={rec.id} className="p-2.5 flex items-center justify-between text-[11px] bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-slate-800">{rec.email}</span>
                      <span className="text-slate-400">({rec.deviceInfo})</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
