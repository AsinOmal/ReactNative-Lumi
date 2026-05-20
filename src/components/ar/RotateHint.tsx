import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 📖 What this does:
// Transient pill overlay prompting the user to pinch-rotate the AR model.
// Stateless — visibility/timing live in useRotateHint at the screen level.
// pointerEvents="none" keeps the pill from swallowing gestures meant for the
// underlying ViroARSceneNavigator.
interface RotateHintProps {
  visible: boolean;
}

export const RotateHint = ({ visible }: RotateHintProps) => {
  if (!visible) return null;
  return (
    <View style={styles.pill} pointerEvents="none">
      <Ionicons name="swap-horizontal" size={22} color="#FFFFFF" />
      <Text style={styles.text}>Swipe to rotate</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: 106,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  text: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
