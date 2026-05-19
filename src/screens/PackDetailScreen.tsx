import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Pack } from '../types/pack';
import { getPackAccent } from '../constants/packAccents';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { useStrings } from '../hooks/useStrings';
import { useLanguageStore } from '../store/useLanguageStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { usePackDownloadStore } from '../store/usePackDownloadStore';
import { SkyScene } from '../components/scenes/SkyScene';
import { PackDetailCTA } from '../components/library/PackDetailCTA';
import { PackDetailHeader } from '../components/library/PackDetailHeader';
import { PackDownloadCard } from '../components/library/PackDownloadCard';
import { styles } from './PackDetailScreenStyles';

export const PackDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { pack } = route.params as { pack: Pack };
  const accent = getPackAccent(pack.id);
  const strings = useStrings();
  const language = useLanguageStore((s) => s.language);
  const isPurchased = usePurchaseStore((s) => s.isPurchased(pack.id));
  const dlStatus = usePackDownloadStore((s) => s.packs[pack.id]?.status ?? 'idle');
  const isReady = dlStatus === 'downloaded' || pack.packType === 'bundled';

  const Background: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    pack.detailImageUrl ? (
      <View style={styles.bg}>
        <FastImage
          source={{ uri: pack.detailImageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={FastImage.resizeMode.cover}
        />
        {children}
      </View>
    ) : (
      <SkyScene paused={!isFocused}>{children}</SkyScene>
    );

  if (pack.isPremium && !isPurchased) {
    const valuePills = [
      { icon: 'cube-outline', label: `${pack.wordCount} 3D models` },
      { icon: 'locate-outline', label: 'AR Word Hunt' },
      { icon: 'language-outline', label: 'Sinhala labels' },
    ];
    return (
      <Background>
        <StatusBar barStyle="light-content" />
        <PackDetailHeader pack={pack} accent={accent} insets={insets} onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={[styles.lockScroll, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.lockCard}>
            <Text style={styles.lockTitle}>{pack.name}</Text>
            <Text style={styles.lockBody}>Unlock all {pack.wordCount} 3D models and play together in AR.</Text>
            <View style={styles.pillRow}>
              {valuePills.map((p) => (
                <View key={p.label} style={styles.valuePill}>
                  <Ionicons name={p.icon} size={16} color={accent} />
                  <Text style={styles.valuePillText} numberOfLines={1}>{p.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.lockWordsLabel}>
              <Text style={styles.lockWordsLabelText}>What&apos;s inside</Text>
            </View>
            <View style={styles.chipRow}>
              {pack.words.slice(0, 6).map((w) => (
                <View key={w} style={styles.chip}>
                  <Text style={styles.chipText}>{w.charAt(0).toUpperCase() + w.slice(1)}</Text>
                </View>
              ))}
              {pack.words.length > 6 && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>+{pack.words.length - 6} more</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.unlockBtn, { backgroundColor: accent }]}
              activeOpacity={0.85}
              accessibilityLabel={`Unlock ${pack.name} pack`}
              accessibilityRole="button"
              onPress={() => (navigation as any).navigate('PremiumPackGate', { word: pack.words[0] ?? '', pack })}
            >
              <Ionicons name="lock-open-outline" size={20} color="#FFF" />
              <Text style={styles.unlockBtnText}>Unlock — {strings.PACK_PRICE}</Text>
            </TouchableOpacity>
            <Text style={styles.unlockHint}>One-time purchase</Text>
          </View>
        </ScrollView>
      </Background>
    );
  }

  return (
    <Background>
      <StatusBar barStyle="light-content" />
      <PackDetailHeader pack={pack} accent={accent} insets={insets} onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <PackDownloadCard pack={pack} accent={accent} />

        <Text style={styles.sectionLabel}>{strings.packDetailWordsSection}</Text>

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
              {isReady ? (
                <Text style={styles.wordSyllables}>{model?.syllables.join(' · ') ?? ''}</Text>
              ) : (
                <View style={styles.previewChip}>
                  <Text style={styles.previewChipText}>{strings.packDetailPreview}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 28 }]}>
        {!isReady && pack.estimatedSizeMB ? (
          <Text style={styles.infoStrip}>
            {pack.wordCount} words · {pack.estimatedSizeMB} MB · Works offline
          </Text>
        ) : null}
        <PackDetailCTA
          pack={pack}
          accent={accent}
          onPlay={() => (navigation as any).navigate('PackARPreview', { pack })}
        />
      </View>
    </Background>
  );
};
