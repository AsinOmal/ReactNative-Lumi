import { useMemo, useRef, MutableRefObject } from 'react';
import { PanResponder, PanResponderInstance } from 'react-native';
import { config } from '../constants/config';

// 📖 What this does:
// Bridges a screen-level horizontal swipe to a ViroNode rotation. The scene
// component publishes its rotation setter onto rotationApiRef.current after
// mount; PanResponder calls applyDelta during the gesture and commit() on
// release. PanResponder is intentionally indifferent to taps — it only claims
// the gesture once horizontal motion crosses a threshold, so buttons rendered
// above the AR view still receive their taps unhindered.
export interface RotationApi {
  applyDelta: (deltaPx: number) => void;
  commit: (deltaPx: number) => void;
}

interface SwipeRotation {
  rotationApiRef: MutableRefObject<RotationApi | null>;
  panHandlers: PanResponderInstance['panHandlers'];
}

export const useSwipeRotation = (): SwipeRotation => {
  const rotationApiRef = useRef<RotationApi | null>(null);
  const responder = useMemo(
    () =>
      PanResponder.create({
        // Capture-phase claims: the overlay sits above ViroARSceneNavigator,
        // so we must win the responder before Viro's native gesture system
        // grabs the touch. Taps are still passed through because we only
        // claim on horizontal motion past SWIPE_ROTATE_THRESHOLD_PX.
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_evt, g) =>
          Math.abs(g.dx) > config.SWIPE_ROTATE_THRESHOLD_PX,
        onMoveShouldSetPanResponderCapture: (_evt, g) =>
          Math.abs(g.dx) > config.SWIPE_ROTATE_THRESHOLD_PX,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_evt, g) => {
          rotationApiRef.current?.applyDelta(g.dx);
        },
        onPanResponderRelease: (_evt, g) => {
          rotationApiRef.current?.commit(g.dx);
        },
        onPanResponderTerminate: (_evt, g) => {
          rotationApiRef.current?.commit(g.dx);
        },
      }),
    []
  );
  return { rotationApiRef, panHandlers: responder.panHandlers };
};
