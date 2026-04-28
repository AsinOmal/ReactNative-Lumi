export interface RemoteModelEntry {
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
