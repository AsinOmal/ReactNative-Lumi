import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';

interface SettingsRowProps {
  iconName: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ iconName, label, onPress, danger = false }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityLabel={label}
    accessibilityRole="button"
  >
    <View style={styles.iconWrap}>
      <Ionicons name={iconName} size={22} color={danger ? colors.error : colors.primary} />
    </View>
    <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  iconWrap:    { width: 30, alignItems: 'center' },
  label:       { flex: 1, fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: colors.textDark },
  labelDanger: { color: colors.error },
});
