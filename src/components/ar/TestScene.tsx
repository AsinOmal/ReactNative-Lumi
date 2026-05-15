import {
  ViroAmbientLight,
  ViroARScene,
  ViroBox,
  ViroMaterials,
  ViroText,
} from '@reactvision/react-viro';
import { StyleSheet } from 'react-native';

ViroMaterials.createMaterials({
  blueMaterial: {
    diffuseColor: '#4C71FF',
  },
});

export const TestScene = () => {
  return (
    <ViroARScene>
      <ViroAmbientLight color={'#ffffff'} />

      <ViroText
        text={'Lumi AR Ready!'}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0.5, -1]}
        style={styles.arTextStyle}
      />

      <ViroBox
        position={[0, -0.5, -1]}
        scale={[0.3, 0.3, 0.3]}
        materials={['blueMaterial']}
        animation={{ name: 'rotate', run: true, loop: true }}
      />
    </ViroARScene>
  );
};

const styles = StyleSheet.create({
  arTextStyle: {
    fontFamily: 'Arial',
    fontSize: 25,
    color: '#ffffff',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
