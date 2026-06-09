import React, { useState } from 'react';
import { Area } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Milestone, Target, X, Star, Sparkles } from 'lucide-react';

interface AreasScreenProps {
  areas: Area[];
  onSaveArea: (area: Area) => Promise<void>;
  onDeleteArea: (areaId: string) => Promise<void>;
}

export default function AreasScreen({ areas, onSaveArea, onDeleteArea }: AreasScreenProps) {
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💻');
  const [color, setColor] = useState('#2563eb');
  const [weeklyGoal, setWeeklyGoal] = useState(120); // in minutes
  const [loading, setLoading] = useState(false);

  // Constants
  const emojis = ['💻', '🏋️', '📚', '🧘', '🎸', '🎨', '✍️', '🌱', '🧪', '🧠', '💼', '🚀'];
  const colors = ['#2563eb', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

  const handleOpenAdd = () => {
    setEditingArea(null);
    setName('');
    setEmoji('💻');
    setColor('#2563eb');
    setWeeklyGoal(120);
    setShowModal(true);
  };

  const handleOpenEdit = (area: Area) => {
    setEditingArea(area);
    setName(area.name);
    setEmoji(area.emoji);
    setColor(area.color);
    setWeeklyGoal(area.weeklyGoal);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const newArea: Area = {
      id: editingArea?.id,
      name: name.trim(),
      emoji,
      color,
      weeklyGoal: Number(weeklyGoal),
      createdAt: editingArea?.createdAt || new Date().toISOString()
    };

    try {
      await onSaveArea(newArea);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save area. Verify your Firestore rules.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (areaId: string) => {
    if (window.confirm("Permanently delete this Area? All historical sessions of this category will be removed from your logs.")) {
      try {
        await onDeleteArea(areaId);
        setShowModal(false);
      } catch (err) {
        console.error(err);
        alert("Failed to delete. Verify your rules.");
      }
    }
  };

  const formatHours = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <div className="space-y-6 pb-28 relative">
      {/* Header */}
      <div className="flex items-end justify-between py-2 border-b border-white/5">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-light text-slate-400/80 mb-1">GenFlow Subjects</h2>
          <h1 className="text-3xl font-extralight tracking-tight text-white leading-tight">
            Focus <span className="font-normal text-blue-400 font-sans">Areas</span>
          </h1>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="h-9 px-4 rounded-full bg-[#2563eb] hover:bg-blue-500 hover:shadow-blue-500/20 text-white font-medium text-xs flex items-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all cursor-pointer border border-white/10"
        >
          <Plus className="w-3.5 h-3.5" /> Add Area
        </button>
      </div>

      {/* Areas grid listing */}
      {areas.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 bg-white/2 rounded-3xl">
          <Milestone className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">No Areas under tracking.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Create subjects, projects, skills, or health habits that support your daily life.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map((area) => (
            <div 
              key={area.id}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 relative overflow-hidden flex flex-col justify-between group h-36 hover:bg-white/10 transition-all duration-300 shadow-md hover:border-white/20"
            >
              {/* Background gradient hint */}
              <div 
                className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-10 transition-all group-hover:scale-125 duration-500"
                style={{ backgroundColor: area.color }}
              />

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 bg-white/5 rounded-xl border border-white/10">{area.emoji}</span>
                  <div>
                    <h3 className="text-sm font-light text-slate-100 group-hover:text-blue-400 transition-colors tracking-wide">{area.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5" style={{ color: area.color }}>
                      Goal: {formatHours(area.weeklyGoal)}/week
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(area)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              {/* Progress visual representation placeholder bar */}
              <div className="space-y-1.5 mt-2 relative z-10">
                <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase tracking-widest opacity-60">
                  <span>Weekly allotment commitment</span>
                  <span className="font-semibold text-white">~{(area.weeklyGoal / 60).toFixed(1)} hrs</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 relative">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ 
                      width: '100%', 
                      backgroundColor: area.color,
                      boxShadow: `0 0 8px ${area.color}40`,
                      filter: `drop-shadow(0 0 4px ${area.color}80)`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide overlay / dialog sheet for Add/Edit Form */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-[#0f1e35]/95 backdrop-blur-3xl rounded-[28px] p-6 border border-white/10 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-sm font-light text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Milestone className="w-4 h-4 text-blue-500" />
                  {editingArea ? "Modify Area Details" : "Create Focus Area"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Area Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Health Habits, Piano..."
                    maxLength={32}
                    className="w-full h-11 px-3.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Symbol Emoji</label>
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setEmoji(emo)}
                        className={`h-9 text-base rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                          emoji === emo 
                            ? 'bg-blue-600/20 border border-blue-500 scale-105' 
                            : 'bg-white/3 border border-white/5'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Aesthetic Color Theme</label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full cursor-pointer transition-all relative ${
                          color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && (
                          <span className="absolute inset-1.5 bg-white rounded-full opacity-50" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 ml-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-400">Weekly Commitment minutes</label>
                    <span className="text-xs font-mono font-bold" style={{ color }}>{formatHours(weeklyGoal)}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={600}
                    step={10}
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>10m</span>
                    <span>10 hrs</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {editingArea && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDeleteClick(editingArea.id || "")}
                      className="h-11 px-3 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      title="Delete Area"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="flex-1 h-11 bg-[#2563eb] hover:bg-blue-500 text-white font-medium text-xs tracking-wider uppercase rounded-full flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : editingArea ? (
                      "Apply Modifications"
                    ) : (
                      "Register Category"
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
