import React, { useState, useEffect } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroAnimations,
  ViroNode,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';

export const ARWordScene = (props: any) => {
  const word: string = props?.sceneNavigator?.viroAppProps?.word ?? 'apple';
  const onModelLoaded: (() => void) | undefined = props?.sceneNavigator?.viroAppProps?.onModelLoaded;
  const [modelError, setModelError] = useState(false);
  const [animReady, setAnimReady] = useState(false);

  // Register animations AFTER mount so the native bridge is ready
  useEffect(() => {
    ViroAnimations.registerAnimations({
      rotate: {
        properties: { rotateY: '+=360' },
        duration: 5000,
        easing: 'Linear',
      },
    });
    setAnimReady(true);
  }, []);

  const modelEntry = getModel(word);

  const handleModelLoaded = () => {
    if (onModelLoaded) onModelLoaded();
  };

  const handleModelError = (event: any) => {
    console.warn('AR Model load error:', event);
    setModelError(true);
  };

  return (
    <ViroARScene>
      {/* Lighting — strong ambient + directional to illuminate all model surfaces */}
      <ViroAmbientLight color="#ffffff" intensity={500} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.2]}
        intensity={500}
        castsShadow={false}
      />
      <ViroDirectionalLight
        color="#fffbe6"
        direction={[0.5, -0.5, -1]}
        intensity={300}
        castsShadow={false}
      />

      {/* 3D Model */}
      {modelEntry && !modelError && animReady && (
        <ViroNode
          position={modelEntry.position}
          animation={{ name: 'rotate', run: true, loop: true }}
        >
          <Viro3DObject
            source={modelEntry.source}
            type="GLB"
            scale={modelEntry.scale}
            onLoadEnd={handleModelLoaded}
            onError={handleModelError}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
};
