import React, { useState, useEffect, useRef } from 'react';
import { Area, Session } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, AlertCircle, Sparkles, Hourglass, Edit3 } from 'lucide-react';

interface SessionScreenProps {
  uid: string;
  areas: Area[];
  defaultArea?: Area;
  onSaveSession: (session: Session) => Promise<void>;
  onNavigate: (tab: "home" | "session" | "areas" | "reflect") => void;
}

export default function SessionScreen({ uid, areas, defaultArea, onSaveSession, onNavigate }: SessionScreenProps) {
  // Select active focus category
  const [selectedArea, setSelectedArea] = useState<Area | null>(defaultArea || (areas.length > 0 ? areas[0] : null));

  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const startTimeRef = useRef<string | null>(null);

  // Note entry modal at end of session
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [savingLoading, setSavingLoading] = useState(false);

  // Keep screen awake reference (visual simulation)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sync default area when changed from home quick start
    if (defaultArea) {
      setSelectedArea(defaultArea);
    }
  }, [defaultArea]);

  useEffect(() => {
    if (isActive && !isPaused) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date().toISOString();
      }
      timerIntervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  // Helper formatting for stopwatch view (HH:MM:SS)
  const formatStopwatch = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return hrs > 0 
      ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
      : `${pad(mins)}:${pad(secs)}`;
  };

  const handleStartTimer = () => {
    if (!selectedArea) return;
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleEndSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setShowNoteModal(true);
  };

  const handleCancelTimer = () => {
    if (window.confirm("Abandon current focus session? Your elapsed minutes will not be saved.")) {
      setIsActive(false);
      setIsPaused(false);
      setTimeElapsed(0);
      startTimeRef.current = null;
    }
  };

  const handleSaveConfirmed = async () => {
    if (!selectedArea) return;
    setSavingLoading(true);

    const endTimeNow = new Date().toISOString();
    const startTimeStamp = startTimeRef.current || new Date(Date.now() - timeElapsed * 1000).toISOString();
    
    // Calculate rounded minutes duration (minimum 1 minute if focused at least 30 seconds)
    const durationMinutes = Math.max(1, Math.round(timeElapsed / 60));

    const newSession: Session = {
      areaId: selectedArea.id || "",
      areaName: selectedArea.name,
      areaColor: selectedArea.color,
      areaEmoji: selectedArea.emoji,
      startTime: startTimeStamp,
      endTime: endTimeNow,
      duration: durationMinutes,
      note: sessionNote.trim() || undefined,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await onSaveSession(newSession);
      setTimeElapsed(0);
      setSessionNote('');
      startTimeRef.current = null;
      setShowNoteModal(false);
      onNavigate("home"); // Redirect to home to check progression
    } catch (err) {
      console.error(err);
      alert("Failed to commit session. Please check your Firestore rules.");
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 flex flex-col justify-between min-h-[calc(100vh-140px)] relative">
      {/* Background radial glow matching the active area's unique theme color */}
      {isActive && selectedArea && (
        <div 
          className="absolute inset-0 w-full h-full rounded-full blur-[140px] opacity-10 pointer-events-none transition-all duration-1000"
          style={{ 
            background: `radial-gradient(circle, ${selectedArea.color} 0%, transparent 70%)`,
            transform: 'scale(1.2)'
          }}
        />
      )}

      {/* Top Segment: Selection or Display */}
      <div className="space-y-4">
        {!isActive ? (
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-light text-slate-400 mb-1">GenFlow Sessions</h2>
            <h1 className="text-3xl font-extralight tracking-tight text-white">
              Start a new <span className="font-normal text-blue-400">Intention</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-light">Let everything else go. Enter your focused state.</p>
            
            {/* Area Category Pick List */}
            <div className="mt-6 space-y-3">
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 opacity-60">Pick an Area to Do</label>
              
              {areas.length === 0 ? (
                <div className="text-center py-6 border border-white/5 bg-white/2 rounded-2xl">
                  <p className="text-xs text-slate-400">Add an Area under the "Areas" tab first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {areas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setSelectedArea(area)}
                      className={`p-4 rounded-2xl flex items-center justify-between border transition-all duration-300 ${
                        selectedArea?.id === area.id
                          ? 'bg-white/10 border-white/20 shadow-[0_4px_20px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/30'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{area.emoji}</span>
                        <div className="text-left">
                          <h4 className="text-sm font-light text-white tracking-wide">{area.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 opacity-60 uppercase tracking-tighter">Goal Commitment: {area.weeklyGoal} mins/week</p>
                        </div>
                      </div>
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center transition-all"
                        style={{ borderColor: selectedArea?.id === area.id ? area.color : undefined }}
                      >
                        {selectedArea?.id === area.id && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: area.color }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 h-8 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
              <span className="text-base">{selectedArea?.emoji}</span>
              <span className="font-light tracking-wide text-white">{selectedArea?.name}</span>
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: selectedArea?.color }} />
            </div>
            <p className="text-[9px] text-slate-400 uppercase tracking-[0.25em] font-mono mt-1 opacity-60">Session in Progression</p>
          </div>
        )}
      </div>

      {/* Central Segment: Chrono Core representation */}
      <div className="flex flex-col items-center justify-center py-6 h-64 md:h-80 relative z-10">
        <div 
          className="w-56 h-56 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center border transition-all duration-1000 relative"
          style={{ 
            borderColor: selectedArea && isActive ? `${selectedArea.color}40` : 'rgba(255,255,255,0.06)',
            borderWidth: '8px',
            boxShadow: selectedArea && isActive && !isPaused ? `0 0 45px ${selectedArea.color}25` : 'none'
          }}
        >
          {/* Inner pulsating node */}
          <div className={`absolute w-44 h-44 md:w-52 md:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-700 ${
            isActive && !isPaused ? 'scale-105' : 'scale-100'
          }`}
               style={{ background: 'rgba(255,255,255,0.01)' }}
          >
            <span 
              className="text-4xl md:text-5xl font-light font-mono tracking-tight text-white select-all transition-all duration-500"
              style={{
                textShadow: selectedArea && isActive && !isPaused ? `0 0 15px ${selectedArea.color}BF` : 'none'
              }}
            >
              {formatStopwatch(timeElapsed)}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-sans mt-2">
              {isPaused ? "Paused" : isActive ? "Focusing" : "Zoned"}
            </span>
          </div>
        </div>
      </div>

      {/* Lower Segment: Action Triggers (Thumb-friendly region) */}
      <div className="space-y-4 px-2 z-10">
        {!isActive ? (
          <button
            onClick={handleStartTimer}
            disabled={!selectedArea}
            className="w-full h-14 rounded-full bg-[#2563eb] hover:bg-blue-500 text-white font-medium text-sm tracking-wide shadow-[0_10px_30px_rgba(37,99,235,0.35)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" /> Focus Intention Now
          </button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePauseToggle}
                className="h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium text-xs tracking-wide uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 text-white" /> Pause
                  </>
                )}
              </button>

              <button
                onClick={handleEndSession}
                className="h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wide uppercase transition-all cursor-pointer shadow-[0_8px_24px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4 text-white fill-white" /> End Session
              </button>
            </div>

            <button
              onClick={handleCancelTimer}
              className="w-full py-2.5 text-[10px] text-red-400 hover:text-red-300 font-semibold uppercase tracking-wider transition-all"
            >
              Cancel focus tracking
            </button>
          </div>
        )}
      </div>

      {/* Premium End Note Form Dialog */}
      <AnimatePresence>
        {showNoteModal && selectedArea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {}} // Block clicking outside during save
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm frosted-glass rounded-3xl p-6 border border-white/10 z-10 shadow-2xl space-y-5 text-center relative"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">How was your focus?</h3>
                <p className="text-xs text-slate-400 mt-1">Excellent work logging <span className="text-white font-semibold">{Math.max(1, Math.round(timeElapsed / 60))} focus minutes</span> in {selectedArea.emoji} {selectedArea.name}.</p>
              </div>

              <div className="text-left">
                <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-400 mb-1.5 ml-1">Write down notes (Optional)</label>
                <textarea
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  placeholder="What did you complete? Any breakthroughs? How did it feel?"
                  maxLength={500}
                  className="w-full h-24 p-3 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 resize-none"
                />
                <span className="text-[9px] text-slate-500 block text-right mt-1 font-mono">{sessionNote.length}/500</span>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={savingLoading}
                  onClick={() => {
                    setShowNoteModal(false);
                    setIsActive(true); // resume to active
                  }}
                  className="flex-1 h-11 text-xs bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 rounded-xl cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  disabled={savingLoading}
                  onClick={handleSaveConfirmed}
                  className="flex-1 h-11 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  {savingLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Save & Reflect"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
