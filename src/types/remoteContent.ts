export interface RemoteModelEntry {
  word: string;
  syllables: string[];
  audioUrl: string;
  modelUrl: string;
  audioRef: string;
  modelRef: string;
  scale: number;
  positionY: number;
  // Z offset in metres (negative = forward from camera). Optional for legacy
  // docs; modelRegistry defaults to -1.0 when missing.
  positionZ?: number;
  packId: string;
  isCalibrated: boolean;
}

export interface RemotePack {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  accentColor: string;
  accentColorTo: string;
  wordCount: number;
  words: string[];
  isPublished: boolean;
}

export interface BannerConfig {
  message: string;
  accentColor: string;
  expiresAt: Date;
  isActive: boolean;
}

export interface RemoteAppConfig {
  maintenanceMode: boolean;
  newUserOnboarding: boolean;
  premiumPacksEnabled: boolean;
  arGamesEnabled: boolean;
}
