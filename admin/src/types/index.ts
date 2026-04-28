export interface AdminUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  accentColor: string;
  accentColorTo: string;
  wordCount: number;
  words: string[];
  isPublished: boolean;
  publishedAt?: Date;
  coverImageUrl?: string;
  coverImageRef?: string;
}

export interface ModelEntry {
  word: string;
  syllables: string[];
  audioUrl: string;
  modelUrl: string;
  audioRef: string;
  modelRef: string;
  scale: number;
  positionY: number;
  packId: string;
  isCalibrated: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastActive: Date;
  wordCount: number;
  streak: number;
  suspended: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeToday: number;
  wordsSaved: number;
  wordsSavedThisWeek: number;
  gamesPlayed: number;
  achievementsUnlocked: number;
  flaggedEvents: number;
}

export interface FlaggedEvent {
  id: string;
  uid: string;
  userEmail: string;
  word: string;
  timestamp: Date;
  reviewed: boolean;
}

export interface FeedbackItem {
  id: string;
  uid: string;
  email: string;
  message: string;
  appVersion: string;
  submittedAt: Date;
  isRead: boolean;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  badge?: number;
}

export interface NotificationBroadcast {
  id: string;
  title: string;
  body: string;
  sentAt: Date;
  sentBy: string;
  recipientCount?: number;
  status?: string;
}

export interface AppConfig {
  maintenanceMode: boolean;
  newUserOnboarding: boolean;
  premiumPacksEnabled: boolean;
  arGamesEnabled: boolean;
}

export interface Purchase {
  uid: string;
  productId: string;
  purchasedAt: Date;
}
