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

  console.log('[VisionOCR] 📸 recognizing:', posixPath.split('/').pop());

  try {
    const text: string = await LumiVisionOCR.recognizeText(posixPath);
    console.log('[VisionOCR] ✅ raw text:', JSON.stringify(text?.slice(0, 120)));
    return text ?? '';
  } catch (e) {
    console.warn('[VisionOCR] ❌ Recognition error:', e);
    return '';
  }
}
