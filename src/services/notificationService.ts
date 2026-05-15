// 📖 What this does:
// Schedules a local notification at 8pm each day if the user hasn't scanned a word yet.
// On successful scan, the pending reminder is cancelled.
// Uses @notifee/react-native — local only, no APNs server required.
// Requires: pod install + Push Notifications capability in Xcode.

import { Platform } from 'react-native';
import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyWord } from '../utils/dailyWordHunt';

const NOTIF_ID = 'streak_reminder';
const LAST_SCAN_KEY = 'lastScanDate';
const REMINDER_HOUR = 20; // 8pm

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function requestNotificationPermission(): Promise<void> {
  try {
    await notifee.requestPermission();
  } catch (e) {
    console.error('[notificationService] requestPermission:', e);
  }
}

export async function recordScanToday(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SCAN_KEY, todayKey());
    await notifee.cancelTriggerNotification(NOTIF_ID);
  } catch (e) {
    console.error('[notificationService] recordScanToday:', e);
  }
}

export async function scheduleStreakReminder(): Promise<void> {
  try {
    const lastScan = await AsyncStorage.getItem(LAST_SCAN_KEY);
    if (lastScan === todayKey()) {
      return;
    } // already scanned today — nothing to remind

    const fireAt = new Date();
    fireAt.setHours(REMINDER_HOUR, 0, 0, 0);
    if (fireAt.getTime() <= Date.now()) {
      fireAt.setDate(fireAt.getDate() + 1); // past 8pm — roll to tomorrow
    }

    // Android requires a channel
    await notifee.createChannel({
      id: 'streak',
      name: 'Streak Reminders',
      importance: AndroidImportance.DEFAULT,
    });

    const dailyWord = getDailyWord();
    const display = dailyWord.charAt(0).toUpperCase() + dailyWord.slice(1);

    await notifee.createTriggerNotification(
      {
        id: NOTIF_ID,
        title: "Don't break your streak!",
        body: `Find today's word: ${display}`,
        android: { channelId: 'streak', pressAction: { id: 'default' } },
      },
      { type: TriggerType.TIMESTAMP, timestamp: fireAt.getTime() }
    );
  } catch (e) {
    console.error('[notificationService] scheduleStreakReminder:', e);
  }
}

// 📖 What this does:
// On iOS, getToken() throws messaging/unregistered until the device is registered for remote
// messages via APNs. Newer @react-native-firebase versions no longer auto-register — we must
// call registerDeviceForRemoteMessages() and request notification permission first.
// requestPermission() is also iOS-only; on Android the Firebase Messaging SDK uses the system
// notification permission granted at install/runtime by notifee.
export const registerFcmToken = async (uid: string): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }
      const status = await messaging().requestPermission();
      const authorized =
        status === messaging.AuthorizationStatus.AUTHORIZED ||
        status === messaging.AuthorizationStatus.PROVISIONAL;
      if (!authorized) {
        return;
      }
    }
    const token = await messaging().getToken();
    await firestore().collection('users').doc(uid).update({ fcmToken: token });
  } catch (e) {
    console.error('[notificationService] FCM token registration failed:', e);
  }
};

// Returns an unsubscribe function — call it on sign-out or component unmount.
export const setupTokenRefresh = (uid: string): (() => void) => {
  return messaging().onTokenRefresh(async (token) => {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .update({ fcmToken: token });
    } catch (e) {
      console.error('[notificationService] FCM token refresh write failed:', e);
    }
  });
};
