import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Clock,
  Download, 
  Trash2,
  CheckCircle2,
  Edit2,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onExportHistory: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onClearHistory,
  onExportHistory,
  onUpdateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editRole, setEditRole] = useState(user.role);

  // Sync edits when user changes
  useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setIsEditing(false);
  }, [user, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'VS';

  const handleSaveProfile = () => {
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name: editName.trim() || user.name,
        email: editEmail.trim() || user.email,
        role: editRole.trim() || user.role,
      });
    }
    setIsEditing(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#0F1422] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative p-6 bg-gradient-to-r from-indigo-950/40 via-[#131B2E] to-purple-950/30 border-b border-[#1F2937]/80">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              title={isEditing ? 'Save Profile' : 'Edit Profile'}
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Save</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0F1422]" />
            </div>

            <div className="flex flex-col min-w-0 flex-1 pr-14">
              {isEditing ? (
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Full Name"
                    className="px-2 py-1 rounded bg-[#0B0F19] border border-[#262A35] text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Work Email"
                    className="px-2 py-1 rounded bg-[#0B0F19] border border-[#262A35] text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="Job Role / Title"
                    className="px-2 py-1 rounded bg-[#0B0F19] border border-[#262A35] text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight truncate">{user.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-semibold tracking-wider uppercase flex-shrink-0">
                      {user.plan}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                    <span>{user.role}</span>
                    <span>•</span>
                    <span>Member since {user.joinedDate}</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="p-6 flex flex-col gap-5">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Performance & Telemetry
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#141A29] border border-[#1F2937] flex flex-col">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Total Shifts
                </span>
                <span className="text-lg font-bold text-white mt-1">{user.totalShifts}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#141A29] border border-[#1F2937] flex flex-col">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Fact Parity
                </span>
                <span className="text-lg font-bold text-emerald-400 mt-1">100%</span>
              </div>

              <div className="p-3 rounded-xl bg-[#141A29] border border-[#1F2937] flex flex-col">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Avg Latency
                </span>
                <span className="text-lg font-bold text-white mt-1">210ms</span>
              </div>
            </div>
          </div>

          {/* Engine & Integrations */}
          <div className="p-3.5 rounded-xl bg-[#141A29] border border-[#1F2937] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                Active Transformer Engine
              </span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Structured JSON schema with 4-way parallel persona output + local deterministic heuristic fallback.
            </p>
          </div>

          {/* Account Actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1F2937]">
            <div className="flex items-center justify-between">
              <button
                onClick={onExportHistory}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171E30] hover:bg-[#1E273E] border border-[#242F4A] text-xs font-medium text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                Export Chat History (.JSON)
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your chat history?')) {
                    onClearHistory();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Chats
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0B0F19] border-t border-[#1F2937] flex items-center justify-between text-[11px] text-slate-500">
          <span>VibeShift AI • Multi-Persona Studio v2.4</span>
          <button
            onClick={() => {
              if (isEditing) handleSaveProfile();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
