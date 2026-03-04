/**
 * LumiVisionOCR.swift
 *
 * Uses Apple's Vision Framework (VNRecognizeTextRequest) for on-device
 * text recognition. No external dependencies — uses what's built into iOS 13+.
 *
 * Exposed to React Native via LumiVisionOCR.m bridge.
 */

import Foundation
import Vision
import UIKit

@objc(LumiVisionOCR)
class LumiVisionOCR: NSObject {

  /// Recognizes text in an image file at the given path.
  /// - Parameters:
  ///   - imagePath: Absolute path to the image file (JPEG or PNG)
  ///   - resolve: RN promise resolve with recognized text string
  ///   - reject: RN promise reject on error
  @objc
  func recognizeText(
    _ imagePath: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let image = UIImage(contentsOfFile: imagePath),
          let cgImage = image.cgImage else {
      reject("E_IMAGE", "Cannot load image at path: \(imagePath)", nil)
      return
    }

    let request = VNRecognizeTextRequest { request, error in
      if let error = error {
        reject("E_OCR", error.localizedDescription, error)
        return
      }

      let observations = request.results as? [VNRecognizedTextObservation] ?? []
      let lines = observations.compactMap { $0.topCandidates(1).first?.string }
      resolve(lines.joined(separator: "\n"))
    }

    // Fast recognition is good enough for clear printed text (books, labels)
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false // skip language model for speed
    request.recognitionLanguages = ["en-US"]

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        try handler.perform([request])
      } catch {
        reject("E_OCR", error.localizedDescription, error)
      }
    }
  }

  /// Required for RCT_EXTERN_MODULE — must return true to allow background threading
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
