/**
 * useHazardDetection.ts
 *
 * Runs a periodic image classification loop to detect hazardous content
 * in the camera feed and surfaces an alert when a match is found.
 *
 * Why a separate interval from useScanOCR (not piggybacking on the OCR loop):
 *   OCR runs at 1s for snappy word matching. Hazard detection runs at 5s —
 *   VNClassifyImageRequest is heavier than VNRecognizeTextRequest and we don't
 *   need sub-second responsiveness for safety alerts. Separating them keeps
 *   the OCR loop tight and lets us pause/tune each independently.
 *
 * Why a 30s cooldown after dismiss:
 *   Without cooldown the alert re-fires every 5s if the hazard stays in frame.
 *   The child would be stuck in an infinite dismiss loop. 30s is enough time
 *   for a child to move away without the alert feeling like it disappeared.
 *
 * The hook only runs when isActive is true — caller must pass false when the
 * screen is backgrounded or not focused to avoid wasted classification calls.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera } from 'react-native-vision-camera';
import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { classifyFrameForHazards } from '../utils/visionOCR';
import { config } from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';

interface UseHazardDetectionProps {
  cameraRef: React.RefObject<Camera>;
  isActive: boolean; // false when backgrounded or screen unfocused
}

interface UseHazardDetectionResult {
  currentHazard: string | null; // matched label, or null when safe
  dismissHazard: () => void;
}

export const useHazardDetection = ({
  cameraRef,
  isActive,
}: UseHazardDetectionProps): UseHazardDetectionResult => {
  const [currentHazard, setCurrentHazard] = useState<string | null>(null);
  const isClassifying = useRef(false);
  const cooldownUntilRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runClassification = useCallback(async () => {
    if (!cameraRef.current || isClassifying.current) {
      return;
    }
    if (Date.now() < cooldownUntilRef.current) {
      return;
    } // in cooldown

    isClassifying.current = true;
    try {
      const snapshot = await cameraRef.current.takePhoto({
        enableShutterSound: false,
      });
      const labels = await classifyFrameForHazards(snapshot.path);

      const matched = labels.find((label) =>
        config.HAZARD_KEYWORDS.some((keyword) =>
          label.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (matched) {
        setCurrentHazard(matched);
        // Start cooldown so re-classify doesn't immediately re-trigger after dismiss
        cooldownUntilRef.current = Date.now() + config.HAZARD_COOLDOWN_MS;
        const uid = useAuthStore.getState().user?.uid;
        if (uid) {
          addDoc(
            collection(
              getFirestore(getApp()),
              'users',
              uid,
              'hazardEvents'
            ) as any,
            {
              label: matched,
              detectedAt: serverTimestamp(),
              dismissed: false,
            }
          ).catch(() => {});
        }
      }
    } catch {
      // Silently ignore — camera may not be ready
    } finally {
      isClassifying.current = false;
    }
  }, [cameraRef]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(
      runClassification,
      config.HAZARD_CHECK_INTERVAL_MS
    );
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, runClassification]);

  const dismissHazard = useCallback(() => {
    setCurrentHazard(null);
    // Cooldown was already set when the hazard was detected — no need to reset it here
  }, []);

  return { currentHazard, dismissHazard };
};
