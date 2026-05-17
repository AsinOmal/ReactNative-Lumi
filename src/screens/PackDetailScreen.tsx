import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Pack } from '../types/pack';
import { getPackAccent } from '../constants/packAccents';
import { colors } from '../constants/colors';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { useLanguageStore } from '../store/useLanguageStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { SkyScene } from '../components/scenes/SkyScene';
import { PackDetailCTA } from '../components/library/PackDetailCTA';
import { styles } from './PackDetailScreenStyles';

export const PackDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { pack } = route.params as { pack: Pack };
  const accent = getPackAccent(pack.id);
  const language = useLanguageStore((s) => s.language);
  const isPurchased = usePurchaseStore((s) => s.isPurchased(pack.id));

  // Per-pack hero background takes precedence over the animated SkyScene.
  // Falling back to SkyScene keeps unmigrated packs looking correct.
  const Background: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    pack.detailImageUrl ? (
      <ImageBackground
        source={{ uri: pack.detailImageUrl }}
        style={styles.bg}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    ) : (
      <SkyScene paused={!isFocused}>{children}</SkyScene>
    );

  if (pack.isPremium && !isPurchased) {
    return (
      <Background>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[accent, `${accent}CC`]}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.packName}>{pack.name}</Text>
          <View style={{ width: 44 }} />
        </LinearGradient>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          <View style={styles.lockCard}>
            <Ionicons
              name="lock-closed"
              size={52}
              color={colors.primaryLight}
            />
            <Text style={styles.lockTitle}>This pack is locked</Text>
            <Text style={styles.lockBody}>
              Unlock {pack.name} to scan, discover, and play with all{' '}
              {pack.wordCount} 3D models!
            </Text>
            <View style={styles.chipRow}>
              {pack.words.slice(0, 6).map((w) => (
                <View key={w} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </Text>
                </View>
              ))}
              {pack.words.length > 6 && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    +{pack.words.length - 6} more
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.unlockBtn, { backgroundColor: accent }]}
              activeOpacity={0.85}
              accessibilityLabel={`Unlock ${pack.name} pack`}
              accessibilityRole="button"
              onPress={() =>
                (navigation as any).navigate('PremiumPackGate', {
                  word: pack.words[0] ?? '',
                  pack,
                })
              }
            >
              <Ionicons name="star" size={20} color={colors.accentYellow} />
              <Text style={styles.unlockBtnText}>Unlock {pack.name}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Background>
    );
  }

  return (
    <Background>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[accent, `${accent}BB`]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.packName}>{pack.name}</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {pack.words.map((word) => {
          const display = word.charAt(0).toUpperCase() + word.slice(1);
          const model = MODEL_REGISTRY[word];
          return (
            <View key={word} style={styles.wordRow}>
              <View style={[styles.wordDot, { backgroundColor: accent }]} />
              <Text style={styles.wordLabel}>{display}</Text>
              {language === 'si' && model?.sinhalaLabel ? (
                <Text style={styles.wordSinhala}>{model.sinhalaLabel}</Text>
              ) : null}
              <Text style={styles.wordSyllables}>
                {model?.syllables.join(' · ') ?? ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.ctaWrap}>
        <PackDetailCTA
          pack={pack}
          accent={accent}
          onPlay={() => (navigation as any).navigate('PackARPreview', { pack })}
        />
      </View>
    </Background>
  );
};
