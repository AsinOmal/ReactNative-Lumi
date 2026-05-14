// 📖 What this does:
// ViroARScene that uses ViroARPlaneSelector for horizontal surface detection.
// When the user taps a detected plane the model anchors flat on the surface
// (positionY = 0 — the stored registry positionY is only for fixed-world mode).
// onPlaneSelected is passed via viroAppProps and uses the double-ref pattern
// (CLAUDE.md constraint) so the callback never goes stale after state changes.

import React, { useEffect, useRef } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroARPlaneSelector,
  ViroNode,
  Viro3DObject,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';

export const PlacementScene = (props: any) => {
  const word: string = props?.sceneNavigator?.viroAppProps?.word ?? 'apple';
  const onPlaneSelectedProp: (() => void) | undefined =
    props?.sceneNavigator?.viroAppProps?.onPlaneSelected;

  useEffect(() => {
    console.log('[PlacementScene] mounted — word:', word);
    return () => console.log('[PlacementScene] unmounted');
  }, []);

  // Double-ref pattern: viroAppProps is read once at mount, so any callback
  // passed through it becomes stale after the first state change. Store the
  // latest value in a ref, expose a stable wrapper that reads from the ref.
  const onPlaneSelectedRef = useRef<(() => void) | undefined>(onPlaneSelectedProp);
  useEffect(() => { onPlaneSelectedRef.current = onPlaneSelectedProp; }, [onPlaneSelectedProp]);
  const stableOnPlaneSelected = useRef(() => onPlaneSelectedRef.current?.()).current;

  const modelEntry = getModel(word);
  if (!modelEntry) return null;

  const scale = modelEntry.scale;

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={700} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={500} castsShadow={false} />

      <ViroARPlaneSelector
        minHeight={0.1}
        minWidth={0.1}
        alignment="Horizontal"
        onPlaneSelected={stableOnPlaneSelected}
      >
        {/* positionY = 0: model sits flat on the detected surface */}
        <ViroNode position={[0, 0, 0]} scale={scale}>
          <Viro3DObject
            source={modelEntry.source}
            type="GLB"
            onError={(e: any) => console.warn('[PlacementScene] model error:', e)}
          />
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};
