import React, { useState, useEffect, useRef } from 'react';
import { Area, Session, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PRESETS, UIPreset } from '../themePresets';
import { 
  startFocusSound, 
  stopFocusSound, 
  setFocusSoundVolume, 
  stopAllFocusSounds 
} from '../utils/audioFocus';
import { 
  Play, Pause, Square, AlertCircle, Sparkles, Hourglass, Edit3, Flame, 
  Volume2, VolumeX, CloudRain, ShieldAlert, Radio, Wind, Ghost 
} from 'lucide-react';

interface SessionScreenProps {
  uid: string;
  areas: Area[];
  defaultArea?: Area;
  onSaveSession: (session: Session, elapsedSeconds?: number) => Promise<void>;
  onNavigate: (tab: "home" | "session" | "areas" | "reflect") => void;
  userProfile?: UserProfile | null;
  activePreset?: UIPreset;
}

export default function SessionScreen({ 
  uid, 
  areas, 
  defaultArea, 
  onSaveSession, 
  onNavigate,
  userProfile,
  activePreset = "glass" 
}: SessionScreenProps) {
  const styles = PRESETS[activePreset];

  // Select active focus category
  const [selectedArea, setSelectedArea] = useState<Area | null>(defaultArea || (areas.length > 0 ? areas[0] : null));

  // Focus Tag input
  const [focusTag, setFocusTag] = useState('');

  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const startTimeRef = useRef<string | null>(null);

  // Sound Synth Mixer states
  const [soundVolumes, setSoundVolumes] = useState<Record<string, number>>({
    binaural: 0.0,
    waves: 0.0,
    rain: 0.0,
    space: 0.0
  });

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

  // Clean up all procedural audio oscillators when leaving screen
  useEffect(() => {
    return () => {
      stopAllFocusSounds();
    };
  }, []);

  // Set up volume synthesizer changes
  const handleVolumeChange = (type: "binaural" | "waves" | "rain" | "space", value: number) => {
    const nextVols = { ...soundVolumes, [type]: value };
    setSoundVolumes(nextVols);
    
    if (value > 0) {
      // Start/Alter tone source
      startFocusSound(type, value);
    } else {
      // Stop oscillator to save resources
      stopFocusSound(type);
    }
  };

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
    stopAllFocusSounds(); // Turn off active loops when session completed
    setSoundVolumes({ binaural: 0, waves: 0, rain: 0, space: 0 });
    setShowNoteModal(true);
  };

  const handleCancelTimer = () => {
    if (window.confirm("Abandon current focus session? Your elapsed minutes will not be saved.")) {
      setIsActive(false);
      setIsPaused(false);
      setTimeElapsed(0);
      startTimeRef.current = null;
      stopAllFocusSounds();
      setSoundVolumes({ binaural: 0, waves: 0, rain: 0, space: 0 });
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
      tag: focusTag.trim() || undefined, // Save the focus tag to document!
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await onSaveSession(newSession, timeElapsed);
      setTimeElapsed(0);
      setSessionNote('');
      setFocusTag('');
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

  // Focus sound descriptions
  const soundsMetadata = [
    { id: "binaural", label: "Theta Beat", desc: "Neuro-binaural theta focus carrier waves", icon: Radio },
    { id: "waves", label: "Ocean Surf", desc: "Procedural breathing tide swells", icon: Wind },
    { id: "rain", label: "Warm Rain", desc: "Calmic white-pink precipitation noise", icon: CloudRain },
    { id: "space", label: "Cosmic Drone", desc: "Sub-harmonic space resonance synthesizers", icon: Ghost }
  ];

  return (
    <div className="space-y-4 pb-14 min-h-[calc(100vh-140px)] flex flex-col justify-between relative text-left">
      {/* Background radial glow matching the active area's unique theme color */}
      {isActive && selectedArea && (
        <div 
          className="absolute inset-x-0 top-0 h-48 rounded-full blur-[100px] opacity-10 pointer-events-none transition-all duration-1000"
          style={{ 
            background: `radial-gradient(circle, ${selectedArea.color} 0%, transparent 80%)`,
          }}
        />
      )}

      {/* Top Segment: Selection or Display */}
      <div className="space-y-3.5 text-left">
        {!isActive ? (
          <div>
            <h2 className={`text-[9px] uppercase tracking-[0.25em] font-mono leading-none ${styles.textSecondary}`}>
              GenFlow Sessions
            </h2>
            <h1 className={`text-2xl font-light tracking-tight mt-1 leading-none ${styles.textPrimary}`}>
              Start <span className={`font-semibold ${styles.accentText}`}>Focus</span>
            </h1>
            
            {/* Area Category Pick List */}
            <div className="mt-4 space-y-3">
              <label className="block text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">Select Focus Subject</label>
              
              {areas.length === 0 ? (
                <div className={`text-center py-6 border border-dashed rounded-xl ${
                  activePreset === 'zen' ? 'border-stone-200 bg-stone-50' : 'border-white/10'
                }`}>
                  <p className="text-xs text-slate-500 font-mono uppercase">Add an Area first from the "Areas" tab</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {areas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setSelectedArea(area)}
                      className={`p-2.5 rounded-xl flex items-center justify-between border transition-all duration-300 cursor-pointer ${
                        selectedArea?.id === area.id
                          ? activePreset === 'zen'
                            ? 'bg-stone-100 border-stone-800'
                            : 'bg-white/10 border-blue-500 shadow-md'
                          : 'bg-transparent border-current/10 hover:border-current/25 font-light'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{area.emoji}</span>
                        <div className="text-left leading-none">
                          <h4 className={`text-xs font-semibold uppercase tracking-wider ${styles.textPrimary}`}>{area.name}</h4>
                          <span className="text-[8px] opacity-50 font-mono uppercase">Goal: {area.weeklyGoal}m</span>
                        </div>
                      </div>
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-current/20 flex items-center justify-center transition-all"
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

              {/* Focus tag input field */}
              {selectedArea && (
                <div className="pt-1.5">
                  <label className="block text-[8px] uppercase tracking-[0.15em] font-bold text-slate-400 mb-1 ml-1 font-mono">Focus Objectives</label>
                  <input
                    type="text"
                    maxLength={40}
                    value={focusTag}
                    onChange={(e) => setFocusTag(e.target.value)}
                    placeholder="e.g. Chapter 4, Code review, Writing..."
                    className={`w-full h-9 px-3 text-xs focus:outline-none ${styles.input}`}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <div className={`inline-flex items-center gap-2 px-3 h-7 rounded-full border text-xs ${
              activePreset === 'zen' ? 'bg-[#FCFAF5] border-stone-200' : 'bg-white/5 border-white/10'
            }`}>
              <span className="text-base">{selectedArea?.emoji}</span>
              <span className={`font-mono text-[9px] uppercase tracking-wider ${styles.textPrimary}`}>{selectedArea?.name}</span>
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: selectedArea?.color }} />
            </div>
            {focusTag.trim() && (
              <div className="text-[10px] text-slate-400 italic font-sans">
                Task Plan: <span className="text-blue-500 font-bold font-sans">"{focusTag.trim()}"</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Central Segment: stopwatch timer */}
      <div className="flex flex-col items-center justify-center py-2 h-44 md:h-52 relative z-10">
        <div 
          className="w-40 h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center border transition-all duration-1000 relative"
          style={{ 
            borderColor: selectedArea && isActive ? `${selectedArea.color}40` : 'rgba(255,255,255,0.06)',
            borderWidth: '2px', // Thinner, premium borders
            boxShadow: selectedArea && isActive && !isPaused ? `0 0 35px ${selectedArea.color}10` : 'none'
          }}
        >
          <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center">
            <span 
              className={`text-2xl md:text-3xl font-bold tracking-widest select-all transition-all duration-500 ${
                activePreset === 'zen' ? 'text-stone-900 font-sans' : 'text-white font-mono'
              }`}
            >
              {formatStopwatch(timeElapsed)}
            </span>
            
            <span className="text-[7px] text-slate-500 uppercase tracking-[0.25em] mt-2 leading-none font-mono">
              {isPaused ? "PAUSED" : isActive ? "IN FLOW" : "ZENED"}
            </span>

            {/* LIVE personal longest session "New Record 🔥" badge dynamic emitter */}
            {isActive && timeElapsed > (userProfile?.longestSession || 0) && userProfile?.longestSession !== undefined && (
              <div className="mt-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[6px] font-mono tracking-widest flex items-center gap-0.5 animate-pulse">
                <Flame className="w-2.5 h-2.5 fill-amber-500" /> RECORD 🔥
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestion feature: Bio-Acoustic soundboard mixer inside session screen */}
      {isActive && (
        <div className={`p-3.5 rounded-xl border space-y-2.5 text-left ${
          activePreset === 'zen' ? 'bg-[#FCFAF5] border-stone-200' : 'bg-black/25 border-white/5'
        }`}>
          <div className="flex items-center justify-between pb-1 border-b border-current/10 opacity-75">
            <span className="text-[8px] font-mono uppercase tracking-[0.15em] flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" /> Bio-Acoustic Soundscapes
            </span>
            <span className="text-[7px] font-mono uppercase opacity-55">Looping Procedurally</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {soundsMetadata.map((sound) => {
              const Icon = sound.icon;
              const val = soundVolumes[sound.id] || 0;
              return (
                <div key={sound.id} className="space-y-0.5">
                  <div className="flex justify-between items-center text-[7px] uppercase font-mono tracking-wider opacity-90">
                    <span className="flex items-center gap-1"><Icon className="w-2.5 h-2.5" />{sound.label}</span>
                    <span className="font-bold">{Math.round(val * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.05}
                    value={val}
                    onChange={(e) => handleVolumeChange(sound.id as any, parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-0.5 rounded bg-white/10 appearance-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lower Segment: Action Triggers (Thumb-friendly region) */}
      <div className="space-y-2 px-1 z-10">
        {!isActive ? (
          <button
            onClick={handleStartTimer}
            disabled={!selectedArea}
            className={`w-full h-11 text-xs font-semibold flex items-center justify-center gap-1 shadow-md cursor-pointer ${styles.buttonPrimary}`}
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Start Focus Loop
          </button>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePauseToggle}
                className="h-10 text-[10px] uppercase font-mono border text-current rounded-xl cursor-pointer flex items-center justify-center gap-1.5 hover:bg-current/5"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                {isPaused ? "Resume" : "Pause"}
              </button>

              <button
                onClick={handleEndSession}
                className={`h-10 text-[10px] uppercase tracking-wider font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${styles.buttonPrimary}`}
              >
                <Square className="w-3 h-3 fill-white text-white" /> Complete
              </button>
            </div>

            <button
              onClick={handleCancelTimer}
              className="w-full py-1 text-[8px] text-red-500 hover:text-red-400 font-mono uppercase tracking-widest transition-all text-center leading-none"
            >
              Cancel track
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-sm rounded-[24px] p-5 border z-10 shadow-2xl space-y-4 text-center ${
                activePreset === 'zen' 
                  ? 'bg-[#FCFAF5] border-stone-250 text-stone-900' 
                  : activePreset === 'terminal' 
                    ? 'bg-black border-[#10B981] text-[#10B981]' 
                    : 'bg-[#0f1e35]/95 backdrop-blur-2xl border-white/15 text-white'
              }`}
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-500" />
              </div>

              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${styles.textPrimary}`}>How was your focus round?</h3>
                <p className="text-[11px] text-slate-400 mt-1">Excellent job logging <span className="font-semibold text-blue-400">{Math.max(1, Math.round(timeElapsed / 60))} focus minutes</span> in {selectedArea.emoji} {selectedArea.name}.</p>
              </div>

              <div className="text-left">
                <textarea
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  placeholder="What was accomplished? Write down your breakthrough details..."
                  maxLength={500}
                  className={`w-full h-20 p-2 text-xs focus:outline-none resize-none ${styles.input}`}
                />
                <span className="text-[8px] text-slate-500 block text-right mt-1 font-mono">{sessionNote.length}/500</span>
              </div>

              {focusTag.trim() && (
                <div className="text-left text-[9px] font-mono text-slate-450">
                  Attached Tag: <span className="text-blue-500 font-bold">#{focusTag.trim()}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={savingLoading}
                  onClick={() => {
                    setShowNoteModal(false);
                    setIsActive(true); // resume to active
                  }}
                  className={`flex-1 h-9 text-[10px] uppercase font-mono border text-current rounded-xl cursor-pointer hover:bg-current/5`}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={savingLoading}
                  onClick={handleSaveConfirmed}
                  className={`flex-1 h-9 font-medium text-[10px] uppercase rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer disabled:opacity-50 ${styles.buttonPrimary}`}
                >
                  {savingLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Commit & Reflect"
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
