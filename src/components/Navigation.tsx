import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { PRESETS, UIPreset } from '../themePresets';
import { Home, Hourglass, Compass, BarChart3, Sun, Moon, Flame, LogOut, Check, Sliders } from 'lucide-react';

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
  userName?: string;
  isSimulated?: boolean;
  activePreset: UIPreset;
  onSelectPreset: (preset: UIPreset | any) => void;
  isBentoDashboard?: boolean;
  onToggleBento?: () => void;
}

export function Header({ 
  theme, 
  onToggleTheme, 
  onLogout, 
  userName, 
  isSimulated,
  activePreset,
  onSelectPreset,
  isBentoDashboard = false,
  onToggleBento
}: HeaderProps) {
  const styles = PRESETS[activePreset];
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  const presetsList: { id: UIPreset; label: string; desc: string; preview: string }[] = [
    { id: "glass", label: "Classic Glass", desc: "Translucent midnight slate with glowing effects", preview: "bg-[#0f1e35] text-blue-400" },
    { id: "zen", label: "Minimalist Zen", desc: "Cream ivory paper with delicate wood carvings", preview: "bg-[#FAF7F2] text-amber-800 border-stone-200 border" },
    { id: "terminal", label: "Matrix Terminal", desc: "High-voltage digital monochrome console", preview: "bg-black text-[#10B981] border border-emerald-500/30" },
    { id: "vaporwave", label: "Retro Dusk", desc: "80s pink & royal purple neon arcade grid", preview: "bg-[#2A0A45] text-pink-400 border border-fuchsia-500" }
  ];

  return (
    <header className={`fixed top-0 inset-x-0 h-16 z-40 transition-all duration-300 ${styles.header} px-4 flex items-center justify-between`}>
      {/* Brand logo styled with high fidelity modern look */}
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          activePreset === 'zen' ? 'bg-stone-900' : 'bg-[#2563eb]'
        }`}>
          <Flame className="w-4.5 h-4.5 text-white fill-current animate-pulse" />
        </div>
        <div>
          <h1 className={`text-xs font-bold tracking-[0.25em] uppercase leading-none ${
            activePreset === 'zen' ? 'text-stone-900' : activePreset === 'terminal' ? 'text-[#10B981]' : 'text-white'
          }`}>GenFlow</h1>
          <span className="text-[8px] uppercase tracking-[0.15em] font-mono opacity-80">By Genify</span>
        </div>
        {isSimulated && (
          <span className="text-[7px] font-mono font-semibold px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 ml-1 select-none">Sandbox</span>
        )}
      </div>

      <div className="flex items-center gap-2 relative">
        {/* Bento Board responsive toggle for desktop users */}
        {onToggleBento && (
          <button
            onClick={onToggleBento}
            className={`hidden md:flex h-9 px-3 rounded-full text-xs font-mono items-center gap-1.5 transition-all cursor-pointer ${
              isBentoDashboard 
                ? 'bg-blue-600 text-white' 
                : activePreset === 'zen' 
                  ? 'bg-stone-200 text-stone-750 hover:bg-stone-300' 
                  : 'bg-white/5 text-slate-350 hover:bg-white/10'
            }`}
            title="Toggle high-fidelity Bento Dashboard layout"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isBentoDashboard ? "Dashboard Active" : "Tab View"}</span>
          </button>
        )}

        {/* Exquisite Preset Picker interface dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className={`h-9 px-3 rounded-full text-[10px] uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
              activePreset === 'zen' 
                ? 'bg-[#FCFAF5] border-stone-200 hover:bg-stone-100 text-stone-800' 
                : activePreset === 'terminal' 
                  ? 'bg-black border-[#10B981]/40 text-[#10B981] hover:bg-emerald-950/30' 
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Theme: {activePreset === 'glass' ? "Classic" : activePreset === 'zen' ? "Zen" : activePreset === 'terminal' ? "Console" : "Vapor"}</span>
          </button>

          {showPresetMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPresetMenu(false)} />
              <div className={`absolute right-0 mt-2 w-72 h-auto rounded-2xl p-3 z-50 border shadow-2xl transition-all font-sans ${
                activePreset === 'zen' 
                  ? 'bg-[#FCFAF5] border-stone-250 text-stone-900' 
                  : activePreset === 'terminal' 
                    ? 'bg-black border-[#10B981] text-[#10B981]' 
                    : 'bg-[#0f1e35]/95 backdrop-blur-2xl border-white/15 text-white'
              }`}>
                <div className="text-[10px] uppercase tracking-wider font-semibold opacity-60 pb-1.5 border-b border-current mb-2">
                  Select Visual Aesthetic Style
                </div>
                <div className="space-y-1.5">
                  {presetsList.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onSelectPreset(preset.id);
                        setShowPresetMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer hover:bg-white/5 ${
                        activePreset === preset.id 
                          ? activePreset === 'zen' ? 'bg-stone-100/80 ring-1 ring-stone-900/10' : 'bg-white/10 shadow-lg' 
                          : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${preset.preview} flex items-center justify-center text-xs font-bold leading-none capitalize`}>
                        {preset.id[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-sans tracking-wide">{preset.label}</span>
                          {activePreset === preset.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <p className="text-[9px] opacity-75 font-sans leading-snug mt-0.5">{preset.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Log Out button */}
        <button
          onClick={onLogout}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
            activePreset === 'zen'
              ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600'
              : activePreset === 'terminal'
                ? 'bg-black hover:bg-emerald-950 border-[#10B981]/40 text-[#10B981]'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10'
          }`}
          title="Log out which safely logs you out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

interface BottomNavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  activePreset: UIPreset;
}

export function BottomNavbar({ activeTab, onChangeTab, activePreset }: BottomNavbarProps) {
  const styles = PRESETS[activePreset];

  const navItems = [
    { id: "home" as ActiveTab, label: "Home", icon: Home },
    { id: "session" as ActiveTab, label: "Session", icon: Hourglass },
    { id: "areas" as ActiveTab, label: "Areas", icon: Compass },
    { id: "reflect" as ActiveTab, label: "Reflect", icon: BarChart3 }
  ];

  return (
    <nav className={`fixed bottom-4 inset-x-4 max-w-sm mx-auto h-16 z-40 transition-all duration-300 border ${styles.nav} px-1 md:-translate-y-1`}>
      <div className="h-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="flex flex-col items-center justify-center w-14 h-12 rounded-xl cursor-pointer relative group transition-all"
            >
              <div 
                className={`p-1 rounded-lg transition-all ${
                  isActive 
                    ? activePreset === 'zen'
                      ? 'text-stone-900 scale-110 font-bold'
                      : activePreset === 'terminal'
                        ? 'text-[#10B981] scale-110 drop-shadow-[0_0_8px_#10B981] font-bold'
                        : 'text-blue-400 scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' 
                    : activePreset === 'zen'
                      ? 'text-stone-400 hover:text-stone-700'
                      : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4.5 h-4.5 font-light" />
              </div>
              <span className={`text-[9px] tracking-[0.1em] uppercase font-sans mt-0.5 ${
                isActive 
                  ? activePreset === 'zen' ? 'text-stone-900 font-bold' : activePreset === 'terminal' ? 'text-[#10B981] font-bold' : 'text-blue-400 font-bold'
                  : activePreset === 'zen' ? 'text-stone-400/80' : 'text-slate-500 group-hover:text-slate-300'
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className={`absolute top-0 w-1.5 h-1.5 rounded-full ${
                  activePreset === 'zen' 
                    ? 'bg-stone-900' 
                    : activePreset === 'terminal' 
                      ? 'bg-[#10B981] shadow-[0_0_6px_#10B981]' 
                      : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

