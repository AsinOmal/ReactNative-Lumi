// 📖 What this does:
// ViroARScene that uses ViroARPlaneSelector for horizontal surface detection.
// When the user taps a detected plane the model anchors flat on the surface
// (positionY = 0 — the stored registry positionY is only for fixed-world mode).
// Rotation comes from a screen-level swipe via useSwipeRotation; the scene
// publishes its rotation setter onto rotationApiRef and the PanResponder
// above pumps deltas into it. onPlaneSelected uses the double-ref pattern
// (CLAUDE.md constraint) so the callback never goes stale after state changes.

import React, { useEffect, useRef, useState, MutableRefObject } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroARPlaneSelector,
  ViroNode,
  Viro3DObject,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';
import { config } from '../../constants/config';
import type { RotationApi } from '../../hooks/useSwipeRotation';

export const PlacementScene = (props: any) => {
  const word: string = props?.sceneNavigator?.viroAppProps?.word ?? 'apple';
  const onPlaneSelectedProp: (() => void) | undefined =
    props?.sceneNavigator?.viroAppProps?.onPlaneSelected;
  const rotationApiRef: MutableRefObject<RotationApi | null> | undefined =
    props?.sceneNavigator?.viroAppProps?.rotationApiRef;

  const onPlaneSelectedRef = useRef<(() => void) | undefined>(
    onPlaneSelectedProp
  );
  useEffect(() => {
    onPlaneSelectedRef.current = onPlaneSelectedProp;
  }, [onPlaneSelectedProp]);
  const stableOnPlaneSelected = useRef(() =>
    onPlaneSelectedRef.current?.()
  ).current;

  const [isManual, setIsManual] = useState(false);
  const [rotY, setRotY] = useState(0);
  const startRotY = useRef(0);
  const isManualRef = useRef(false);

  useEffect(() => {
    if (!rotationApiRef) return;
    rotationApiRef.current = {
      applyDelta: (dx: number) => {
        if (!isManualRef.current) {
          isManualRef.current = true;
          setIsManual(true);
        }
        setRotY(startRotY.current + dx * config.SWIPE_ROTATE_DEG_PER_PX);
      },
      commit: (dx: number) => {
        startRotY.current += dx * config.SWIPE_ROTATE_DEG_PER_PX;
        setRotY(startRotY.current);
      },
    };
  }, [rotationApiRef]);

  const modelEntry = getModel(word);
  if (!modelEntry) {
    return null;
  }

  const scale = modelEntry.scale;

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={700} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.2]}
        intensity={500}
        castsShadow={false}
      />

      <ViroARPlaneSelector
        minHeight={0.1}
        minWidth={0.1}
        alignment="Horizontal"
        onPlaneSelected={stableOnPlaneSelected}
      >
        {/* positionY = 0: model sits flat on the detected surface */}
        <ViroNode
          position={[0, 0, 0]}
          scale={scale}
          rotation={isManual ? [0, rotY, 0] : [0, 0, 0]}
          animation={{ name: 'rotate', run: !isManual, loop: true }}
        >
          <Viro3DObject
            source={modelEntry.source}
            type="GLB"
            onError={(e: any) =>
              console.warn('[PlacementScene] model error:', e)
            }
          />
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};
