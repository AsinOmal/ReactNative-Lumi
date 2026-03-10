import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ACHIEVEMENTS } from '../utils/achievementRegistry';
import { getProgress, EarnedAchievement } from '../utils/achievementStore';

export const AchievementsScreen = () => {
  const navigation = useNavigation();
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);

  // Refresh progress every time screen opens
  useFocusEffect(
    React.useCallback(() => {
      getProgress().then(p => setEarned(p.earned || []));
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1A1050" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {ACHIEVEMENTS.map(a => {
          const earnedData = earned.find(e => e.id === a.id);
          const isUnlocked = !!earnedData;
          return (
            <View key={a.id} style={[styles.card, !isUnlocked && styles.cardLocked]}>
              <View style={[styles.emojiContainer, !isUnlocked && styles.emojiContainerLocked]}>
                <Text style={[styles.emoji, !isUnlocked && styles.emojiLocked]}>{a.emoji}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.title, !isUnlocked && styles.titleLocked]}>{a.title}</Text>
                <Text style={styles.description}>{a.description}</Text>
                
                {isUnlocked && earnedData.triggerWord !== 'unknown' && (
                  <View style={styles.metaRow}>
                    <Ionicons name="camera-outline" size={14} color="#8B5CF6" />
                    <Text style={styles.unlockedWith}>
                      Unlocked with: <Text style={styles.triggerWord}>{earnedData.triggerWord}</Text>
                    </Text>
                  </View>
                )}
              </View>
              {isUnlocked ? (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              ) : (
                <Ionicons name="lock-closed" size={22} color="#CBD5E1" />
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0EBFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#1A1050',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardLocked: {
    backgroundColor: '#F8F9FA',
    shadowOpacity: 0,
    elevation: 0,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  
  // Emoji
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainerLocked: {
    backgroundColor: '#E2E8F0',
  },
  emoji: {
    fontSize: 32,
  },
  emojiLocked: {
    opacity: 0.3,
  },
  
  // Text
  cardText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 18,
    color: '#5B2DC0',
  },
  titleLocked: {
    color: '#94A3B8',
  },
  description: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  
  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: '#F8F5FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unlockedWith: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  triggerWord: {
    fontFamily: 'Fredoka-SemiBold',
    color: '#8B5CF6',
  },
});
