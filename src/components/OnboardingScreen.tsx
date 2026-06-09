import React, { useState } from 'react';
import { Area } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Flame, ArrowRight, Target, Smile, Star } from 'lucide-react';

interface OnboardingScreenProps {
  userName: string;
  onComplete: (firstArea: Area) => void;
}

export default function OnboardingScreen({ userName, onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [areaName, setAreaName] = useState('Coding & Design');
  const [areaEmoji, setAreaEmoji] = useState('💻');
  const [weeklyGoal, setWeeklyGoal] = useState(120); // default 120 minutes (2 hours)
  const [areaColor, setAreaColor] = useState('#2563eb');

  const emojis = ['💻', '🏋️', '📚', '🧘', '🎸', '🎨', '✍️', '🌱', '🧪', '🧠', '💼', '🚀'];
  const colors = ['#2563eb', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const firstArea: Area = {
        name: areaName || "Focus Zone",
        emoji: areaEmoji,
        color: areaColor,
        weeklyGoal: Number(weeklyGoal) || 60,
        createdAt: new Date().toISOString()
      };
      onComplete(firstArea);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-center relative">
      {/* Visual background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Progress Bars */}
      <div className="w-full max-w-sm flex justify-between gap-3 mb-8 px-1 z-10">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
              s <= step 
                ? 'bg-[#2563eb] shadow-[0_0_12px_rgba(37,99,235,0.8)]' 
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-sm relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f1e35]/80 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/10 space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-light tracking-wide text-white">Let's set your foundation</h2>
                  <p className="text-[10px] text-slate-400">Step 1 of 3: Define your first Area</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs leading-relaxed text-slate-300 font-light">
                  Welcome to <strong className="text-white font-medium">GenFlow</strong>, {userName}! Focus is divided into <strong className="text-white font-medium">Areas</strong> (e.g. subjects, skills, or hobbies). Let's kick off with manual alignment.
                </p>

                <div>
                  <label className="block text-[9px] font-medium uppercase tracking-widest text-slate-400 mb-2">Area Name</label>
                  <input 
                    type="text" 
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="e.g. Piano Practice, Side Project..."
                    maxLength={40}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300 font-light"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-medium uppercase tracking-widest text-slate-400 mb-2">Select Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setAreaEmoji(emo)}
                        className={`h-10 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          areaEmoji === emo 
                            ? 'bg-[#2563eb] border border-blue-400 scale-105 shadow-md shadow-blue-500/20' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-medium uppercase tracking-widest text-slate-400 mb-2">Assign Style Color</label>
                  <div className="flex gap-2.5 flex-wrap">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAreaColor(c)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-all duration-200 relative ${
                          areaColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {areaColor === c && (
                          <span className="absolute inset-1.5 bg-white rounded-full opacity-40" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={!areaName.trim()}
                className="w-full h-11 rounded-full bg-[#2563eb] hover:bg-blue-500 text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-6 cursor-pointer disabled:opacity-50 transition-all"
              >
                Continue to Goals <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f1e35]/80 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/10 space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-light tracking-wide text-white">How much focus is enough?</h2>
                  <p className="text-[10px] text-slate-400">Step 2 of 3: Set commitments</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3.5">
                  <span className="text-xl p-1 bg-white/5 rounded-lg">{areaEmoji}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{areaName}</h4>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: areaColor }}>Active Area Selection</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-300 font-light">
                  Set a weekly focus target for this Area. Setting a target allows GenFlow to measure your metrics and reflect success alignment.
                </p>

                <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-4xl font-light font-mono text-white">{weeklyGoal}</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block mt-1">minutes per week</span>
                  <p className="text-[10px] text-blue-400 font-mono mt-1 font-light opacity-80">
                    (~{(weeklyGoal / 60).toFixed(1)} hours scheduled)
                  </p>
                </div>

                <div>
                  <label className="block text-[9px] font-medium uppercase tracking-widest text-slate-400 mb-2">Preset Presets</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[30, 60, 120, 240, 480].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setWeeklyGoal(t)}
                        className={`h-8 text-[10px] font-mono rounded-full flex items-center justify-center cursor-pointer transition-all ${
                          weeklyGoal === t 
                            ? 'bg-[#2563eb] border border-blue-400 text-white font-bold' 
                            : 'bg-white/5 hover:bg-white/10 text-slate-350'
                        }`}
                      >
                        {t >= 60 ? `${(t/60).toFixed(0)}h` : `${t}m`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input 
                    type="range" 
                    min={10} 
                    max={600} 
                    step={10}
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-wider">
                    <span>10m</span>
                    <span>10 hrs</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="flex-1 h-11 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 text-xs uppercase tracking-wider font-medium transition-all cursor-pointer border border-white/5"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 h-11 rounded-full bg-[#2563eb] hover:bg-blue-500 text-white text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1 shadow-lg shadow-blue-500/25 cursor-pointer transition-all"
                >
                  Commit Goal <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f1e35]/80 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/10 space-y-6 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Smile className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-light tracking-wide text-white">Your Focus Cycle is ready!</h2>
                <p className="text-[10px] text-blue-400 font-mono uppercase tracking-[0.2em]">"Set. Do. Reflect."</p>
              </div>

              <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-3.5 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 bg-white/5 rounded-xl block">{areaEmoji}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">{areaName}</h4>
                    <p className="text-[10px] font-mono text-slate-400 leading-none">
                      Commitment: <span className="text-white font-bold" style={{ color: areaColor }}>{weeklyGoal} mins/week</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2 text-[10px] text-slate-300 font-light">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-blue-400 fill-blue-500/20" />
                    <span>Focus session timers operate client-side.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-blue-400 fill-blue-500/20" />
                    <span>Firestore acts as your single cloud source.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-blue-400 fill-blue-500/20" />
                    <span>Reflection stats build automatically.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full h-11 rounded-full bg-[#2563eb] hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.98] text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-white" /> Enter PWA GenFlow
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
