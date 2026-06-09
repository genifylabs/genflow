export interface UserProfile {
  name: string;
  email: string;
  createdAt: string; // ISO String
  theme: "light" | "dark";
  longestSession?: number; // in seconds
  notificationsEnabled?: boolean;
  preset?: string; // stored ui preset name
}

export interface Area {
  id?: string;
  name: string;
  emoji: string;
  color: string; // hex or tailwind class
  weeklyGoal: number; // in minutes
  createdAt: string; // ISO String
}

export interface Session {
  id?: string;
  areaId: string;
  areaName: string;
  areaColor: string;
  areaEmoji: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  duration: number; // in minutes (endTime - startTime in minutes, rounded)
  note?: string; // optional short reflection
  tag?: string; // optional focus tag
  date: string; // YYYY-MM-DD
}

export interface Goal {
  id?: string;
  areaId: string;
  weeklyTarget: number; // in minutes
  updatedAt: string; // ISO String
}

export type ActiveTab = "home" | "session" | "areas" | "reflect";
