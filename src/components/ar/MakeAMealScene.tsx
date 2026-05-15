// 📖 What this does:
// Viro AR scene for Make a Meal. Renders all spawnWords as 3D models at fixed
// positions. Ingredient models rotate while uncollected; distractors sit still
// at slightly reduced opacity so they're visually distinct without being hidden.
//
// Tap logic: ingredient tap → onIngredientTap, anything else → onDistractorTap.
// Collected ingredients fade to 0.15 opacity and stop rotating so the child
// can see what they've already grabbed.
//
// Watch out: props come from viroAppProps which is read once at mount — use the
// double-ref stable callback pattern in MakeAMealScreen for all callbacks.

import React from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
  ViroText,
} from '@reactvision/react-viro';
import { getModel } from '../../utils/modelRegistry';

const DISTRACTOR_OPACITY = 0.6;

export const MakeAMealScene = (props: any) => {
  const {
    spawnWords,
    ingredients,
    collected,
    onIngredientTap,
    onDistractorTap,
    onModelLoaded,
    positions,
  }: {
    spawnWords: string[];
    ingredients: string[];
    collected: string[];
    onIngredientTap: (w: string) => void;
    onDistractorTap: (w: string) => void;
    onModelLoaded: (w: string) => void;
    positions: [number, number, number][];
  } = props.sceneNavigator.viroAppProps;

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={700} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.2]}
        intensity={700}
        castsShadow={false}
      />
      <ViroDirectionalLight
        color="#fff5e0"
        direction={[1, -0.5, -1]}
        intensity={400}
        castsShadow={false}
      />

      {spawnWords.map((word, idx) => {
        // getModel() honours admin-set scale via the downloaded/remote/bundled
        // fallback chain. Using MODEL_REGISTRY directly would ignore live scale
        // updates from the admin dashboard.
        const model = getModel(word);
        if (!model) {
          return null;
        }
        const isIngredient = ingredients.includes(word);
        const isCollected = collected.includes(word);
        const pos = positions[idx] ?? [0, 0, -1.5];

        return (
          <ViroNode
            key={word}
            position={pos}
            animation={{
              name: 'rotate',
              run: isIngredient && !isCollected,
              loop: true,
            }}
            onClickState={(state: number) => {
              if (state !== 1 || isCollected) {
                return;
              }
              if (isIngredient) {
                onIngredientTap(word);
              } else {
                onDistractorTap(word);
              }
            }}
          >
            <Viro3DObject
              source={model.source}
              scale={model.scale}
              type="GLB"
              opacity={
                isCollected ? 0.15 : isIngredient ? 1.0 : DISTRACTOR_OPACITY
              }
              onLoadEnd={() => onModelLoaded(word)}
            />
            <ViroText
              text={isCollected ? '✓' : word.toUpperCase()}
              position={[0, -0.13, 0]}
              scale={[0.09, 0.09, 0.09]}
              style={
                {
                  fontFamily: 'Arial',
                  fontSize: 20,
                  color: isCollected
                    ? '#6EE7B7'
                    : isIngredient
                    ? '#FDE68A'
                    : '#FFFFFF',
                  textAlign: 'center',
                } as any
              }
            />
          </ViroNode>
        );
      })}
    </ViroARScene>
  );
};
