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

  useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setIsEditing(false);
  }, [user, isOpen]);

  // Handle ESC key dismissal
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative p-6 bg-slate-50 border-b border-slate-100">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1 text-xs"
              title={isEditing ? 'Save Profile' : 'Edit Profile'}
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Save</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 text-slate-500" />
                  <span>Edit</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="flex flex-col min-w-0 flex-1 pr-14">
              {isEditing ? (
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Full Name"
                    className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Work Email"
                    className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="Job Role / Title"
                    className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 text-[11px] focus:outline-none focus:border-blue-600"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight truncate">{user.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-bold tracking-wider uppercase flex-shrink-0">
                      {user.plan}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 truncate">
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
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Performance & Telemetry
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Total Shifts
                </span>
                <span className="text-lg font-bold text-slate-900 mt-1">{user.totalShifts}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Fact Parity
                </span>
                <span className="text-lg font-bold text-emerald-600 mt-1">100%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Avg Latency
                </span>
                <span className="text-lg font-bold text-slate-900 mt-1">210ms</span>
              </div>
            </div>
          </div>

          {/* Engine & Integrations */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-800 font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Active Transformer Engine
              </span>
              <span className="text-blue-700 flex items-center gap-1 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Structured JSON schema with 4-way parallel persona output + local deterministic heuristic fallback.
            </p>
          </div>

          {/* Account Actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <button
                onClick={onExportHistory}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Export Chat History (.JSON)
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your chat history?')) {
                    onClearHistory();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Chats
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tone Studio • Multi-Persona Studio v2.4</span>
          <button
            onClick={() => {
              if (isEditing) handleSaveProfile();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
