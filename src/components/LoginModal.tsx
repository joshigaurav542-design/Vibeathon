import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  Database, 
  ArrowRight, 
  Users,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { getAllUsers, loginUser, switchUser, SUPABASE_PUBLISHABLE_KEY } from '../services/databaseService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  triggerToast: (msg: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  triggerToast,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const users = getAllUsers();

  const handleSelectUser = async (user: UserProfile) => {
    setIsSubmitting(true);
    try {
      const switched = await switchUser(user.email);
      onUserChange(switched);
      triggerToast(`Switched account to ${switched.name}`);
      onClose();
    } catch (err: any) {
      triggerToast('Error switching user: ' + (err.message || 'unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      triggerToast('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const logged = await loginUser(email, name, role);
      onUserChange(logged);
      triggerToast(`Logged in as ${logged.name}`);
      setEmail('');
      setName('');
      setRole('');
      setIsRegisteringNew(false);
      onClose();
    } catch (err: any) {
      triggerToast('Login failed: ' + (err.message || 'unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Account & Persona Profile
              </h2>
              <p className="text-xs text-slate-500">
                Switch between saved accounts or sign in to isolate chat logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Strip */}
        <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Database Storage: Active</span>
          </div>
          <span className="font-mono text-[10px] text-blue-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
            Key: {SUPABASE_PUBLISHABLE_KEY.slice(0, 15)}...
          </span>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Quick User Switcher */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Available User Accounts (1-Click Switch)
            </label>

            <div className="grid grid-cols-1 gap-2">
              {users.map((u) => {
                const isCurrent = u.email.toLowerCase() === currentUser.email.toLowerCase();
                const initials = u.name
                  ? u.name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'TS';

                return (
                  <button
                    key={u.email}
                    onClick={() => handleSelectUser(u)}
                    disabled={isSubmitting}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isCurrent ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {initials}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {u.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-semibold">
                            {u.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 truncate">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {u.totalShifts} shifts
                      </span>
                      {isCurrent ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-600">
                          Switch
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Add New Account */}
          <div className="pt-2 border-t border-slate-100">
            {!isRegisteringNew ? (
              <button
                type="button"
                onClick={() => setIsRegisteringNew(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>+ Register New Account / Custom Profile</span>
              </button>
            ) : (
              <form onSubmit={handleCreateOrLogin} className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Register New User Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRegisteringNew(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-600">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. dev@techcorp.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-600">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Maya Patel"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-600">Role / Title</label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Staff Architect"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Save Profile & Switch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat logs & personas isolated per profile</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
