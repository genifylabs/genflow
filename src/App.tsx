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
import AuthScreen from './components/AuthScreen';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import SessionScreen from './components/SessionScreen';
import AreasScreen from './components/AreasScreen';
import ReflectScreen from './components/ReflectScreen';
import { Header, BottomNavbar } from './components/Navigation';
import { Sparkles, Loader2 } from 'lucide-react';

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
      theme: "dark"
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
  const handleCommitSession = async (session: Session) => {
    if (!user) return;
    await saveSession(user.uid, session);
    const updated = await getSessions(user.uid);
    setSessions(updated);
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

  return (
    <div 
      id="app-root" 
      className={`min-h-screen transition-all duration-300 relative ${
        currentTheme === "light" 
          ? "bg-[#f5f7fa] text-slate-800" 
          : "bg-[#0f1e35] text-slate-100"
      }`}
    >
      {/* Background visual glowing spot indicating focused environment */}
      {currentTheme === "dark" ? (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      ) : (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />
      )}

      {/* Embedded application header */}
      <Header 
        theme={currentTheme} 
        onToggleTheme={handleToggleTheme} 
        onLogout={handleLogout}
        userName={profile.name}
        isSimulated={!isFirebaseConfigured}
      />

      {/* Main Container view with adaptive offsets */}
      <main className="max-w-md mx-auto pt-20 px-4 min-h-[calc(100vh-128px)] relative z-10">
        {globalLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {activeTab === "home" && (
              <HomeScreen 
                userProfile={profile} 
                areas={areas} 
                sessions={sessions} 
                onStartSession={handleQuickStartSession} 
                onNavigate={(tab) => setActiveTab(tab)}
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
              />
            )}

            {activeTab === "areas" && (
              <AreasScreen 
                areas={areas} 
                onSaveArea={handleSaveArea} 
                onDeleteArea={handleDeleteArea}
              />
            )}

            {activeTab === "reflect" && (
              <ReflectScreen 
                uid={user.uid}
                areas={areas} 
                sessions={sessions} 
                onDeleteSession={handleDeleteSession}
              />
            )}
          </>
        )}
      </main>

      {/* Global Bottom Tab navigation bar */}
      <BottomNavbar activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
