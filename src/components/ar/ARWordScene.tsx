import React, { useState } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroAnimations,
  ViroNode,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';

// Register animations
ViroAnimations.registerAnimations({
  floatUp: {
    properties: { positionY: '+=0.05' },
    duration: 1200,
    easing: 'EaseInEaseOut',
  },
  floatDown: {
    properties: { positionY: '-=0.05' },
    duration: 1200,
    easing: 'EaseInEaseOut',
  },
  rotate: {
    properties: { rotateY: '+=360' },
    duration: 6000,
    easing: 'Linear',
  },
  scaleIn: {
    properties: { scaleX: 1, scaleY: 1, scaleZ: 1 },
    duration: 500,
    easing: 'Bounce',
  },
});

interface ARWordSceneProps {
  sceneNavigator: {
    viroAppProps: {
      word: string;
      onModelLoaded?: () => void;
    };
  };
}

export const ARWordScene = (props: any) => {
  const word: string = props?.sceneNavigator?.viroAppProps?.word ?? 'apple';
  const onModelLoaded: (() => void) | undefined = props?.sceneNavigator?.viroAppProps?.onModelLoaded;
  const [modelError, setModelError] = useState(false);

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
      {/* Lighting */}
      <ViroAmbientLight color="#ffffff" intensity={200} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.2]}
        intensity={300}
        castsShadow
      />

      {/* 3D Model */}
      {modelEntry && !modelError && (
        <ViroNode position={[0, -0.2, -1.5]}>
          <Viro3DObject
            source={modelEntry.source}
            type="GLB"
            scale={modelEntry.scale}
            onLoadEnd={handleModelLoaded}
            onError={handleModelError}
            animation={{ name: 'rotate', run: true, loop: true }}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
};
