import React, { useState, useRef } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
  ViroBox,
  ViroMaterials,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';

// Reticle material — semi-transparent purple ring/disc
ViroMaterials.createMaterials({
  reticle: {
    diffuseColor: 'rgba(138, 92, 246, 0.65)',
    lightingModel: 'Constant', // unlit, always same brightness
  },
  reticleRing: {
    diffuseColor: 'rgba(255, 255, 255, 0.85)',
    lightingModel: 'Constant',
  },
});

// Animations are registered in index.js at startup

export const ARWordScene = (props: any) => {
  const {
    word = 'apple',
    onModelLoaded,
    onModelPlaced,
    onSurfaceDetected,
    placeTrigger = 0,
  } = props?.sceneNavigator?.viroAppProps ?? {};

  const [modelError, setModelError] = useState(false);
  const [hitPosition, setHitPosition] = useState<[number, number, number] | null>(null);
  const [placedPosition, setPlacedPosition] = useState<[number, number, number] | null>(null);
  const prevTrigger = useRef<number>(0);
  const surfaceCalledBack = useRef(false);

  const modelEntry = getModel(word);

  // Watch placeTrigger — when it increments, commit hitPosition as placed
  React.useEffect(() => {
    if (placeTrigger > prevTrigger.current && hitPosition) {
      setPlacedPosition([...hitPosition] as [number, number, number]);
      prevTrigger.current = placeTrigger;
      onModelPlaced?.();
    }
  }, [placeTrigger]);

  const handleCameraARHitTest = (results: any) => {
    if (placedPosition) return; // already placed, stop tracking

    if (results && results.length > 0) {
      // Prefer plane hits for stability
      const best =
        results.find((r: any) => r.type === 'ExistingPlaneUsingExtent') ||
        results.find((r: any) => r.type === 'ExistingPlane') ||
        results.find((r: any) => r.type === 'FeaturePoint') ||
        results[0];

      if (best?.position) {
        setHitPosition(best.position as [number, number, number]);
        // Notify ScanScreen once that a surface has been found
        if (!surfaceCalledBack.current) {
          surfaceCalledBack.current = true;
          onSurfaceDetected?.();
        }
      }
    }
  };

  return (
    <ViroARScene onCameraARHitTest={handleCameraARHitTest}>
      {/* Lighting */}
      <ViroAmbientLight color="#ffffff" intensity={600} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={600} castsShadow={false} />
      <ViroDirectionalLight color="#fff5e0" direction={[1, -0.5, -1]} intensity={400} castsShadow={false} />
      <ViroDirectionalLight color="#e0f0ff" direction={[-1, -0.5, -1]} intensity={300} castsShadow={false} />

      {/* ── Placement Reticle (disappears once model is placed) ── */}
      {hitPosition && !placedPosition && (
        <ViroNode position={hitPosition}>
          {/* Outer ring */}
          <ViroBox
            scale={[0.25, 0.007, 0.25]}
            materials={['reticleRing']}
          />
          {/* Inner filled disc */}
          <ViroBox
            scale={[0.18, 0.005, 0.18]}
            materials={['reticle']}
          />
        </ViroNode>
      )}

      {/* ── Placed 3D Model ── */}
      {modelEntry && !modelError && placedPosition && (
        <ViroNode
          position={placedPosition}
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
