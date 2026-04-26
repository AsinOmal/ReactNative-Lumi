/**
 * VisionOCR.ts
 * JavaScript wrapper around the native LumiVisionOCR Swift module.
 *
 * Usage:
 *   const text = await recognizeTextInImage('/path/to/snapshot.jpg');
 */

import { NativeModules, Platform } from 'react-native';

const { LumiVisionOCR } = NativeModules;

/**
 * Runs Apple's Vision Framework text recognition on a local image file.
 * Returns the recognized text as a single string (lines joined with '\n').
 * Returns empty string if the module is not available or on Android.
 */
export async function recognizeTextInImage(imagePath: string): Promise<string> {
  if (Platform.OS !== 'ios') return '';

  if (!LumiVisionOCR) {
    console.warn('[VisionOCR] ❌ Native module LumiVisionOCR not found — rebuild required');
    return '';
  }

  // vision-camera gives a file:// URI; UIImage(contentsOfFile:) needs a POSIX path
  const posixPath = imagePath.startsWith('file://')
    ? decodeURIComponent(imagePath.replace('file://', ''))
    : imagePath;

  try {
    const text: string = await LumiVisionOCR.recognizeText(posixPath);
    return text ?? '';
  } catch (e) {
    console.warn('[VisionOCR] ❌ Recognition error:', e);
    return '';
  }
}

/**
 * Runs Apple's Vision image classification on a local snapshot.
 * Returns an array of classification label strings that exceeded the 0.5
 * confidence threshold inside the Swift module.
 * Returns empty array if unavailable or on Android.
 */
export async function classifyFrameForHazards(imagePath: string): Promise<string[]> {
  if (Platform.OS !== 'ios') return [];

  if (!LumiVisionOCR || typeof LumiVisionOCR.classifyFrameForHazards !== 'function') {
    console.warn('[VisionOCR] ❌ classifyFrameForHazards unavailable — rebuild required');
    return [];
  }

  const posixPath = imagePath.startsWith('file://')
    ? decodeURIComponent(imagePath.replace('file://', ''))
    : imagePath;

  try {
    const labels: string[] = await LumiVisionOCR.classifyFrameForHazards(posixPath);
    return labels ?? [];
  } catch (e) {
    console.warn('[VisionOCR] ❌ Classification error:', e);
    return [];
  }
}
