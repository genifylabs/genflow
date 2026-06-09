import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, Area, Session, Goal } from './types';
import appletConfig from './firebase-applet-config.json';

// Detect if Firebase is configured in /src/firebase-applet-config.json
export const isFirebaseConfigured = !!(appletConfig.apiKey && appletConfig.apiKey !== "");

// Inbound fallback simulated state to allow dynamic testing inside AI Studio iframe if keys are empty
let mockProfile: UserProfile = {
  name: "GenFlow Pioneer",
  email: "pioneer@genify.io",
  createdAt: new Date().toISOString(),
  theme: "dark",
  preset: "glass"
};

let mockAreas: Area[] = [
  { id: "a1", name: "Coding & Design", emoji: "💻", color: "#2563eb", weeklyGoal: 120, createdAt: new Date().toISOString() },
  { id: "a2", name: "Gym & Strength", emoji: "🏋️", color: "#ec4899", weeklyGoal: 90, createdAt: new Date().toISOString() },
  { id: "a3", name: "Reading Habits", emoji: "📚", color: "#10b981", weeklyGoal: 60, createdAt: new Date().toISOString() }
];

let mockSessions: Session[] = [
  {
    id: "s1",
    areaId: "a1",
    areaName: "Coding & Design",
    areaColor: "#2563eb",
    areaEmoji: "💻",
    startTime: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    duration: 60,
    note: "Crafted the premium frosted glassmorphism shell.",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: "s2",
    areaId: "a1",
    areaName: "Coding & Design",
    areaColor: "#2563eb",
    areaEmoji: "💻",
    startTime: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 24 * 1.4).toISOString(),
    duration: 45,
    note: "Refining responsive mobile tap targets and layout spacing.",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },
  {
    id: "s3",
    areaId: "a2",
    areaName: "Gym & Strength",
    areaColor: "#ec4899",
    areaEmoji: "🏋️",
    startTime: new Date(Date.now() - 3600000 * 24 * 3.5).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 24 * 3.4).toISOString(),
    duration: 40,
    note: "Focus on leg press and squats today. Feeling super energized.",
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]
  },
  {
    id: "s4",
    areaId: "a3",
    areaName: "Reading Habits",
    areaColor: "#10b981",
    areaEmoji: "📚",
    startTime: new Date(Date.now() - 3600000 * 5.2).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 4.8).toISOString(),
    duration: 24,
    note: "Reading through Atomic Habits. Making slow, 1% improvements.",
    date: new Date().toISOString().split('T')[0]
  }
];

let mockGoals: Goal[] = [
  { id: "g1", areaId: "a1", weeklyTarget: 120, updatedAt: new Date().toISOString() },
  { id: "g2", areaId: "a2", weeklyTarget: 90, updatedAt: new Date().toISOString() },
  { id: "g3", areaId: "a3", weeklyTarget: 60, updatedAt: new Date().toISOString() }
];

