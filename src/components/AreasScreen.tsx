import React, { useState } from 'react';
import { Area } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PRESETS, UIPreset } from '../themePresets';
import { Plus, Edit2, Trash2, Milestone, X, Sparkles } from 'lucide-react';

interface AreasScreenProps {
  areas: Area[];
  onSaveArea: (area: Area) => Promise<void>;
  onDeleteArea: (areaId: string) => Promise<void>;
  activePreset?: UIPreset;
}

export default function AreasScreen({ 
  areas, 
  onSaveArea, 
  onDeleteArea, 
  activePreset = "glass" 
}: AreasScreenProps) {
  const styles = PRESETS[activePreset];

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
    <div className="space-y-4 pb-16 relative">
      {/* Header */}
      <div className={`flex items-end justify-between py-2 border-b ${
        activePreset === 'zen' ? 'border-stone-200' : 'border-white/5'
      }`}>
        <div>
          <h2 className={`text-[9px] uppercase tracking-[0.25em] font-mono leading-none ${styles.textSecondary}`}>
            GenFlow Subjects
          </h2>
          <h1 className={`text-2xl font-light tracking-tight mt-1 leading-none ${styles.textPrimary}`}>
            Focus <span className={`font-semibold ${styles.accentText}`}>Areas</span>
          </h1>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className={`h-8 px-3 rounded-full text-xs flex items-center gap-1 cursor-pointer transition-all ${styles.buttonPrimary}`}
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Areas List */}
      {areas.length === 0 ? (
        <div className={`text-center py-10 border border-dashed rounded-2xl ${
          activePreset === 'zen' 
            ? 'border-stone-200 bg-stone-50' 
            : activePreset === 'terminal'
              ? 'border-[#10B981]/30 bg-black'
              : 'border-white/10 bg-white/2'
        }`}>
          <Milestone className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className={`text-xs font-semibold ${styles.textPrimary}`}>No tracking areas found.</p>
          <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto uppercase font-mono tracking-wide">
            Add a subject/skill to start.
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-left">
          {areas.map((area) => (
            <div 
              key={area.id}
              className={`p-3 relative overflow-hidden flex items-center justify-between group rounded-xl transition-all duration-300 ${styles.card}`}
            >
              <div 
                className="absolute top-1/2 left-0 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-5 pointer-events-none transition-all duration-500"
                style={{ backgroundColor: area.color }}
              />

              <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0 mr-2">
                <span className={`text-lg p-2 rounded-lg flex-shrink-0 ${
                  activePreset === 'zen' ? 'bg-stone-100 border border-stone-205' : 'bg-white/5 border border-white/15'
                }`}>
                  {area.emoji}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider truncate ${styles.textPrimary}`}>
                    {area.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px] font-mono tracking-widest opacity-60 uppercase">Weekly:</span>
                    <span className="text-[9px] font-bold font-mono" style={{ color: area.color }}>
                      {formatHours(area.weeklyGoal)}
                    </span>
                  </div>
                  <div className="h-1 bg-black/10 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: '100%', 
                        backgroundColor: area.color,
                        boxShadow: `0 0 6px ${area.color}25`
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(area)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                  activePreset === 'zen'
                    ? 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/15'
                }`}
                title="Edit area details"
              >
                <Edit2 className="w-3 h-3" />
              </button>
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
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-sm rounded-2xl p-5 border z-10 shadow-2xl space-y-4 ${
                activePreset === 'zen' 
                  ? 'bg-[#FCFAF5] border-stone-250 text-stone-900' 
                  : activePreset === 'terminal' 
                    ? 'bg-black border-[#10B981] text-[#10B981]' 
                    : 'bg-[#0f1e35]/95 backdrop-blur-2xl border-white/15 text-white'
              }`}
            >
              <div className="flex justify-between items-center pb-1.5 border-b border-current opacity-90">
                <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Milestone className="w-4 h-4" />
                  {editingArea ? "Modify Area" : "Create Area"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:opacity-75 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest opacity-80 mb-1 ml-1 font-mono">Area Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Code, Yoga, Writing..."
                    maxLength={24}
                    className={`w-full h-9 px-3 text-xs focus:outline-none ${styles.input}`}
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-widest opacity-80 mb-1 ml-1 font-mono font-bold">Symbol Emoji</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {emojis.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setEmoji(emo)}
                        className={`h-8 text-sm rounded-lg flex items-center justify-center cursor-pointer transition-all border ${
                          emoji === emo 
                            ? activePreset === 'zen'
                              ? 'bg-stone-200 border-stone-800 scale-105'
                              : 'bg-white/10 border-blue-500 scale-105 shadow-md' 
                            : 'bg-transparent border-current/10 hover:border-current/30'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-widest opacity-80 mb-1 ml-1 font-mono font-bold">Aesthetic Color Theme</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full cursor-pointer transition-all relative ${
                          color === c ? 'scale-110 ring-2 ring-blue-500/80 ring-offset-2 ring-offset-transparent' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && (
                          <span className="absolute inset-1.5 bg-white rounded-full opacity-60" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-0.5 ml-1">
                    <label className="text-[8px] uppercase tracking-widest opacity-80 font-mono">Weekly Commitment</label>
                    <span className="text-xs font-mono font-bold" style={{ color }}>{formatHours(weeklyGoal)}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={600}
                    step={10}
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                    className="w-full h-1 bg-stone-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[7px] font-mono opacity-50 mt-0.5">
                    <span>10m</span>
                    <span>10 hrs</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1.5">
                  {editingArea && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDeleteClick(editingArea.id || "")}
                      className="h-9 px-3 text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-550/20 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      title="Delete Area"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className={`flex-1 h-9 font-medium text-[10px] tracking-wider uppercase rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer disabled:opacity-50 ${styles.buttonPrimary}`}
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : editingArea ? (
                      "Save Changes"
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
