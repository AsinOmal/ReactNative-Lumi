import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hasSeenOnboarding';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, 'true');
  } catch (e) {
    console.error('[onboardingStore] markOnboardingDone:', e);
  }
}
