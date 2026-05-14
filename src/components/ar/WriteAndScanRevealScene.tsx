// 📖 Single-model AR reveal scene for Write & Scan.
// Anchors the target 3D model at a fixed point 1.5m in front of the camera
// with slow continuous rotation. No tap handlers — this scene is read-only;
// the child observes, then exits via the orchestrator's "Scan my answer"
// button. Uses getModel() so remotely-downloaded packs work too.

import React from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';

interface SceneProps {
  word: string;
  onModelLoaded?: () => void;
}

const FIXED_POS: [number, number, number] = [0, 0, -1.5];

export const WriteAndScanRevealScene = (props: any) => {
  const { word, onModelLoaded }: SceneProps =
    props.sceneNavigator.viroAppProps;
  const model = getModel(word);
  if (!model) return null;

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={700} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={700} />
      <ViroDirectionalLight color="#fff5e0" direction={[1, -0.5, -1]} intensity={400} />
      <ViroDirectionalLight color="#e0f0ff" direction={[-1, -0.5, -1]} intensity={300} />

      <ViroNode
        position={FIXED_POS}
        animation={{ name: 'rotate', run: true, loop: true }}
      >
        <Viro3DObject
          source={model.source}
          scale={model.scale}
          type="GLB"
          onLoadEnd={() => onModelLoaded?.()}
        />
      </ViroNode>
    </ViroARScene>
  );
};
