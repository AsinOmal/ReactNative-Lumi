/**
 * LumiVisionOCR.swift
 *
 * Uses Apple's Vision Framework (VNRecognizeTextRequest) for on-device
 * text recognition. Crops the captured image to the center scan zone
 * before processing, matching just the reticle area visible on screen.
 */

import Foundation
import Vision
import UIKit

@objc(LumiVisionOCR)
class LumiVisionOCR: NSObject {

  @objc
  func recognizeText(
    _ imagePath: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let image = UIImage(contentsOfFile: imagePath) else {
      reject("E_IMAGE", "Cannot load image at path: \(imagePath)", nil)
      return
    }

    // Re-draw image to apply EXIF orientation — fixes rotated captures
    let correctedImage: UIImage
    if image.imageOrientation == .up {
      correctedImage = image
    } else {
      UIGraphicsBeginImageContextWithOptions(image.size, false, 1.0)
      image.draw(in: CGRect(origin: .zero, size: image.size))
      correctedImage = UIGraphicsGetImageFromCurrentImageContext() ?? image
      UIGraphicsEndImageContext()
    }

    guard let cgImage = correctedImage.cgImage else {
      reject("E_IMAGE", "Cannot get CGImage", nil)
      return
    }

    // ── Crop to centre scan zone ─────────────────────────────────────────────
    // takePhoto() captures the full camera sensor. We crop tightly to match
    // the visible on-screen scan reticle: 38% wide × 14% tall, centred.
    // This prevents picking up text above/below/beside the scan box.
    let imgW = CGFloat(cgImage.width)
    let imgH = CGFloat(cgImage.height)
    let cropW = imgW * 0.38
    let cropH = imgH * 0.14
    let cropX = (imgW - cropW) / 2
    let cropY = (imgH - cropH) / 2
    let cropRect = CGRect(x: cropX, y: cropY, width: cropW, height: cropH)

    let targetImage: CGImage
    if let cropped = cgImage.cropping(to: cropRect) {
      targetImage = cropped
    } else {
      targetImage = cgImage // fallback to full frame
    }

    // ── Run Vision OCR ────────────────────────────────────────────────────────
    let request = VNRecognizeTextRequest { request, error in
      // ── Cleanup: delete the temp snapshot immediately after reading ──────
      // takePhoto() writes ~50–200 KB per shot at 1 shot/sec — without cleanup
      // that's several MB per minute of scanning accumulating in NSTemporaryDirectory.
      defer {
        try? FileManager.default.removeItem(atPath: imagePath)
      }

      if let error = error {
        reject("E_OCR", error.localizedDescription, error)
        return
      }
      let observations = request.results as? [VNRecognizedTextObservation] ?? []
      let lines = observations.compactMap { $0.topCandidates(1).first?.string }
      resolve(lines.joined(separator: "\n"))
    }

    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false
    request.recognitionLanguages = ["en-US"]

    let handler = VNImageRequestHandler(cgImage: targetImage, options: [:])
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        try handler.perform([request])
      } catch {
        reject("E_OCR", error.localizedDescription, error)
      }
    }
  }

  // ── Hazard Classification ─────────────────────────────────────────────────
  // Runs VNClassifyImageRequest on the full frame (no crop — hazard detection
  // works better on the full scene than just the scan reticle area).
  // Returns label strings with confidence > 0.3. The threshold was 0.5 originally
  // but Apple's classifier rarely peaks that high on real-world household scenes,
  // so the alert never fired. 0.3 still filters out clear noise (most random
  // labels score < 0.1) while letting hazards like knives/candles cross.
  @objc
  func classifyFrameForHazards(
    _ imagePath: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let image = UIImage(contentsOfFile: imagePath),
          let cgImage = image.cgImage else {
      reject("E_IMAGE", "Cannot load image at path: \(imagePath)", nil)
      return
    }

    let request = VNClassifyImageRequest { request, error in
      defer {
        try? FileManager.default.removeItem(atPath: imagePath)
      }

      if let error = error {
        reject("E_CLASSIFY", error.localizedDescription, error)
        return
      }

      let observations = request.results as? [VNClassificationObservation] ?? []
      let labels = observations
        .filter { $0.confidence > 0.3 }
        .map { $0.identifier }

      #if DEBUG
      // Dev-only: log the top 5 observations so we can see what Apple's
      // taxonomy is returning for a given scene, and tune HAZARD_KEYWORDS.
      let top = observations.prefix(5).map { "\($0.identifier)=\(String(format: "%.2f", $0.confidence))" }
      NSLog("[LumiVisionOCR] classify top5: \(top.joined(separator: ", "))")
      #endif

      resolve(labels)
    }

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    DispatchQueue.global(qos: .utility).async {
      do {
        try handler.perform([request])
      } catch {
        reject("E_CLASSIFY", error.localizedDescription, error)
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
