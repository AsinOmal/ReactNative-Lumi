import React from 'react';
import { View, Text, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePackStore } from '../store/usePackStore';
import { PackGrid } from '../components/home/PackGrid';
import { colors } from '../constants/colors';

export const LibraryScreen = () => {
  const insets = useSafeAreaInsets();
  const { packs, loading, loadPacks } = usePackStore();

  useFocusEffect(React.useCallback(() => { loadPacks(); }, []));

  const freePacks    = packs.filter(p => !p.isPremium);
  const premiumPacks = packs.filter(p => p.isPremium);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Teal gradient header — wave bottom edge, bookshelf watermark */}
      <LinearGradient
        colors={['#4ECDC4', '#0D9488']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <MaterialCommunityIcons
          name="bookshelf"
          size={180}
          color="rgba(255,255,255,0.08)"
          style={styles.watermark}
        />
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>{packs.length} packs available</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {freePacks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Free Packs</Text>
            <PackGrid packs={freePacks} loading={loading} />
          </>
        )}
        {premiumPacks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Premium Packs</Text>
            <PackGrid packs={premiumPacks} loading={false} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyBottom },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  watermark: {
    position: 'absolute',
    right: -24,
    bottom: -20,
  },
  title:    { fontFamily: 'Fredoka-Bold', fontSize: 40, color: '#FFF' },
  subtitle: { fontFamily: 'Fredoka-Regular', fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  body:  { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  sectionLabel: {
    fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark, marginTop: 8,
  },
});
