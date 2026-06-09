import React from 'react';
import { ActiveTab } from '../types';
import { Home, Hourglass, Compass, BarChart3, Sun, Moon, Flame, LogOut } from 'lucide-react';

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
  userName?: string;
  isSimulated?: boolean;
}

export function Header({ theme, onToggleTheme, onLogout, userName, isSimulated }: HeaderProps) {
  return (
    <header className="fixed top-0 inset-x-0 h-16 z-40 border-b border-white/5 bg-[#0f1e35]/50 backdrop-blur-xl px-4 flex items-center justify-between">
      {/* Brand logo styled with high fidelity modern look */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.6)]">
          <Flame className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h1 className="text-xs font-semibold tracking-[0.25em] text-white uppercase leading-none">GenFlow</h1>
          <span className="text-[8px] uppercase tracking-[0.15em] text-blue-400 font-mono">By Genify</span>
        </div>
        {isSimulated && (
          <span className="text-[7px] font-mono font-semibold px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 ml-1 select-none">Sandbox</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Sun/Moon dynamic theme selector */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 active:scale-[0.95] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
          title="Toggle visual theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
        </button>

        {/* Log Out button */}
        <button
          onClick={onLogout}
          className="w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 active:scale-[0.95] text-red-400 flex items-center justify-center transition-all cursor-pointer border border-red-500/10"
          title="Log out of application"
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
}

export function BottomNavbar({ activeTab, onChangeTab }: BottomNavbarProps) {
  const navItems = [
    { id: "home" as ActiveTab, label: "Home", icon: Home },
    { id: "session" as ActiveTab, label: "Session", icon: Hourglass },
    { id: "areas" as ActiveTab, label: "Areas", icon: Compass },
    { id: "reflect" as ActiveTab, label: "Reflect", icon: BarChart3 }
  ];

  return (
    <nav className="fixed bottom-4 inset-x-4 max-w-sm mx-auto h-16 z-40 border border-white/10 bg-[#0f1e35]/85 backdrop-blur-xl rounded-[24px] px-2 shadow-[0_15px_35px_rgba(15,30,53,0.55)]">
      <div className="h-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="flex flex-col items-center justify-center w-16 h-12 rounded-xl cursor-pointer relative group transition-all"
            >
              <div 
                className={`p-1 rounded-lg transition-all ${
                  isActive 
                    ? 'text-blue-400 scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4.5 h-4.5 font-light" />
              </div>
              <span className={`text-[9px] tracking-[0.1em] uppercase font-sans mt-0.5 ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute top-0 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
