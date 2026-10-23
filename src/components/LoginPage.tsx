import React, { useState } from 'react';
import { 
  Sparkles, 
  Database, 
  ArrowRight, 
  User, 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { UserProfile } from '../types';
import { getAllRegisteredUsers, authenticateUser, SUPABASE_PUBLISHABLE_KEY } from '../services/supabaseService';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onExploreAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onExploreAsGuest,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const registeredUsers = getAllRegisteredUsers();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const user = await authenticateUser(email, name, role);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (presetUser: UserProfile) => {
    setIsSubmitting(true);
    try {
      const user = await authenticateUser(presetUser.email, presetUser.name, presetUser.role);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 flex flex-col gap-6 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-1">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Tone Studio
            </h1>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">
              (Instant Persona and Communication Transformer)
            </p>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Sign in to access your saved chat logs, tailored personas, and tone analysis history.
          </p>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs">
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Supabase Cloud Database</span>
          </div>
          <span className="font-mono text-[10px] text-blue-600 font-semibold bg-white px-2 py-0.5 rounded-full border border-blue-200">
            {SUPABASE_PUBLISHABLE_KEY.slice(0, 15)}...
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. joshigaurav542@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Gaurav Joshi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Role / Team</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Product Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Tone Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick User Switcher Section */}
        {registeredUsers.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or quick select saved account:
            </span>
            <div className="flex flex-col gap-1.5">
              {registeredUsers.slice(0, 3).map((u) => {
                const initials = u.name
                  ? u.name
                      .split(/\s+/)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'TS';

                return (
                  <button
                    key={u.email}
                    onClick={() => handleQuickLogin(u)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity pr-1 flex items-center gap-1">
                      <span>Log in</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>4 Persona Rewrites</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Real Word Diff Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <span>100% Fact Preservation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Persistent Chat Logs</span>
          </div>
        </div>

        {onExploreAsGuest && (
          <div className="text-center pt-1">
            <button
              onClick={onExploreAsGuest}
              className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-4 transition-colors"
            >
              Continue as Guest (Preview Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
