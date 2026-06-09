export type UIPreset = "glass" | "zen" | "terminal" | "vaporwave";

export interface ThemePresetStyles {
  rootContainer: string;
  card: string;
  buttonPrimary: string;
  buttonSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accentText: string;
  input: string;
  header: string;
  nav: string;
  glowEffect: string;
}

export const PRESETS: Record<UIPreset, ThemePresetStyles> = {
  glass: {
    rootContainer: "bg-[#0f1e35] text-slate-100 font-sans",
    card: "bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl hover:bg-white/8 transition-all duration-300 shadow-md",
    buttonPrimary: "bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all active:scale-95 duration-300 font-medium",
    buttonSecondary: "bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-all duration-300",
    textPrimary: "text-white font-light tracking-wide",
    textSecondary: "text-slate-400 font-light",
    accentText: "text-blue-450",
    input: "bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300",
    header: "bg-[#0f1e35]/50 backdrop-blur-xl border-b border-white/5 text-white",
    nav: "bg-[#0f1e35]/85 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_15px_35px_rgba(15,30,53,0.55)]",
    glowEffect: "absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none"
  },
  zen: {
    rootContainer: "bg-[#FAF7F2] text-stone-900 font-sans",
    card: "bg-[#FCFAF5] border border-stone-200 text-stone-900 rounded-xl hover:border-stone-400 hover:shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-all duration-300 shadow-sm",
    buttonPrimary: "bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-sm transition-all active:scale-95 duration-300 font-medium",
    buttonSecondary: "bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 rounded-xl transition-all duration-300 shadow-xs",
    textPrimary: "text-stone-900 font-medium tracking-tight",
    textSecondary: "text-stone-500 font-normal",
    accentText: "text-[#854d0e]",
    input: "bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all duration-300",
    header: "bg-[#FAF7F2]/90 border-b border-stone-200 text-stone-905",
    nav: "bg-[#FCFAF5] border border-stone-200 rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.04)]",
    glowEffect: "absolute top-[15%] left-[20%] w-[350px] h-[350px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none"
  },
  terminal: {
    rootContainer: "bg-[#010502] text-[#10B981] font-mono selection:bg-emerald-950/40",
    card: "bg-black border border-[#10B981]/40 text-[#10B981] rounded-none hover:border-[#10B981] hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all duration-305 shadow-none",
    buttonPrimary: "bg-[#10B981] hover:bg-[#059669] text-black rounded-none shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all active:scale-95 duration-300 font-bold",
    buttonSecondary: "bg-black hover:bg-emerald-950 border border-[#10B981]/40 text-[#10B981] rounded-none transition-all duration-300",
    textPrimary: "text-[#10B981] font-bold tracking-mono",
    textSecondary: "text-emerald-700 font-normal",
    accentText: "text-[#34D399]",
    input: "bg-black border border-[#10B981]/40 rounded-none text-[#10B981] placeholder-emerald-900 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all duration-300",
    header: "bg-black border-b border-[#10B981]/30 text-[#10B981]",
    nav: "bg-black border border-[#10B981]/40 rounded-none shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    glowEffect: "absolute top-0 inset-x-0 h-[2px] bg-[#10B981]/30 shadow-[0_0_12px_#10B981] pointer-events-none"
  },
  vaporwave: {
    rootContainer: "bg-[#1B0530] text-fuchsia-100 font-sans selection:bg-pink-500/35",
    card: "bg-[#2A0A45] border-2 border-fuchsia-400 text-fuchsia-200 rounded-xl shadow-[4px_4px_0px_0px_#EC4899] hover:shadow-[6px_6px_0px_0px_#EC4899] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300",
    buttonPrimary: "bg-pink-500 hover:bg-pink-400 text-white rounded-xl border-2 border-fuchsia-300 shadow-[2px_2px_0px_0px_#A21CAF] transition-all hover:bg-pink-400 active:translate-x-0.5 active:translate-y-0.5 duration-300 font-bold uppercase tracking-wider",
    buttonSecondary: "bg-[#2A0A45] hover:bg-[#390C5C] border-2 border-fuchsia-400 text-fuchsia-300 rounded-xl transition-all duration-300",
    textPrimary: "text-fuchsia-100 font-medium tracking-wide",
    textSecondary: "text-fuchsia-400 font-light",
    accentText: "text-pink-400 font-semibold",
    input: "bg-[#330E54] border-2 border-[#EC4899]/70 rounded-xl text-fuchsia-100 placeholder-fuchsia-700 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-450 transition-all duration-300",
    header: "bg-[#1B0530] border-b-2 border-[#EC4899] text-fuchsia-100",
    nav: "bg-[#2A0A45] border-2 border-fuchsia-450 rounded-xl shadow-[4px_4px_0px_0px_#EC4899]",
    glowEffect: "absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"
  }
};
