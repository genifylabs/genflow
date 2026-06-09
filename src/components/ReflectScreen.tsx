import React, { useState } from 'react';
import { Area, Session } from '../types';
import { PRESETS, UIPreset } from '../themePresets';
import { Calendar, Trash2, Clipboard, ChevronRight, BookOpen, Star, AlertCircle, Sparkles } from 'lucide-react';

interface ReflectScreenProps {
  uid: string;
  areas: Area[];
  sessions: Session[];
  onDeleteSession: (sessionId: string) => Promise<void>;
  activePreset?: UIPreset;
}

export default function ReflectScreen({ 
  uid, 
  areas, 
  sessions, 
  onDeleteSession,
  activePreset = "glass" 
}: ReflectScreenProps) {
  const styles = PRESETS[activePreset];
  const [activeSubTab, setActiveSubTab] = useState<"daily" | "weekly" | "notes">("daily");
  const [loading, setLoading] = useState<string | null>(null);

  // Group and sort sessions
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const sessionsWithNotes = sessions.filter(s => s.note && s.note.trim().length > 0);

  // Group sessions by date
  const sessionsByDate: Record<string, Session[]> = sortedSessions.reduce((acc, sess) => {
    const dateStr = new Date(sess.startTime).toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(sess);
    return acc;
  }, {} as Record<string, Session[]>);

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm("Permanently delete this diary focus entry from history?")) {
      setLoading(sessionId);
      try {
        await onDeleteSession(sessionId);
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setLoading(null);
      }
    }
  };

  const formatHours = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  };

  // Weekly calculations
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0,0,0,0);

  const thisWeeksSessions = sessions.filter(s => new Date(s.startTime).getTime() >= startOfWeek.getTime());
  const totalWeeklySecs = thisWeeksSessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-4 pb-16 relative">
      {/* Header */}
      <div className={`flex items-end justify-between py-2 border-b ${
        activePreset === 'zen' ? 'border-stone-200' : 'border-white/5'
      }`}>
        <div>
          <h2 className={`text-[9px] uppercase tracking-[0.25em] font-mono leading-none ${styles.textSecondary}`}>
            GenFlow Dashboard
          </h2>
          <h1 className={`text-2xl font-light tracking-tight mt-1 leading-none ${styles.textPrimary}`}>
            Reflect <span className={`font-semibold ${styles.accentText}`}>Diary</span>
          </h1>
        </div>

        {/* Concise SubTabs Pill switcher */}
        <div className={`flex rounded-full p-0.5 border ${
          activePreset === 'zen' ? 'bg-stone-100 border-stone-200' : 'bg-black/20 border-white/5'
        }`}>
          {(["daily", "weekly", "notes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-2.5 py-1 text-[9px] font-mono capitalize tracking-wide rounded-full transition-all cursor-pointer ${
                activeSubTab === tab
                  ? activePreset === 'zen'
                    ? 'bg-stone-900 text-stone-50 font-semibold'
                    : activePreset === 'terminal'
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-blue-600 text-white'
                  : `text-slate-400 hover:text-white`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 text-left">
        {activeSubTab === "daily" && (
          /* DAILY TIMELINE DIARY VIEW MODULE */
          <div className="space-y-3.5">
            {Object.keys(sessionsByDate).length === 0 ? (
              <div className={`text-center py-10 border border-dashed rounded-2xl ${
                activePreset === 'zen' ? 'border-stone-200 bg-stone-50' : 'border-white/10'
              }`}>
                <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className={`text-xs ${styles.textPrimary}`}>No focal entries recorded.</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono tracking-wider">
                  Select an Area and activate focus timer.
                </p>
              </div>
            ) : (
              Object.keys(sessionsByDate).map((date) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <h3 className={`text-[9px] font-mono uppercase tracking-[0.15em] font-bold ${styles.textSecondary}`}>
                      {date}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {sessionsByDate[date].map((session, index) => (
                      <div 
                        key={session.id || index}
                        className={`p-3 relative flex items-center justify-between group transition-all duration-300 rounded-xl ${styles.card}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-lg p-2 bg-white/5 border border-white/10 rounded-lg flex-shrink-0">
                            {session.areaEmoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-xs font-semibold uppercase tracking-wide truncate ${styles.textPrimary}`}>
                                {session.areaName}
                              </h4>
                              {session.tag && (
                                <span className={`text-[8px] font-mono px-1 rounded uppercase tracking-wider ${
                                  activePreset === 'zen' ? 'bg-stone-200 text-stone-700' : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                  #{session.tag}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-slate-450">
                              <span>{new Date(session.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="opacity-45">•</span>
                              <span style={{ color: session.areaColor }} className="font-bold">
                                {formatTime(session.duration)}
                              </span>
                            </div>
                            {session.note && (
                              <p className={`text-[10px] italic mt-1 pb-0.5 leading-snug border-t font-serif ${
                                activePreset === 'zen' ? 'border-stone-150 text-stone-600' : 'border-white/5 text-slate-350'
                              }`}>
                                "{session.note}"
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSession(session.id || "")}
                          disabled={loading === session.id}
                          className="p-1 px-1.5 rounded bg-transparent text-slate-500 hover:text-red-400 transition-all cursor-pointer ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === "weekly" && (
          /* WEEKLY PROGRESS TARGET ANALYTICS VIEW MODULE */
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border flex justify-between items-center ${
              activePreset === 'zen' ? 'bg-stone-50 border-stone-200' : 'bg-white/3 border-white/5'
            }`}>
              <div>
                <span className={`text-[8px] font-mono uppercase tracking-widest ${styles.textSecondary}`}>
                  This Week Summary
                </span>
                <p className={`text-lg font-bold leading-none mt-1 ${styles.textPrimary}`}>
                  {formatTime(totalWeeklySecs)} Focused
                </p>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                activePreset === 'zen' ? 'bg-stone-900 border-stone-900 text-white' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}>
                {thisWeeksSessions.length} focus runs
              </span>
            </div>

            <div className="space-y-2.5">
              <h3 className={`text-[9px] font-mono uppercase tracking-[0.15em] font-bold ml-1 ${styles.textSecondary}`}>
                Focus Subject Progression Target Rates:
              </h3>

              {areas.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center uppercase font-mono tracking-wider">
                  No registered tracking areas.
                </p>
              ) : (
                <div className="space-y-2">
                  {areas.map((area) => {
                    const areaSessions = thisWeeksSessions.filter(s => s.areaId === area.id);
                    const completedSecs = areaSessions.reduce((acc, s) => acc + s.duration, 0);
                    const completedMin = Math.round(completedSecs / 60);
                    const targetMin = area.weeklyGoal;
                    const displayPercent = targetMin > 0 ? Math.min(100, Math.round((completedMin / targetMin) * 100)) : 0;

                    return (
                      <div key={area.id} className={`p-3 rounded-xl border ${
                        activePreset === 'zen' ? 'bg-white border-stone-200' : 'bg-transparent border-white/10'
                      }`}>
                        <div className="flex justify-between items-start mb-1 leading-none">
                          <div>
                            <span className="text-sm mr-1">{area.emoji}</span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${styles.textPrimary}`}>
                              {area.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold" style={{ color: area.color }}>
                            {completedMin}m / {targetMin}m
                          </span>
                        </div>

                        <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden relative mt-1">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${displayPercent}%`, 
                              backgroundColor: area.color,
                            }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                          <span>Progress Rates</span>
                          <span>{displayPercent}% Completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === "notes" && (
          /* NOTES ARCHIVE DIARY HIST HIST MODULE */
          <div className="space-y-3">
            {sessionsWithNotes.length === 0 ? (
              <div className={`text-center py-10 border border-dashed rounded-2xl ${
                activePreset === 'zen' ? 'border-stone-200 bg-stone-50' : 'border-white/10'
              }`}>
                <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-5" />
                <p className={`text-xs ${styles.textPrimary}`}>No notes in focus history.</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono tracking-wider">
                  Fill notes when wrapping focus loops.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessionsWithNotes.map((session, index) => (
                  <div 
                    key={session.id || index}
                    className={`p-3 text-left relative overflow-hidden transition-all duration-300 rounded-xl space-y-2 border ${styles.card}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{session.areaEmoji}</span>
                        <div>
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${styles.textPrimary}`}>{session.areaName}</h4>
                          <span className="text-[8px] font-mono text-slate-450">
                            {new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <span style={{ color: session.areaColor }} className="text-[10px] font-mono font-medium capitalize">
                        {formatTime(session.duration)}
                      </span>
                    </div>

                    <div className={`text-[11px] italic p-2.5 rounded-lg border leading-relaxed font-serif ${
                      activePreset === 'zen' ? 'bg-stone-100 border-stone-150 text-stone-650' : 'bg-black/20 border-white/5 text-slate-200'
                    }`}>
                      "{session.note}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
