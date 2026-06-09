import React from 'react';
import { UserProfile, Area, Session } from '../types';
import { motion } from 'motion/react';
import { Play, TrendingUp, Sparkles, Smile, ArrowRight, Hourglass, Flame, Plus } from 'lucide-react';

interface HomeScreenProps {
  userProfile: UserProfile;
  areas: Area[];
  sessions: Session[];
  onStartSession: (area: Area) => void;
  onNavigate: (tab: "home" | "session" | "areas" | "reflect") => void;
}

export default function HomeScreen({ userProfile, areas, sessions, onStartSession, onNavigate }: HomeScreenProps) {
  // Get today's local date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate today's total focus stats
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  // Helper to format minutes gracefully
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  // Determine current time greeting segment
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  // Calculate progress percent per Area for the current week
  // Sunday to Saturday or trailing 7 days. Standard trailing 7 days (or weekly goals reset) is fine. Let's do trailing 7 days for simpler client-side aggregation!
  const getWeeklyCompletedMinutesForArea = (areaId: string) => {
    const now = Date.now();
    const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000;
    const oneWeekAgo = new Date(now - millisecondsInWeek);

    return sessions
      .filter(s => s.areaId === areaId && new Date(s.startTime) >= oneWeekAgo)
      .reduce((sum, s) => sum + s.duration, 0);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Dynamic Header Greeting matching Artistic Typography */}
      <div className="flex items-end justify-between py-2 border-b border-white/5">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-light text-slate-400/80 mb-1">GenFlow by Genify</h2>
          <h1 className="text-3xl font-extralight tracking-tight text-white leading-tight">
            {getGreeting()}, <span className="font-normal text-blue-400">{userProfile.name}</span>
          </h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-light text-blue-500 font-mono drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            {formatTime(todayMinutes)}
          </div>
          <div className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">
            Focused Today • {todaySessions.length} {todaySessions.length === 1 ? 'Session' : 'Sessions'}
          </div>
        </div>
      </div>

      {/* Daily Total Summaries styled with high fidelity frosted designs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today's Focus Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:bg-white/10 transition-all duration-300">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-all duration-500" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-light">Today's Flow</span>
            <Hourglass className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-2xl font-light font-mono text-white mt-1 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
              {formatTime(todayMinutes)}
            </h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.1em] mt-0.5">completed today</p>
          </div>
        </div>

        {/* Sessions Completed Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:bg-white/10 transition-all duration-300">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-all duration-500" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-light">Completed</span>
            <Flame className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-2xl font-light font-mono text-white mt-1 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">
              {todaySessions.length}
            </h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.1em] mt-0.5">focused sessions</p>
          </div>
        </div>
      </div>

      {/* Weekly Motivation Banner Styled like premium capsule block */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 relative overflow-hidden flex items-center justify-between border border-white/10 group hover:border-white/20 transition-all duration-300">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <TrendingUp className="w-4 h-4 text-blue-400 drop-shadow-[0_0_4px_rgba(37,99,235,0.4)]" />
          </div>
          <div>
            <h4 className="text-[11px] font-semibold text-white uppercase tracking-[0.15em]">Weekly Progression Goal</h4>
            <p className="text-[10px] text-slate-400 font-light mt-0.5">Reflections show area comparisons</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate("reflect")}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5 bg-white/5"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Focus Areas List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Focus Areas</h2>
          <button 
            onClick={() => onNavigate("areas")}
            className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Manage Areas
          </button>
        </div>

        {areas.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 bg-white/2">
            <p className="text-sm text-slate-400">No areas found. Let's register one!</p>
            <button
              onClick={() => onNavigate("areas")}
              className="mt-3.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-all"
            >
              Add First Area
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {areas.map((area) => {
              const weeklyCompleted = getWeeklyCompletedMinutesForArea(area.id || "");
              const percent = area.weeklyGoal > 0 ? (weeklyCompleted / area.weeklyGoal) : 0;
              const roundedPercent = Math.min(100, Math.round(percent * 100));

              // SVG Circle Dimensions
              const radius = 24;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (Math.min(percent, 1) * circumference);

              return (
                <div 
                  key={area.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all duration-300 border border-white/5 relative"
                >
                  <div className="flex items-center gap-4">
                    {/* Progress Circle Ring resembling Artistic design with glowing drop-shadow */}
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        {/* Background track */}
                        <circle 
                          cx="28" 
                          cy="28" 
                          r={radius} 
                          fill="transparent" 
                          stroke="rgba(255,255,255,0.04)" 
                          strokeWidth="3" 
                        />
                        {/* Highlight progress fill */}
                        <circle 
                          cx="28" 
                          cy="28" 
                          r={radius} 
                          fill="transparent" 
                          stroke={area.color || "#2563eb"} 
                          strokeWidth="3.5" 
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                          style={{
                            filter: `drop-shadow(0 0 5px ${area.color || "#2563eb"}AA)`
                          }}
                        />
                      </svg>
                      {/* Emoji Icon inside circle */}
                      <span className="absolute text-lg">{area.emoji}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-light text-white group-hover:text-blue-400 transition-colors tracking-wide">
                        {area.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 opacity-60 uppercase tracking-tighter">
                        Weekly: {formatTime(weeklyCompleted)} / {formatTime(area.weeklyGoal)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span 
                      className="text-xs font-mono font-light drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                      style={{ color: area.color }}
                    >
                      {roundedPercent}%
                    </span>
                    <button
                      onClick={() => onStartSession(area)}
                      className="w-9 h-9 rounded-full bg-[#2563eb] hover:bg-blue-500 text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.35)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.55)] group-hover:scale-105 active:scale-[0.95]"
                      title="Quick Start Intention"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button with Glowing Drop Shadow */}
      {areas.length > 0 && (
        <div className="fixed bottom-24 right-6 z-20">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartSession(areas[0])}
            className="w-14 h-14 rounded-full bg-[#2563eb] hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,99,235,0.45)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.65)] cursor-pointer border border-blue-400/20 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
