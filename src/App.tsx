import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signOut,
  auth,
  User 
} from './firebase';
import { 
  getUserProfile, 
  saveUserProfile, 
  updateUserTheme, 
  getAreas, 
  saveArea, 
  deleteArea, 
  getSessions, 
  saveSession, 
  deleteSession,
  isFirebaseConfigured
} from './db';
import { UserProfile, Area, Session, ActiveTab } from './types';
import { PRESETS, UIPreset } from './themePresets';
import AuthScreen from './components/AuthScreen';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import SessionScreen from './components/SessionScreen';
import AreasScreen from './components/AreasScreen';
import ReflectScreen from './components/ReflectScreen';
import { Header, BottomNavbar } from './components/Navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import Confetti from './components/Confetti';
import { calculateStreak } from './utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [onboardingRequired, setOnboardingRequired] = useState(false);

  // Core business collections state
  const [areas, setAreas] = useState<Area[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  // UX states
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [preselectedAreaForSession, setPreselectedAreaForSession] = useState<Area | undefined>(undefined);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [uiPreset, setUiPreset] = useState<UIPreset>(() => {
    try {
      return (localStorage.getItem("genflow_ui_preset") as UIPreset) || "glass";
    } catch {
      return "glass";
    }
  });

  const [isBentoDashboard, setIsBentoDashboard] = useState<boolean>(() => {
    try {
      return localStorage.getItem("genflow_bento_dashboard") !== "false";
    } catch {
      return true;
    }
  });

  const handleSelectPreset = async (preset: UIPreset) => {
    setUiPreset(preset);
    try {
      localStorage.setItem("genflow_ui_preset", preset);
    } catch {}

    // Sync Light/Dark profiles to ensure full database compatibility
    const targetTheme = preset === "zen" ? "light" : "dark";
    if (profile && profile.theme !== targetTheme && user) {
      try {
        await updateUserTheme(user.uid, targetTheme);
        setProfile({ ...profile, theme: targetTheme });
      } catch (err) {
        console.error("Failed syncing firebase theme for preset:", err);
      }
    }
  };

  const handleToggleBento = () => {
    const nextVal = !isBentoDashboard;
    setIsBentoDashboard(nextVal);
    try {
      localStorage.setItem("genflow_bento_dashboard", String(nextVal));
    } catch {}
  };

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load Profile info mapping
        await loadUserData(currentUser.uid, currentUser.email || "");
      } else {
        setUser(null);
        setProfile(null);
        setOnboardingRequired(false);
        setAreas([]);
        setSessions([]);
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // 1b. Weekly notification digest checks on Sundays
  useEffect(() => {
    if (!profile || !profile.notificationsEnabled || sessions.length === 0) return;

    // Check if today is Sunday
    const isSunday = new Date().getDay() === 0;
    if (!isSunday) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastSent = localStorage.getItem('last_sunday_digest_sent');
      
      if (lastSent !== todayStr && Notification.permission === "granted") {
        // Aggregate trailing 7-day focus stats
        const now = Date.now();
        const trailing7Days = sessions.filter(s => (now - new Date(s.startTime).getTime()) <= 7 * 24 * 60 * 60 * 1000);
        const totalMinutes = trailing7Days.reduce((sum, s) => sum + s.duration, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);

        // Find top Area
        const areaTimes: Record<string, number> = {};
        trailing7Days.forEach(s => {
          areaTimes[s.areaName] = (areaTimes[s.areaName] || 0) + s.duration;
        });
        let topAreaName = "None";
        let maxTime = 0;
        Object.entries(areaTimes).forEach(([name, time]) => {
          if (time > maxTime) {
            maxTime = time;
            topAreaName = name;
          }
        });

        // Compute current streak
        const currentStreak = calculateStreak(sessions);

        // Trigger dynamic Notification
        try {
          new Notification("Your GenFlow Weekly Summary 📊", {
            body: `Focused ${totalHours}h this week! Top area: ${topAreaName}. Streak: ${currentStreak} days 🔥`,
            icon: "/favicon.ico"
          });
          localStorage.setItem('last_sunday_digest_sent', todayStr);
        } catch (e) {
          console.error("Failed to trigger weekly summary alert:", e);
        }
      }
    }
  }, [profile, sessions]);

  // 2. Auxiliary method to query profiles and core records
  const loadUserData = async (uid: string, fallbackEmail: string) => {
    setGlobalLoading(true);
    try {
      const userProfile = await getUserProfile(uid);
      if (!userProfile) {
        // No profile found: triage to Onboarding
        setOnboardingRequired(true);
      } else {
        setProfile(userProfile);
        setOnboardingRequired(false);
        
        if (userProfile.preset) {
          setUiPreset(userProfile.preset as UIPreset);
          try {
            localStorage.setItem("genflow_ui_preset", userProfile.preset);
          } catch {}
        }
        
        // Fetch focus metrics
        const loadedAreas = await getAreas(uid);
        const loadedSessions = await getSessions(uid);
        setAreas(loadedAreas);
        setSessions(loadedSessions);
      }
    } catch (err) {
      console.error("Failed to load user profile or data collections:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  // 3. Handle landing registration successes
  const handleAuthSuccess = async (uid: string, email: string, displayName: string) => {
    // Mimic the native User setting trigger if in sandbox mode
    if (!isFirebaseConfigured) {
      setUser({
        uid,
        email,
        displayName,
        emailVerified: true
      } as any);
      await loadUserData(uid, email);
    }
  };

  const handleOnboardingComplete = async (firstArea: Area) => {
    if (!user) return;
    setGlobalLoading(true);
    const mockOrRealName = user.displayName || "Explorer";
    
    const newProfile: UserProfile = {
      name: mockOrRealName,
      email: user.email || "",
      createdAt: new Date().toISOString(),
      theme: "dark",
      preset: "glass" // keep classic as default!
    };

    try {
      // 1. Commit user profile info mapping
      await saveUserProfile(user.uid, newProfile);
      
      // 2. Commit first Focus Area Category
      await saveArea(user.uid, firstArea);

      // 3. Fetch latest database synchronization
      await loadUserData(user.uid, user.email || "");
      
      setOnboardingRequired(false);
      setActiveTab("home");
    } catch (err) {
      console.error("Failed to commit onboarding data:", err);
      alert("Error logging initial profile details. Verify firestore setup.");
    } finally {
      setGlobalLoading(false);
    }
  };

  // 4. Handle state modifying triggers
  const handleToggleTheme = async () => {
    if (!user || !profile) return;
    const nextTheme = profile.theme === "light" ? "dark" : "light";
    try {
      await updateUserTheme(user.uid, nextTheme);
      setProfile({ ...profile, theme: nextTheme });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out of GenFlow?")) {
      await signOut(auth);
      // In simulator sandbox mode, trigger hard reset locally
      if (!isFirebaseConfigured) {
        setUser(null);
        setProfile(null);
        setAreas([]);
        setSessions([]);
      }
    }
  };

  const handleQuickStartSession = (area: Area) => {
    setPreselectedAreaForSession(area);
    setActiveTab("session");
  };

  // Core mutations matching Firebase security wrappers
  const handleCommitSession = async (session: Session, elapsedSeconds?: number) => {
    if (!user || !profile) return;

    // 1. Check if this session completes the weekly goal for its Area
    const targetArea = areas.find(a => a.id === session.areaId);
    if (targetArea && targetArea.weeklyGoal > 0) {
      const now = Date.now();
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const prevCompleted = sessions
        .filter(s => s.areaId === session.areaId && new Date(s.startTime) >= oneWeekAgo)
        .reduce((sum, s) => sum + s.duration, 0);
      const nextCompleted = prevCompleted + session.duration;
      
      if (prevCompleted < targetArea.weeklyGoal && nextCompleted >= targetArea.weeklyGoal) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }

    // 2. Commit logged Focus Session
    await saveSession(user.uid, session);
    const updated = await getSessions(user.uid);
    setSessions(updated);

    // 3. Update longestSession record if surpassed
    if (elapsedSeconds !== undefined && elapsedSeconds > (profile.longestSession || 0)) {
      const updatedProfile = {
        ...profile,
        longestSession: elapsedSeconds
      };
      await saveUserProfile(user.uid, updatedProfile);
      setProfile(updatedProfile);
    }
  };

  const handleSaveArea = async (areaDetails: Area) => {
    if (!user) return;
    await saveArea(user.uid, areaDetails);
    const updated = await getAreas(user.uid);
    setAreas(updated);
  };

  const handleDeleteArea = async (areaId: string) => {
    if (!user) return;
    await deleteArea(user.uid, areaId);
    const updatedAreas = await getAreas(user.uid);
    const updatedSessions = await getSessions(user.uid);
    setAreas(updatedAreas);
    setSessions(updatedSessions);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    await deleteSession(user.uid, sessionId);
    const updated = await getSessions(user.uid);
    setSessions(updated);
  };

  const handleUpdateProfile = async (name: string, notificationsEnabled: boolean) => {
    if (!user || !profile) return;
    const updated: UserProfile = {
      ...profile,
      name,
      notificationsEnabled,
      preset: uiPreset
    };
    await saveUserProfile(user.uid, updated);
    setProfile(updated);
  };

  // Render Loader spinner until auth hooks respond
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#0f1e35] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-xs font-mono text-slate-400">Loading GenFlow Hub...</p>
      </div>
    );
  }

  // Triage: 1. Auth required
  if (!user || !profile) {
    if (onboardingRequired && user) {
      return (
        <div className={`min-h-screen transition-all-300 duration-500 bg-[#0f1e35] text-slate-100`}>
          <OnboardingScreen 
            userName={user.displayName || "GenFlow Explorer"} 
            onComplete={handleOnboardingComplete} 
          />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0f1e35] text-slate-100">
        <AuthScreen onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  const currentTheme = profile.theme || "dark";
  const styles = PRESETS[uiPreset];

  return (
    <div 
      id="app-root" 
      className={`min-h-screen transition-all duration-300 relative ${styles.rootContainer}`}
    >
      {/* Background visual glowing spot indicating focused environment */}
      {uiPreset === "glass" && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      )}
      {uiPreset === "zen" && (
        <div className="absolute top-[15%] left-[15%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      )}
      {uiPreset === "terminal" && (
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-[#10B981]/25 shadow-[0_0_15px_#10B981] pointer-events-none" />
      )}
      {uiPreset === "vaporwave" && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      )}

      {/* Embedded application header */}
      <Header 
        theme={currentTheme} 
        onToggleTheme={handleToggleTheme} 
        onLogout={handleLogout}
        userName={profile.name}
        isSimulated={!isFirebaseConfigured}
        activePreset={uiPreset}
        onSelectPreset={handleSelectPreset}
        isBentoDashboard={isBentoDashboard}
        onToggleBento={handleToggleBento}
      />

      {globalLoading ? (
        <div className="flex h-screen items-center justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* 1. Responsive Bento Grid Dashboard for widescreen views */}
          {isBentoDashboard ? (
            <div className="hidden md:grid grid-cols-12 gap-6 max-w-7xl mx-auto pt-24 px-6 min-h-[calc(100vh-80px)] pb-12 relative z-10 transition-all duration-500">
              {/* Left Column: Home Overview Stats & Quick focus launching (col-span-4) */}
              <div className="col-span-4 space-y-6">
                <div className="sticky top-24 space-y-4">
                  <div className={`p-5 rounded-3xl ${styles.card}`}>
                    <HomeScreen 
                      userProfile={profile} 
                      areas={areas} 
                      sessions={sessions} 
                      onStartSession={handleQuickStartSession} 
                      onNavigate={(tab) => {
                        handleToggleBento(); // switch tabs on click
                        setActiveTab(tab);
                      }}
                      onUpdateProfile={handleUpdateProfile}
                      onToggleTheme={handleToggleTheme}
                      onLogout={handleLogout}
                      activePreset={uiPreset}
                      onSelectPreset={handleSelectPreset}
                    />
                  </div>
                </div>
              </div>

              {/* Center Column: Interactive Focus Hourglass Timer & Sound Mixer (col-span-5) */}
              <div className="col-span-5 space-y-4">
                <div className={`p-6 rounded-3xl ${styles.card} min-h-[580px] flex flex-col justify-between`}>
                  <SessionScreen 
                    uid={user.uid}
                    areas={areas}
                    defaultArea={preselectedAreaForSession}
                    onSaveSession={handleCommitSession}
                    onNavigate={(tab) => {
                      setPreselectedAreaForSession(undefined);
                      // In bento view, we stay inside dashboard on save
                    }}
                    userProfile={profile}
                    activePreset={uiPreset}
                  />
                </div>
              </div>

              {/* Right Column: Reflect Analytics Logs, Timeline history, & Goal Progression (col-span-3) */}
              <div className="col-span-3 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 no-scrollbar">
                <div className={`p-4 rounded-3xl ${styles.card}`}>
                  <AreasScreen 
                    areas={areas} 
                    onSaveArea={handleSaveArea} 
                    onDeleteArea={handleDeleteArea}
                    activePreset={uiPreset}
                  />
                </div>
                <div className={`p-4 rounded-3xl ${styles.card}`}>
                  <ReflectScreen 
                    uid={user.uid}
                    areas={areas} 
                    sessions={sessions} 
                    onDeleteSession={handleDeleteSession}
                    activePreset={uiPreset}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {/* 2. Cozy Tabbed view for mobile screens OR if widescreen bento is explicitly disabled */}
          <main className={`max-w-md mx-auto pt-20 px-4 min-h-[calc(100vh-128px)] relative z-10 ${
            isBentoDashboard ? "md:hidden" : ""
          }`}>
            {activeTab === "home" && (
              <HomeScreen 
                userProfile={profile} 
                areas={areas} 
                sessions={sessions} 
                onStartSession={handleQuickStartSession} 
                onNavigate={(tab) => setActiveTab(tab)}
                onUpdateProfile={handleUpdateProfile}
                onToggleTheme={handleToggleTheme}
                onLogout={handleLogout}
                activePreset={uiPreset}
                onSelectPreset={handleSelectPreset}
              />
            )}

            {activeTab === "session" && (
              <SessionScreen 
                uid={user.uid}
                areas={areas}
                defaultArea={preselectedAreaForSession}
                onSaveSession={handleCommitSession}
                onNavigate={(tab) => {
                  setPreselectedAreaForSession(undefined);
                  setActiveTab(tab);
                }}
                userProfile={profile}
                activePreset={uiPreset}
              />
            )}

            {activeTab === "areas" && (
              <AreasScreen 
                areas={areas} 
                onSaveArea={handleSaveArea} 
                onDeleteArea={handleDeleteArea}
                activePreset={uiPreset}
              />
            )}

            {activeTab === "reflect" && (
              <ReflectScreen 
                uid={user.uid}
                areas={areas} 
                sessions={sessions} 
                onDeleteSession={handleDeleteSession}
                activePreset={uiPreset}
              />
            )}
          </main>
        </>
      )}

      {/* Global Bottom Tab navigation bar (Hidden on Bento Dashboard to avoid visual layout clutter) */}
      <div className={isBentoDashboard ? "md:hidden" : ""}>
        <BottomNavbar activeTab={activeTab} onChangeTab={setActiveTab} activePreset={uiPreset} />
      </div>
      {showConfetti && <Confetti />}
    </div>
  );
}
