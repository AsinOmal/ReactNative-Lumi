import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';
import { config } from '../../constants/config';
import type { RotationApi } from '../../hooks/useSwipeRotation';

// Animations registered in index.js at startup.
// Rotation is driven by a screen-level swipe (useSwipeRotation): the scene
// publishes applyDelta/commit onto the ref passed via viroAppProps and the
// PanResponder above pumps gesture deltas into it. First swipe stops the
// auto-spin and the model follows the finger thereafter.

export const ARWordScene = (props: any) => {
  const word: string = props?.sceneNavigator?.viroAppProps?.word ?? 'apple';
  const onModelLoaded: (() => void) | undefined =
    props?.sceneNavigator?.viroAppProps?.onModelLoaded;
  const onModelError: (() => void) | undefined =
    props?.sceneNavigator?.viroAppProps?.onModelError;
  const rotationApiRef: MutableRefObject<RotationApi | null> | undefined =
    props?.sceneNavigator?.viroAppProps?.rotationApiRef;
  const [modelError, setModelError] = useState(false);

  const [isManual, setIsManual] = useState(false);
  const [rotY, setRotY] = useState(0);
  const startRotY = useRef(0);
  // Ref mirror of isManual so the rotation-API closure stays stable across
  // renders — re-binding the api on every state flip would mid-gesture race.
  const isManualRef = useRef(false);

  useEffect(() => {
    if (!rotationApiRef) {
      return;
    }
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

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={600} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.2]}
        intensity={600}
        castsShadow={false}
      />
      <ViroDirectionalLight
        color="#fff5e0"
        direction={[1, -0.5, -1]}
        intensity={400}
        castsShadow={false}
      />
      <ViroDirectionalLight
        color="#e0f0ff"
        direction={[-1, -0.5, -1]}
        intensity={300}
        castsShadow={false}
      />

      {modelEntry && !modelError && (
        <ViroNode
          position={modelEntry.position}
          rotation={isManual ? [0, rotY, 0] : [0, 0, 0]}
          animation={{ name: 'rotate', run: !isManual, loop: true }}
        >
          <Viro3DObject
            source={modelEntry.source}
            type="GLB"
            scale={modelEntry.scale}
            onLoadEnd={() => onModelLoaded?.()}
            onError={(e: any) => {
              console.warn('AR model error:', e);
              setModelError(true);
              onModelError?.();
            }}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
};
