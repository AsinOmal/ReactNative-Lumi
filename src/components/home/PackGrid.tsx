import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ColorPackCard } from '../library/ColorPackCard';
import { Pack } from '../../services/packService';
import { colors } from '../../constants/colors';

interface Props {
  packs: Pack[];
  loading?: boolean;
}

export const PackGrid: React.FC<Props> = ({ packs, loading }) => {
  const navigation = useNavigation();

  if (loading) {
    return <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />;
  }

  const rows: Pack[][] = [];
  for (let i = 0; i < packs.length; i += 2) {
    rows.push(packs.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map(pack => (
            <View key={pack.id} style={styles.cell}>
              <ColorPackCard
                pack={pack}
                onPress={() => (navigation as any).navigate('PackDetail', { pack })}
              />
            </View>
          ))}
          {row.length === 1 && <View style={styles.cell} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
});
