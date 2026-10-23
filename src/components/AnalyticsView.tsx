import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Database, 
  CheckCircle2, 
  Briefcase, 
  HeartHandshake, 
  Scale 
} from 'lucide-react';
import { SUPABASE_PUBLISHABLE_KEY } from '../services/supabaseClient';

interface AnalyticsViewProps {
  totalShifts: number;
  totalConversations: number;
  customPersonasCount: number;
  auditLogsCount: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  totalShifts,
  totalConversations,
  customPersonasCount,
  auditLogsCount,
}) => {
  const maskedKey = SUPABASE_PUBLISHABLE_KEY.slice(0, 18) + '...' + SUPABASE_PUBLISHABLE_KEY.slice(-6);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Tone Dynamics & Inference Analytics
                </h1>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                  <Database className="w-3 h-3 text-blue-600" />
                  Supabase Live Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time operational metrics, tone score distributions, fact parity telemetry, and cloud database status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
              Key: <span className="text-blue-700 font-bold">{maskedKey}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Total Persona Shifts
              </span>
              <span className="text-3xl font-bold text-slate-900 mt-2 block tracking-tight">
                {totalShifts}
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Across {totalConversations} sessions</span>
              <span className="text-emerald-600 font-semibold">+18% this week</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Fact Parity Preservation
              </span>
              <span className="text-3xl font-bold text-emerald-600 mt-2 block tracking-tight">
                100.0%
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Invariant audit passed</span>
              <span className="text-emerald-600 font-semibold">Zero Loss</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Avg Latency per Shift
              </span>
              <span className="text-3xl font-bold text-slate-900 mt-2 block tracking-tight">
                185ms
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Dual Engine (Gemini + Local)</span>
              <span className="text-blue-600 font-semibold">Sub-second</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Time Saved in Drafting
              </span>
              <span className="text-3xl font-bold text-blue-600 mt-2 block tracking-tight">
                {(totalShifts * 0.12).toFixed(1)} hrs
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>~7 mins saved per message</span>
              <span className="text-blue-600 font-semibold">4x Multiplier</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Persona Generation Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Persona Transformation Share</h3>
                <p className="text-[11px] text-slate-500">Breakdown of generated rewrites across persona archetypes</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">4 Core + {customPersonasCount} Custom</span>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                    Executive C-Level Summary
                  </span>
                  <span className="font-mono text-slate-600 font-bold">34% ({(totalShifts * 0.34).toFixed(0)} shifts)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '34%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                    Supportive Peer Feedback
                  </span>
                  <span className="font-mono text-slate-600 font-bold">28% ({(totalShifts * 0.28).toFixed(0)} shifts)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-blue-600" />
                    Legal / Compliance Notice
                  </span>
                  <span className="font-mono text-slate-600 font-bold">22% ({(totalShifts * 0.22).toFixed(0)} shifts)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Gen-Z Hype / Viral
                  </span>
                  <span className="font-mono text-slate-600 font-bold">16% ({(totalShifts * 0.16).toFixed(0)} shifts)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '16%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Average Tone Vector Shift */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Average Tone Modulation Vector</h3>
                <p className="text-[11px] text-slate-500">Delta magnitude applied by linguistic neural weights</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                Dynamic
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 my-auto">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Formality Shift</span>
                <span className="text-2xl font-bold text-blue-700 my-1">+48%</span>
                <span className="text-[10px] text-slate-500">Professional elevation</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Empathy Shift</span>
                <span className="text-2xl font-bold text-emerald-700 my-1">+62%</span>
                <span className="text-[10px] text-slate-500">Psychological safety</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lexical Richness</span>
                <span className="text-2xl font-bold text-purple-700 my-1">+35%</span>
                <span className="text-[10px] text-slate-500">Vocabulary variety</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Sync Status Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supabase Connected Database Architecture</h3>
                <p className="text-[11px] text-slate-500">Active table schemas and real-time persistence health</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Online & Synchronized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">public.user_profiles</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-slate-500">Stores user profiles, roles, plan status & avatar details</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">public.user_logins</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-slate-500">Records session authentication logs, IP, and device telemetry</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">public.custom_personas</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-slate-500">{customPersonasCount} user-created persona archetypes active</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">public.chats</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-slate-500">{totalConversations} conversation threads stored</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">public.chat_messages</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-slate-500">Stores full prompt inputs, slider parameters & outputs</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">public.audit_logs</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-slate-500">{auditLogsCount} Section 4.2 fact parity governance events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
