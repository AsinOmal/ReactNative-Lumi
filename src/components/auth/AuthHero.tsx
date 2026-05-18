/**
 * AuthHero.tsx
 *
 * Shared hero block for Login / Register / Forgot screens — the wooden sign,
 * mascot, and title/subtitle. Centralised so a tweak to one screen's first
 * impression updates the whole auth flow.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { LumiMascot, MascotState } from '../common/LumiMascot';
import { WoodenSign } from '../home/WoodenSign';
import { styles } from '../../screens/LoginScreenStyles';

interface Props {
  title: string;
  subtitle: string;
  mascotState?: MascotState;
  mascotSize?: number;
}

export const AuthHero: React.FC<Props> = ({
  title,
  subtitle,
  mascotState = 'wave',
  mascotSize = 140,
}) => (
  <>
    <WoodenSign />
    <View style={styles.mascotWrap}>
      <LumiMascot state={mascotState} size={mascotSize} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </>
);
