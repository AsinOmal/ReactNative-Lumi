import React, { useState } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';

// Animations registered in index.js at startup

export const ARWordScene = (props: any) => {
  const word: string = props?.sceneNavigator?.viroAppProps?.word ?? 'apple';
  const onModelLoaded: (() => void) | undefined = props?.sceneNavigator?.viroAppProps?.onModelLoaded;
  const [modelError, setModelError] = useState(false);

  const modelEntry = getModel(word);

  return (
    <ViroARScene>
      {/* Lighting — multi-directional to illuminate all PBR surfaces */}
      <ViroAmbientLight color="#ffffff" intensity={600} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={600} castsShadow={false} />
      <ViroDirectionalLight color="#fff5e0" direction={[1, -0.5, -1]} intensity={400} castsShadow={false} />
      <ViroDirectionalLight color="#e0f0ff" direction={[-1, -0.5, -1]} intensity={300} castsShadow={false} />

      {/* 3D Model — placed at fixed world position, rotates continuously */}
      {modelEntry && !modelError && (
        <ViroNode
          position={modelEntry.position}
          animation={{ name: 'rotate', run: true, loop: true }}
        >
          <Viro3DObject
            source={modelEntry.source}
            type="GLB"
            scale={modelEntry.scale}
            onLoadEnd={() => onModelLoaded?.()}
            onError={(e: any) => {
              console.warn('AR model error:', e);
              setModelError(true);
            }}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
};
