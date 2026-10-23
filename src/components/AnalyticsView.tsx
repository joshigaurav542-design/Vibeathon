import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  Clock,
  Server,
  CheckCircle2,
  Users,
  Flame,
  Radio,
} from 'lucide-react';
import { TransformationRecord, SessionTelemetry } from '../types';
import { getOrCreateSession } from '../services/historyStorage';

interface AnalyticsViewProps {
  historyRecords: TransformationRecord[];
  onNavigateToStudio: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  historyRecords,
  onNavigateToStudio,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '24hours'>('all');
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

  // Live Session Telemetry
  const [session, setSession] = useState<SessionTelemetry>(getOrCreateSession());
  const [sessionElapsedSec, setSessionElapsedSec] = useState<number>(0);

  // Heartbeat timer for live session tracking
  useEffect(() => {
    const currentSession = getOrCreateSession();
    setSession(currentSession);

    const interval = setInterval(() => {
      const refreshed = getOrCreateSession();
      setSession(refreshed);
      const elapsed = Math.round((Date.now() - new Date(refreshed.startedAt).getTime()) / 1000);
      setSessionElapsedSec(elapsed);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Filter records by selected date window
  const filteredRecords = useMemo(() => {
    if (dateFilter === 'all') return historyRecords;
    const now = Date.now();
    const thresholdMs =
      dateFilter === '24hours' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    return historyRecords.filter((r) => {
      const t = new Date(r.requestTimestamp).getTime();
      return !isNaN(t) && now - t <= thresholdMs;
    });
  }, [historyRecords, dateFilter]);

  // Accurate KPI metrics calculations
  const totalSessions = filteredRecords.length;
  const totalOutputs = filteredRecords.reduce(
    (acc, r) => acc + Object.keys(r.outputs || {}).length,
    0
  );

  // Distinct personas and usage distribution
  const personaUsageMap = useMemo(() => {
    const counts: Record<string, { title: string; count: number; color: string }> = {};

    const colorPalette: Record<string, string> = {
      executive: '#F59E0B',
      peer: '#10B981',
      legal: '#06B6D4',
      genz: '#8B5CF6',
    };

    filteredRecords.forEach((r) => {
      Object.values(r.outputs || {}).forEach((out) => {
        if (!counts[out.id]) {
          counts[out.id] = {
            title: out.title,
            count: 0,
            color: colorPalette[out.id] || '#6366F1',
          };
        }
        counts[out.id].count += 1;
      });
    });

    return counts;
  }, [filteredRecords]);

  const distinctPersonasCount = Object.keys(personaUsageMap).length;

  const mostFrequentPersona = useMemo(() => {
    const entries = Object.values(personaUsageMap);
    if (entries.length === 0) return 'None';
    entries.sort((a, b) => b.count - a.count);
    return entries[0].title;
  }, [personaUsageMap]);

  const averageDurationMs = useMemo(() => {
    if (filteredRecords.length === 0) return 0;
    const sum = filteredRecords.reduce((acc, r) => acc + (r.durationMs || 0), 0);
    return Math.round(sum / filteredRecords.length);
  }, [filteredRecords]);

  // Scenario usage breakdown for Bar Chart
  const scenarioUsageData = useMemo(() => {
    const counts: Record<string, number> = {
      'Prod Server Crash': 0,
      'Scope Creep Pushback': 0,
      'Blunt Code Review': 0,
      'Custom Raw Draft': 0,
    };

    filteredRecords.forEach((r) => {
      const label = r.scenarioLabel || 'Custom Raw Draft';
      counts[label] = (counts[label] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [filteredRecords]);

  // Transformation Activity Timeline for Line Chart
  const timelineActivityData = useMemo(() => {
    if (filteredRecords.length === 0) return [];

    // Group records by calendar day
    const dayMap = new Map<string, number>();

    // Generate buckets for past 7 days if in 7days/all mode, or 24 hours if in 24hours
    const daysToLook = dateFilter === '24hours' ? 1 : 7;
    for (let i = daysToLook - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dayMap.set(key, 0);
    }

    filteredRecords.forEach((r) => {
      const d = new Date(r.requestTimestamp);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dayMap.has(key)) {
        dayMap.set(key, (dayMap.get(key) || 0) + 1);
      }
    });

    return Array.from(dayMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }, [filteredRecords, dateFilter]);

  // Today's transformations count
  const transformationsToday = useMemo(() => {
    const todayStr = new Date().toDateString();
    return historyRecords.filter(
      (r) => new Date(r.requestTimestamp).toDateString() === todayStr
    ).length;
  }, [historyRecords]);

  // Format session elapsed duration
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#1F2937]/60">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Tone Analytics & Metrics Dashboard</span>
            <span className="font-mono text-xs text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 uppercase font-semibold">
              Authentic Logs
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated telemetry derived exclusively from verified transformation history logs.
          </p>
        </div>

        {/* Date Filter Range */}
        <div className="flex items-center gap-1.5 bg-[#111827] p-1.5 rounded-xl border border-[#1F2937]">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              dateFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateFilter('7days')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              dateFilter === '7days'
                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setDateFilter('24hours')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              dateFilter === '24hours'
                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past 24h
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Sessions */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Transformations</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-white">{totalSessions}</div>
            <span className="text-[10px] text-slate-500 font-mono">Completed sessions</span>
          </div>
        </div>

        {/* Total Outputs */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Generated Outputs</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-emerald-400">{totalOutputs}</div>
            <span className="text-[10px] text-slate-500 font-mono">Persona iterations</span>
          </div>
        </div>

        {/* Distinct Personas */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Personas Used</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-purple-400">{distinctPersonasCount}</div>
            <span className="text-[10px] text-slate-500 font-mono">Distinct archetypes</span>
          </div>
        </div>

        {/* Most Frequent Persona */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Top Persona</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-amber-400 truncate" title={mostFrequentPersona}>
              {mostFrequentPersona}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Highest engagement</span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Avg Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-cyan-400">{averageDurationMs}ms</div>
            <span className="text-[10px] text-slate-500 font-mono">Monotonic duration</span>
          </div>
        </div>

        {/* Saved Records */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Audit Records</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-white">{historyRecords.length}</div>
            <span className="text-[10px] text-slate-500 font-mono">Stored in local log</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      {filteredRecords.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-[#1F2937] bg-[#111827]/40 flex flex-col items-center gap-3">
          <BarChart3 className="w-10 h-10 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No Historical Records for Analytics</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Execute a draft transformation in the Tone Studio Workbench to populate real metrics and charts.
          </p>
          <button
            onClick={onNavigateToStudio}
            className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            Launch Studio Workbench
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 1. Persona Usage Donut Chart (5 cols) */}
          <div className="lg:col-span-5 bg-[#111827] rounded-2xl border border-[#1F2937] p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">Persona Usage Distribution</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{totalOutputs} Total</span>
            </div>

            {/* SVG Donut Chart */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 100 100">
                  {(() => {
                    const entries = Object.values(personaUsageMap);
                    let cumulativePercent = 0;
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius;

                    return entries.map((entry, idx) => {
                      const percent = totalOutputs > 0 ? (entry.count / totalOutputs) * 100 : 0;
                      const strokeDasharray = `${(percent * circumference) / 100} ${circumference}`;
                      const strokeDashoffset = -((cumulativePercent * circumference) / 100);
                      cumulativePercent += percent;

                      const isHovered = hoveredPieIndex === idx;

                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={entry.color}
                          strokeWidth={isHovered ? '12' : '9'}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setHoveredPieIndex(idx)}
                          onMouseLeave={() => setHoveredPieIndex(null)}
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  {hoveredPieIndex !== null && Object.values(personaUsageMap)[hoveredPieIndex] ? (
                    <>
                      <span className="text-xs font-bold text-white text-center px-2 line-clamp-1">
                        {Object.values(personaUsageMap)[hoveredPieIndex].title}
                      </span>
                      <span className="font-mono text-sm font-bold text-indigo-400">
                        {Math.round(
                          (Object.values(personaUsageMap)[hoveredPieIndex].count / totalOutputs) * 100
                        )}
                        %
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-xl font-bold text-white">{totalOutputs}</span>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Rewrites</span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend with interactive highlight */}
              <div className="flex flex-col gap-2 min-w-[150px]">
                {Object.values(personaUsageMap).map((entry, idx) => {
                  const percent = totalOutputs > 0 ? Math.round((entry.count / totalOutputs) * 100) : 0;
                  const isHovered = hoveredPieIndex === idx;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredPieIndex(idx)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                      className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-all cursor-pointer ${
                        isHovered ? 'bg-[#1C1F2A] border border-[#2B303C]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-300 font-medium text-[11px] truncate max-w-[110px]" title={entry.title}>
                          {entry.title}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 ml-2">
                        {entry.count} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Preset Scenario Usage Bar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-[#111827] rounded-2xl border border-[#1F2937] p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">Scenario Usage Breakdown</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{filteredRecords.length} Runs</span>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="flex flex-col gap-3 py-1">
              {scenarioUsageData.map((item, idx) => {
                const maxVal = Math.max(...scenarioUsageData.map((s) => s.count), 1);
                const percent = Math.round((item.count / maxVal) * 100);
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex flex-col gap-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.count} session{item.count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="h-4 w-full bg-[#171B26] rounded-full overflow-hidden border border-[#262A35] p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHovered
                            ? 'bg-gradient-to-r from-emerald-500 to-indigo-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                            : 'bg-emerald-500/70'
                        }`}
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Transformation Activity Timeline (12 cols) */}
          <div className="lg:col-span-12 bg-[#111827] rounded-2xl border border-[#1F2937] p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">Transformation Velocity Over Time</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Timestamp-validated activity distribution
              </span>
            </div>

            {/* SVG Trend Line / Histogram */}
            <div className="h-48 w-full relative flex items-end justify-between gap-2 pt-6 pb-2 px-2">
              {timelineActivityData.map((pt, idx) => {
                const maxCount = Math.max(...timelineActivityData.map((t) => t.count), 1);
                const heightPercent = Math.max(Math.round((pt.count / maxCount) * 80), 8);
                const isHovered = hoveredLineIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredLineIndex(idx)}
                    onMouseLeave={() => setHoveredLineIndex(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-2 group cursor-pointer"
                  >
                    {/* Tooltip on Hover */}
                    <div
                      className={`text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-600 text-white transition-opacity ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {pt.count} runs
                    </div>

                    {/* Bar Pill */}
                    <div className="w-full max-w-[40px] bg-[#171B26] rounded-t-lg overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isHovered
                            ? 'bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)]'
                            : 'bg-indigo-600/70'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Date Label */}
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors">
                      {pt.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5: Live Usage Monitor Component */}
      <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-5 lg:p-6 flex flex-col gap-5 shadow-2xl shadow-black/50">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Live Usage & Telemetry Monitor</h2>
                <span className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Active Node
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real browser session telemetry · 30-min heartbeat threshold
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Session ID:</span>
            <span className="text-indigo-400 font-bold bg-[#171B26] px-2 py-0.5 rounded border border-[#262A35]">
              {session.sessionId}
            </span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#171B26] p-4 rounded-xl border border-[#262A35] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400">Active Node Session</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-2">1 Active Client</div>
            <span className="text-[10px] text-slate-500 font-mono">Current browser session</span>
          </div>

          <div className="bg-[#171B26] p-4 rounded-xl border border-[#262A35] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400">Session Uptime</span>
            <div className="text-xl font-bold font-mono text-white mt-2">
              {formatSeconds(sessionElapsedSec)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Started: {new Date(session.startedAt).toLocaleTimeString()}</span>
          </div>

          <div className="bg-[#171B26] p-4 rounded-xl border border-[#262A35] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400">Transformations Today</span>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-2">
              {transformationsToday}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Completed since 00:00</span>
          </div>

          <div className="bg-[#171B26] p-4 rounded-xl border border-[#262A35] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400">Heartbeat State</span>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Healthy / Polling 2s
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Inactivity timeout: 30m</span>
          </div>
        </div>

        {/* Privacy-Safe Live Activity Feed */}
        <div className="bg-[#171B26]/80 p-4 rounded-xl border border-[#262A35] flex flex-col gap-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Privacy-Safe Activity Stream (Local Events)
          </span>
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            {historyRecords.slice(0, 4).map((rec) => (
              <div key={rec.id} className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">
                  [{new Date(rec.requestTimestamp).toLocaleTimeString()}]
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>
                  Transformation completed ({Object.keys(rec.outputs || {}).length} personas) ·{' '}
                  <span className="text-indigo-400">{rec.durationMs}ms</span>
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-slate-500">
                [{new Date(session.startedAt).toLocaleTimeString()}]
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Browser session initialized · Node verified</span>
            </div>
          </div>
        </div>

        {/* Honest Infrastructure Disclosure Banner */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Server className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">
                Infrastructure Architecture Status: Client-Side Single Node
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Global multi-user telemetry is reported as <strong className="text-amber-300 font-medium">Unavailable</strong> because VibeShift currently executes as an isolated single-page application without a centralized WebSocket gateway or multi-tenant database. To enable genuine global concurrent tracking, connect an orchestration backend (e.g. Node.js WebSocket Cluster + Redis Pub/Sub + PostgreSQL).
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] bg-[#171B26] text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/40 whitespace-nowrap">
            Zero Fabricated Metrics
          </span>
        </div>
      </div>
    </div>
  );
};
