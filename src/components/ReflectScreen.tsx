import React, { useState } from 'react';
import { Area, Session } from '../types';
import { motion } from 'motion/react';
import { Calendar, BarChart3, Clock, Flame, BookOpen, AlertCircle, Trash2 } from 'lucide-react';

interface ReflectScreenProps {
  uid: string;
  areas: Area[];
  sessions: Session[];
  onDeleteSession: (sessionId: string) => Promise<void>;
}

type ReflectTab = "daily" | "weekly";

export default function ReflectScreen({ uid, areas, sessions, onDeleteSession }: ReflectScreenProps) {
  const [activeSubTab, setActiveSubTab] = useState<ReflectTab>("daily");

  // Filter sessions for today (YYYY-MM-DD local format)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === todayStr);

  // Filter sessions for the past 7 days to calculate weekly progression
  const now = Date.now();
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const trailing7DaysSessions = sessions.filter(s => {
    const sTime = new Date(s.startTime).getTime();
    return (now - sTime) <= 7 * millisecondsInDay;
  });

  // Calculate active days in the past 7 days (including today)
  const activeDaysThisWeek = new Set(
    trailing7DaysSessions.map(s => s.date)
  ).size;

  // Aggregate weekly completed focus minutes by Area ID
  const getWeeklyMinutesByArea = (areaId: string) => {
    return trailing7DaysSessions
      .filter(s => s.areaId === areaId)
      .reduce((sum, s) => sum + s.duration, 0);
  };

  // Helper formatting for hours and minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  // Format hour label gracefully (e.g. 14:05 -> 2:05 PM)
  const formatTimeStr = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "00:00";
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (window.confirm("Permanently delete this logged session from your focus records? This change is atomic.")) {
      try {
        await onDeleteSession(id);
      } catch (err) {
        console.error(err);
        alert("Failed to delete records. Evaluate security rules.");
      }
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Page Header */}
      <div className="flex items-end justify-between py-2 border-b border-white/5">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-light text-slate-400/80 mb-1">GenFlow Analytics</h2>
          <h1 className="text-3xl font-extralight tracking-tight text-white leading-tight">
            GenFlow <span className="font-normal text-blue-400">Reflect</span>
          </h1>
        </div>
      </div>

      {/* Subtab Navigation (Artistic Capsule Tab Layout) */}
      <div className="p-1 h-11 rounded-full bg-white/5 border border-white/10 flex gap-1 items-center">
        <button
          onClick={() => setActiveSubTab("daily")}
          className={`flex-1 h-full rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === "daily" 
              ? 'bg-white/15 border border-white/10 text-white shadow-[0_2px_12px_rgba(59,130,246,0.15)] font-semibold' 
              : 'text-slate-400 hover:text-slate-250 hover:bg-white/3'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Daily Timeline
        </button>
        <button
          onClick={() => setActiveSubTab("weekly")}
          className={`flex-1 h-full rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === "weekly" 
              ? 'bg-white/15 border border-white/10 text-white shadow-[0_2px_12px_rgba(59,130,246,0.15)] font-semibold' 
              : 'text-slate-400 hover:text-slate-250 hover:bg-white/3'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Weekly Breakdown
        </button>
      </div>

      <div className="relative">
        {activeSubTab === "daily" ? (
          /* DAILY TIMELINE MODULE */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">Today's Focus Log</h2>
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400/60">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>

            {todaySessions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 bg-white/2 rounded-3xl">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-light">No sessions recorded yet today.</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">Complete a focused timer to begin reflections.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l border-white/10 space-y-6">
                {todaySessions.map((session, index) => (
                  <div key={session.id || index} className="relative">
                    {/* Floating Vertical Node Dot indicator with themed dropshadow pulse */}
                    <div 
                      className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border border-[#0f1e35] flex items-center justify-center shadow-md transition-all duration-300"
                      style={{ 
                        backgroundColor: session.areaColor,
                        boxShadow: `0 0 10px ${session.areaColor}80`
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0f1e35]" />
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 space-y-2.5 relative group hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{session.areaEmoji}</span>
                          <div>
                            <h4 className="text-xs font-light tracking-wide text-slate-100">{session.areaName}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {formatTimeStr(session.startTime)} - {formatTimeStr(session.endTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-light px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-300">
                            {formatTime(session.duration)}
                          </span>
                          <button
                            onClick={() => handleDeleteSession(session.id || "")}
                            className="p-1 rounded-full text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {session.note && (
                        <div className="text-xs text-slate-300 bg-white/3 p-3 rounded-xl border border-white/5 italic">
                          "{session.note}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* WEEKLY PROGRESSION BREAKDOWN */
          <div className="space-y-6">
            {/* Streak & Consistency Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex flex-col justify-between group hover:bg-white/10 transition-all duration-300">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-light block mb-1">Consistency</span>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400 fill-orange-500/20 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                    <span className="text-2xl font-light font-mono text-white">{activeDaysThisWeek}</span>
                    <span className="text-xs text-slate-400 font-sans">/ 7 days</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mt-2">focused days in trailing week</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex flex-col justify-between group hover:bg-white/10 transition-all duration-300">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-light block mb-1">Weekly Sum</span>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                    <span className="text-2xl font-light font-mono text-white">
                      {formatTime(trailing7DaysSessions.reduce((sum, s) => sum + s.duration, 0))}
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mt-2">total focus commitment logged</p>
              </div>
            </div>

            {/* In-depth bars mapping completed minutes to Area goals */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400 mb-1">Area Progression vs Weekly Goals</h3>
              
              {areas.length === 0 ? (
                <div className="text-center py-8 bg-white/2 rounded-3xl border border-dashed border-white/10">
                  <p className="text-xs text-slate-400">Initialize Areas under categories to generate charts.</p>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {areas.map((area) => {
                    const completedMin = getWeeklyMinutesByArea(area.id || "");
                    const targetMin = area.weeklyGoal;
                    const percent = targetMin > 0 ? (completedMin / targetMin) : 0;
                    const displayPercent = Math.min(100, Math.round(percent * 100));

                    return (
                      <div key={area.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 space-y-2.5 hover:bg-white/10 transition-all duration-300 hover:border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{area.emoji}</span>
                            <span className="text-xs font-light text-white tracking-wide">{area.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold" style={{ color: area.color }}>
                            {formatTime(completedMin)} / {formatTime(targetMin)}
                          </span>
                        </div>

                        {/* Custom visual progress bar with colored glowing tracking highlights */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${displayPercent}%`, 
                              backgroundColor: area.color,
                              boxShadow: `0 0 10px ${area.color}40`,
                              filter: `drop-shadow(0 0 4px ${area.color}80)`
                            }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none mt-1 opacity-60">
                          <span>Progress Rate</span>
                          <span className="font-semibold text-white">{displayPercent}% Completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