// ==========================================
// USER PROFILE SERVICES
// ==========================================
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) {
    return mockProfile;
  }
  const path = `users/${uid}/profile/info`;
  try {
    const docSnap = await getDoc(doc(db, path));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured) {
    mockProfile = profile;
    return;
  }
  const path = `users/${uid}/profile/info`;
  try {
    const profileData: any = {
      name: profile.name,
      email: profile.email,
      createdAt: profile.createdAt,
      theme: profile.theme
    };
    if (profile.preset !== undefined) {
      profileData.preset = profile.preset;
    }
    if (profile.longestSession !== undefined) {
      profileData.longestSession = profile.longestSession;
    }
    if (profile.notificationsEnabled !== undefined) {
      profileData.notificationsEnabled = profile.notificationsEnabled;
    }
    await setDoc(doc(db, path), profileData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserTheme(uid: string, theme: "light" | "dark"): Promise<void> {
  if (!isFirebaseConfigured) {
    mockProfile = { ...mockProfile, theme };
    return;
  }
  const path = `users/${uid}/profile/info`;
  try {
    await updateDoc(doc(db, path), { theme });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================
// AREAS SERVICES
// ==========================================
export async function getAreas(uid: string): Promise<Area[]> {
  if (!isFirebaseConfigured) {
    return mockAreas;
  }
  const path = `users/${uid}/areas`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Area));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveArea(uid: string, area: Area): Promise<string> {
  if (!isFirebaseConfigured) {
    const id = area.id || "a_" + Math.random().toString(36).substr(2, 9);
    const newArea = { ...area, id };
    const idx = mockAreas.findIndex(a => a.id === id);
    if (idx >= 0) {
      mockAreas[idx] = newArea;
    } else {
      mockAreas.push(newArea);
    }
    return id;
  }
  const id = area.id || doc(collection(db, `users/${uid}/areas`)).id;
  const path = `users/${uid}/areas/${id}`;
  try {
    await setDoc(doc(db, path), {
      name: area.name,
      emoji: area.emoji,
      color: area.color,
      weeklyGoal: area.weeklyGoal,
      createdAt: area.createdAt
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return id;
  }
}

export async function deleteArea(uid: string, areaId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    mockAreas = mockAreas.filter(a => a.id !== areaId);
    mockGoals = mockGoals.filter(g => g.areaId !== areaId);
    mockSessions = mockSessions.filter(s => s.areaId !== areaId);
    return;
  }
  const path = `users/${uid}/areas/${areaId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// SESSIONS SERVICES
// ==========================================
export async function getSessions(uid: string): Promise<Session[]> {
  if (!isFirebaseConfigured) {
    return mockSessions;
  }
  const path = `users/${uid}/sessions`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    // Sort client-side for consistent ordering
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Session))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveSession(uid: string, session: Session): Promise<string> {
  if (!isFirebaseConfigured) {
    const id = session.id || "s_" + Math.random().toString(36).substr(2, 9);
    const newSession = { ...session, id };
    mockSessions.unshift(newSession);
    return id;
  }
  const id = session.id || doc(collection(db, `users/${uid}/sessions`)).id;
  const path = `users/${uid}/sessions/${id}`;
  try {
    const sessionData: any = {
      areaId: session.areaId,
      areaName: session.areaName,
      areaColor: session.areaColor,
      areaEmoji: session.areaEmoji,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      date: session.date
    };
    if (session.note && session.note.trim() !== "") {
      sessionData.note = session.note.trim();
    }
    if (session.tag && session.tag.trim() !== "") {
      sessionData.tag = session.tag.trim();
    }
    await setDoc(doc(db, path), sessionData);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return id;
  }
}

export async function deleteSession(uid: string, sessionId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    mockSessions = mockSessions.filter(s => s.id !== sessionId);
    return;
  }
  const path = `users/${uid}/sessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// WEEKLY GOALS SERVICES
// ==========================================
export async function getGoals(uid: string): Promise<Goal[]> {
  if (!isFirebaseConfigured) {
    return mockGoals;
  }
  const path = `users/${uid}/goals`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveGoal(uid: string, goal: Goal): Promise<string> {
  if (!isFirebaseConfigured) {
    const id = goal.id || "g_" + Math.random().toString(36).substr(2, 9);
    const newGoal = { ...goal, id };
    const idx = mockGoals.findIndex(g => g.areaId === goal.areaId);
    if (idx >= 0) {
      mockGoals[idx] = newGoal;
    } else {
      mockGoals.push(newGoal);
    }
    return id;
  }
  const id = goal.id || doc(collection(db, `users/${uid}/goals`)).id;
  const path = `users/${uid}/goals/${id}`;
  try {
    await setDoc(doc(db, path), {
      areaId: goal.areaId,
      weeklyTarget: goal.weeklyTarget,
      updatedAt: goal.updatedAt
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return id;
  }
}
