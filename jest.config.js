module.exports = {
  preset: 'react-native',
  transform: {
    // .glb assets used in MODEL_REGISTRY require() calls — stub them like images
    '^.+\\.glb$': '<rootDir>/node_modules/react-native/jest/assetFileTransformer.js',
  },
};
