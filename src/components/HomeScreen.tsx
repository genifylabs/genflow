import React, { useState, useEffect } from 'react';
import { UserProfile, Area, Session } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PRESETS, UIPreset } from '../themePresets';
import { 
  Play, TrendingUp, Hourglass, Flame, Settings, X, 
  Bell, LogOut, ShieldCheck, Check, Smile, Sun, Moon, Sliders, Sparkles 
} from 'lucide-react';

interface HomeScreenProps {
  userProfile: UserProfile;
  areas: Area[];
  sessions: Session[];
  onStartSession: (area: Area) => void;
  onNavigate: (tab: "home" | "session" | "areas" | "reflect") => void;
  onUpdateProfile: (name: string, notificationsEnabled: boolean) => Promise<void>;
  onToggleTheme: () => void;
  onLogout: () => void;
  activePreset?: UIPreset;
  onSelectPreset?: (preset: UIPreset) => void;
}

export default function HomeScreen({ 
  userProfile, 
  areas, 
  sessions, 
  onStartSession, 
  onNavigate,
  onUpdateProfile,
  onToggleTheme,
  onLogout,
  activePreset = "glass",
  onSelectPreset
}: HomeScreenProps) {
  const styles = PRESETS[activePreset];

  // Get today's local date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate today's total focus stats
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  // Settings screen states
  const [showSettings, setShowSettings] = useState(false);
  const [editableName, setEditableName] = useState(userProfile.name);
  const [notifications, setNotifications] = useState(!!userProfile.notificationsEnabled);
  const [savingSettings, setSavingSettings] = useState(false);

  // Sync internal states with prop updates
  useEffect(() => {
    setEditableName(userProfile.name);
    setNotifications(!!userProfile.notificationsEnabled);
  }, [userProfile]);

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

  // Calculate progress percent per Area for the current week (trailing 7 days)
  const getWeeklyCompletedMinutesForArea = (areaId: string) => {
    const now = Date.now();
    const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000;
    const oneWeekAgo = new Date(now - millisecondsInWeek);

    return sessions
      .filter(s => s.areaId === areaId && new Date(s.startTime) >= oneWeekAgo)
      .reduce((sum, s) => sum + s.duration, 0);
  };

  // Handle push notification toggle permission grant
  const handleToggleNotifications = async () => {
    const nextVal = !notifications;
    if (nextVal) {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotifications(true);
        } else {
          alert('Notification permission was denied. Please adjust your browser settings to opt-in.');
          setNotifications(false);
        }
      } else {
        alert('Web Notifications API is unsupported on this device.');
        setNotifications(false);
      }
    } else {
      setNotifications(false);
    }
  };

  // Apply profile alterations to database
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableName.trim()) return;

    setSavingSettings(true);
    try {
      await onUpdateProfile(editableName.trim(), notifications);
      setShowSettings(false);
    } catch (e) {
      console.error(e);
      alert('Error updating user configuration profile.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Total weekly aggregations across all tracking areas
  const totalCompletedMinutesWeek = areas.reduce((sum, a) => sum + getWeeklyCompletedMinutesForArea(a.id || ""), 0);
  const totalWeeklyGoalMinutes = areas.reduce((sum, a) => sum + a.weeklyGoal, 0);
  const overallWeeklyProgressPercent = totalWeeklyGoalMinutes > 0 
    ? Math.min(100, Math.round((totalCompletedMinutesWeek / totalWeeklyGoalMinutes) * 100)) 
    : 0;

  return (
    <div className="space-y-5 pb-16 text-left">
      {/* Dynamic Header Greeting matching Artistic Typography */}
      <div className={`flex items-start justify-between py-2 border-b ${
        activePreset === 'zen' ? 'border-stone-200' : 'border-white/5'
      }`}>
        <div>
          <span className={`text-[9px] uppercase tracking-[0.25em] font-mono leading-none ${styles.textSecondary}`}>
            {getGreeting()}
          </span>
          <h1 className={`text-2xl font-light tracking-tight mt-1 leading-none ${styles.textPrimary}`}>
            Welcome, <span className={`font-semibold ${styles.accentText}`}>{userProfile.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
              activePreset === 'zen' 
                ? 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Open application settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Daily Total Summaries */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Focus Card */}
        <div className={`${styles.card} p-3.5 flex flex-col justify-between relative overflow-hidden group`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[9px] uppercase tracking-[0.12em] font-medium opacity-75 ${styles.textSecondary}`}>Today's Flow</span>
            <Hourglass className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          </div>
          <div>
            <h3 className={`text-xl font-bold font-mono tracking-tight ${styles.textPrimary}`}>
              {formatTime(todayMinutes)}
            </h3>
            <p className="text-[8px] opacity-50 uppercase tracking-[0.08em] mt-0.5 font-mono">Completed Today</p>
          </div>
        </div>

        {/* Sessions Completed Card */}
        <div className={`${styles.card} p-3.5 flex flex-col justify-between relative overflow-hidden group`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[9px] uppercase tracking-[0.12em] font-medium opacity-75 ${styles.textSecondary}`}>Runs Completed</span>
            <Flame className="w-3.5 h-3.5 text-pink-500" />
          </div>
          <div>
            <h3 className={`text-xl font-bold font-mono tracking-tight ${styles.textPrimary}`}>
              {todaySessions.length}
            </h3>
            <p className="text-[8px] opacity-50 uppercase tracking-[0.08em] mt-0.5 font-mono">Sessions today</p>
          </div>
        </div>
      </div>

      {/* Weekly Motivation Banner */}
      {areas.length > 0 && (
        <div className={`${styles.card} p-4 relative overflow-hidden group`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className={`text-[9px] uppercase tracking-[0.12em] font-mono opacity-80 ${styles.textSecondary}`}>Weekly Target Progression</span>
              <h3 className={`text-sm font-semibold tracking-wide mt-0.5 ${styles.textPrimary}`}>
                {formatTime(totalCompletedMinutesWeek)} of <span className={`${styles.accentText}`}>{formatTime(totalWeeklyGoalMinutes)}</span>
              </h3>
            </div>
            <button 
              onClick={() => onNavigate("reflect")}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                activePreset === 'zen' ? 'bg-stone-50 border-stone-200 text-[#854d0e] hover:bg-stone-100' : 'bg-white/5 border-white/10 text-blue-400 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
            </button>
          </div>

          {/* Progress bar visual */}
          <div className="space-y-1 mt-1">
            <div className={`h-1.5 w-full rounded-full overflow-hidden ${
              activePreset === 'zen' ? 'bg-stone-200' : 'bg-black/35'
            }`}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  activePreset === 'zen' ? 'bg-stone-900' : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                }`}
                style={{ width: `${overallWeeklyProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[8px] font-mono opacity-60 uppercase tracking-widest leading-none pt-0.5">
              <span>Goal Rate</span>
              <span>{overallWeeklyProgressPercent}% Reach</span>
            </div>
          </div>
        </div>
      )}

      {/* Focus Areas List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${styles.textSecondary}`}>Aesthetic Focus Areas</h2>
          <button 
            onClick={() => onNavigate("areas")}
            className={`text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer ${styles.accentText}`}
          >
            Manage Areas &rarr;
          </button>
        </div>

        {areas.length === 0 ? (
          <div className={`text-center py-8 rounded-2xl border border-dashed ${
            activePreset === 'zen' ? 'border-stone-200 bg-stone-50' : 'border-white/10 bg-white/2'
          }`}>
            <p className={`text-xs ${styles.textSecondary}`}>No active focus areas found.</p>
            <button
              onClick={() => onNavigate("areas")}
              className={`mt-2.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${styles.buttonPrimary}`}
            >
              Add Focus Subject
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {areas.map((area) => {
              const weeklyCompleted = getWeeklyCompletedMinutesForArea(area.id || "");
              const percent = area.weeklyGoal > 0 ? (weeklyCompleted / area.weeklyGoal) : 0;
              const roundedPercent = Math.min(100, Math.round(percent * 100));

              // SVG Circle properties
              const radius = 13;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (Math.min(percent, 1) * circumference);

              return (
                <div 
                  key={area.id}
                  className={`p-3 flex items-center justify-between group transition-all duration-350 relative ${styles.card}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Compact badge */}
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-xs ${
                        activePreset === 'zen' ? 'bg-stone-50 border border-stone-200' : 'bg-white/5 border border-white/10'
                      }`}
                      style={{ borderLeftColor: area.color, borderLeftWidth: '3.5px' }}
                    >
                      {area.emoji}
                    </div>

                    <div className="text-left">
                      <h4 className={`text-xs font-semibold uppercase tracking-wider truncate max-w-[130px] ${styles.textPrimary}`}>
                        {area.name}
                      </h4>
                      <p className="text-[8px] text-slate-450 font-mono mt-0.5 leading-none opacity-80 uppercase">
                        {formatTime(weeklyCompleted)} / {formatTime(area.weeklyGoal)} Weekly
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Beautiful progress ring */}
                    <div className="relative w-8 h-8 flex items-center justify-center select-none flex-shrink-0">
                      <svg className="w-full h-full -rotate-90">
                        {/* Background track */}
                        <circle 
                          cx="16" 
                          cy="16" 
                          r={radius} 
                          fill="transparent" 
                          stroke={activePreset === 'zen' ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"}
                          strokeWidth="2.5" 
                        />
                        {/* Highlights progress */}
                        <circle 
                          cx="16" 
                          cy="16" 
                          r={radius} 
                          fill="transparent" 
                          stroke={area.color || "#2563eb"} 
                          strokeWidth="2.5" 
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span 
                        className="absolute text-[7px] font-mono font-bold"
                        style={{ color: area.color }}
                      >
                        {roundedPercent}%
                      </span>
                    </div>

                    <button
                      onClick={() => onStartSession(area)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md ${styles.buttonPrimary}`}
                      title="Quick Start Session focusing"
                    >
                      <Play className="w-3 h-3 fill-current text-white ml-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {areas.length > 0 && (
        <div className="fixed bottom-24 right-5 z-20 md:hidden">
          <button
            onClick={() => onStartSession(areas[0])}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer leading-none ${styles.buttonPrimary}`}
          >
            <Play className="w-4.5 h-4.5 fill-white ml-0.5" />
          </button>
        </div>
      )}

      {/* Premium Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-sm rounded-2xl p-5 border z-10 shadow-2xl space-y-4 text-left ${
                activePreset === 'zen' 
                  ? 'bg-[#FCFAF5] border-stone-250 text-stone-900' 
                  : activePreset === 'terminal' 
                    ? 'bg-black border-[#10B981] text-[#10B981]' 
                    : 'bg-[#0f1e35]/95 backdrop-blur-2xl border-white/15 text-white'
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-current opacity-80">
                <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Settings className="w-4 h-4" />
                  Settings Menu
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:opacity-70 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* Editable Display Name */}
                <div>
                  <label className="block text-[8px] uppercase tracking-widest opacity-80 mb-1 ml-1 font-mono font-bold">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    placeholder="Display Name..."
                    maxLength={24}
                    className={`w-full h-9 px-3 text-xs focus:outline-none ${styles.input}`}
                  />
                </div>

                {/* Sub-Aesthetic Selector directly in Settings */}
                {onSelectPreset && (
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest opacity-80 mb-1 ml-1 font-mono font-bold">Aesthetic Theme Preset</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["glass", "zen", "terminal", "vaporwave"] as UIPreset[]).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => onSelectPreset(preset)}
                          className={`py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-mono border transition-all cursor-pointer ${
                            activePreset === preset
                              ? activePreset === 'zen'
                                ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-sm'
                                : activePreset === 'terminal'
                                  ? 'bg-[#10B981] text-black border-[#10B981] font-bold shadow-sm'
                                  : activePreset === 'vaporwave'
                                    ? 'bg-pink-500 text-white border-fuchsia-400 shadow-sm'
                                    : 'bg-blue-600 text-white border-blue-500 shadow-sm'
                              : 'bg-transparent border-current/10 hover:border-current/30 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {preset === 'glass' ? 'Classic' : preset === 'zen' ? 'Zen' : preset === 'terminal' ? 'Console' : 'Vapor'}
                        </button>
                      ))}
                    </div>
                    <span className="text-[7px] opacity-60 font-mono mt-1 block ml-1 uppercase">Instant Preview. Save modifications below to lock in across devices.</span>
                  </div>
                )}

                {/* Weekly Notification toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl border border-current/10 bg-current/2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider">Digest Reminders</label>
                    <span className="text-[8px] opacity-75 uppercase tracking-wide font-mono">Browser Notifications</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className="w-12 h-6 rounded-full bg-slate-400/10 border border-current/5 relative p-0.5 flex items-center cursor-pointer transition-all hover:bg-slate-400/20"
                  >
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        notifications 
                          ? 'translate-x-6 bg-green-500' 
                          : 'translate-x-0 bg-slate-500'
                      }`}
                    >
                      {notifications ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Profile Personal Best Stats */}
                <div className="p-2.5 rounded-xl border border-current/10 bg-current/2 space-y-0.5 font-mono">
                  <span className="text-[8px] tracking-wider uppercase font-bold opacity-80">Personal Best Stats</span>
                  <div className="text-[10px]">
                    Longest Focus Round: <span className="font-bold">{userProfile.longestSession ? `${Math.floor(userProfile.longestSession / 60)}m ${userProfile.longestSession % 60}s` : "0m"}</span>
                  </div>
                </div>

                {/* Settings Buttons */}
                <div className="flex gap-2 pt-2 border-t border-current/10 justify-between">
                  {/* Sign Out Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettings(false);
                      onLogout();
                    }}
                    className="h-9 px-3 text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Exit
                  </button>

                  <button
                    type="submit"
                    disabled={savingSettings || !editableName.trim()}
                    className={`flex-1 h-9 font-medium text-[10px] uppercase rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer disabled:opacity-50 ${styles.buttonPrimary}`}
                  >
                    {savingSettings ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Apply Modifications"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
