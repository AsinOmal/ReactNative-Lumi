/**
 * LumiVisionOCR.m
 *
 * ObjC bridge that exposes the LumiVisionOCR Swift class to React Native.
 * This file MUST be inside the Lumi Xcode target for the module to be
 * registered.
 */

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (LumiVisionOCR, NSObject)

RCT_EXTERN_METHOD(recognizeText : (NSString *)imagePath resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject)

@end
