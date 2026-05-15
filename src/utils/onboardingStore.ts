import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hasSeenOnboarding';
const CHILD_INFO_KEY = 'hasSeenChildInfoScreen';

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

export async function getChildInfoSeen(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(CHILD_INFO_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function markChildInfoSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(CHILD_INFO_KEY, 'true');
  } catch (e) {
    console.error('[onboardingStore] markChildInfoSeen:', e);
  }
}
