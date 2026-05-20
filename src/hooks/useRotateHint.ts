// 📖 What this does:
// Reveals the "Swipe to rotate" hint as soon as the model finishes loading
// and keeps it on screen — kids forget the gesture and a persistent label
// removes the discoverability bug. No timer, no dismissal.
export const useRotateHint = (ready: boolean): boolean => ready;
