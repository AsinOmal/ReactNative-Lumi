import React from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
  ViroText,
} from '@reactvision/react-viro';
import { MODEL_REGISTRY } from '../../utils/modelRegistry';

export const WordFindScene = (props: any) => {
  const {
    targetWord, foundWords, onCorrect, onWrong, onModelLoaded, randomizedPositions
  }: {
    targetWord: string;
    foundWords: string[];
    onCorrect: (w: string) => void;
    onWrong:   (w: string) => void;
    onModelLoaded: (w: string) => void;
    randomizedPositions: [number, number, number][];
  } = props.sceneNavigator.viroAppProps;

  const entries = Object.entries(MODEL_REGISTRY);

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={700} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={700} castsShadow={false} />
      <ViroDirectionalLight color="#fff5e0" direction={[1, -0.5, -1]} intensity={400} castsShadow={false} />

      {entries.map(([word, model], idx) => {
        const isFound = foundWords.includes(word);
        const isTarget = word === targetWord;
        const pos = randomizedPositions[idx] ?? [0, 0, -1.5];

        return (
          <ViroNode
            key={word}
            position={pos}
            animation={{ name: 'rotate', run: isTarget && !isFound, loop: true }}
            onClickState={(state: number) => {
              if (state !== 1) return; // 1 = CLICKED
              if (isFound || !targetWord) return;
              if (word === targetWord) onCorrect(word);
              else onWrong(word);
            }}
          >
            <Viro3DObject
              source={model.source}
              scale={model.scale}
              type="GLB"
              opacity={isFound ? 0.22 : 1}
              onLoadEnd={() => onModelLoaded(word)}
            />
            <ViroText
              text={isFound ? '✓' : word.toUpperCase()}
              position={[0, -0.13, 0]}
              scale={[0.09, 0.09, 0.09]}
              style={{
                fontFamily: 'Arial', fontSize: 20,
                color: isFound ? '#6EE7B7' : isTarget ? '#FDE68A' : '#FFFFFF',
                textAlign: 'center',
              } as any}
            />
          </ViroNode>
        );
      })}
    </ViroARScene>
  );
};
