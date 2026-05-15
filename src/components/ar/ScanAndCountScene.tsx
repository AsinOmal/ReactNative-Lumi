// 📖 What this does:
// AR scene for Scan & Count. Renders targetCount copies of the target model
// plus DISTRACTOR_COUNT different models at spread positions.
// foundIndices from viroAppProps drives opacity — found models fade to 0.
// isTapping debounce prevents rapid double-taps from registering twice.

import React, { useRef } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
  ViroText,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';

export const ScanAndCountScene = (props: any) => {
  const {
    targetWord,
    targetCount,
    distractors,
    foundIndices,
    positions,
    onTargetTap,
    onDistractorTap,
    onModelLoaded,
  } = props.sceneNavigator.viroAppProps;

  const isTapping = useRef(false);
  const model = getModel(targetWord);

  const withDebounce = (cb: () => void) => {
    if (isTapping.current) {
      return;
    }
    isTapping.current = true;
    cb();
    setTimeout(() => {
      isTapping.current = false;
    }, 500);
  };

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

      {/* Target instances */}
      {model &&
        Array.from({ length: targetCount }, (_, i) => {
          const isFound = (foundIndices as number[]).includes(i);
          return (
            <ViroNode
              key={`t-${i}`}
              position={positions[i]}
              opacity={isFound ? 0 : 1}
              onClickState={(s: number) =>
                s === 1 && withDebounce(() => onTargetTap(i))
              }
              animation={{ name: 'rotate', run: !isFound, loop: true }}
            >
              <Viro3DObject
                source={model.source}
                type="GLB"
                scale={model.scale}
                onLoadEnd={() => onModelLoaded(true)}
              />
              <ViroText
                text={
                  isFound
                    ? '✓'
                    : targetWord.charAt(0).toUpperCase() + targetWord.slice(1)
                }
                position={[0, 0.15, 0]}
                style={{
                  fontStyle: 'Normal',
                  fontSize: 12,
                  color: isFound ? '#22C55E' : '#FBBF24',
                }}
                transformBehaviors={['billboardY']}
              />
            </ViroNode>
          );
        })}

      {/* Distractors */}
      {(distractors as string[]).map((word: string, i: number) => {
        const dm = getModel(word);
        if (!dm) {
          return null;
        }
        return (
          <ViroNode
            key={`d-${word}`}
            position={positions[targetCount + i]}
            opacity={0.6}
            onClickState={(s: number) =>
              s === 1 && withDebounce(() => onDistractorTap(word))
            }
            animation={{ name: 'rotate', run: true, loop: true }}
          >
            <Viro3DObject
              source={dm.source}
              type="GLB"
              scale={dm.scale}
              onLoadEnd={() => onModelLoaded(false)}
            />
            <ViroText
              text={word.charAt(0).toUpperCase() + word.slice(1)}
              position={[0, 0.15, 0]}
              style={{ fontStyle: 'Normal', fontSize: 12, color: '#94A3B8' }}
              transformBehaviors={['billboardY']}
            />
          </ViroNode>
        );
      })}
    </ViroARScene>
  );
};
