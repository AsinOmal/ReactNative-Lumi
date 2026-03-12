import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Share,
  Alert,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Achievement } from '../utils/achievementRegistry';
import { EarnedAchievement } from '../utils/achievementStore';

interface Props {
  achievement: Achievement;
  earnedData: EarnedAchievement;
  onClose: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const AchievementShareModal = ({ achievement, earnedData, onClose }: Props) => {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current!.capture!();
      await Share.share({
        url: uri,
        message: `I just unlocked the "${achievement.title}" achievement on Lumi! 🎉`,
        title: 'Lumi Achievement',
      });
    } catch {
      Alert.alert('Could not share', 'Something went wrong capturing the card.');
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* ── Capturable card ── */}
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.lumiLogo}>Lumi</Text>
                <Text style={styles.lumiSub}>Word Explorer</Text>
              </View>

              {/* Badge */}
              <View style={styles.badgeCircle}>
                <Text style={styles.badgeEmoji}>{achievement.emoji}</Text>
              </View>

              {/* Text */}
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>

              {/* Trigger chip */}
              {earnedData.triggerWord !== 'unknown' && (
                <View style={styles.chip}>
                  <Ionicons name="camera-outline" size={13} color="#C4B5FD" />
                  <Text style={styles.chipText}>
                    Unlocked with:{' '}
                    <Text style={styles.chipWord}>
                      {earnedData.triggerWord.charAt(0).toUpperCase() + earnedData.triggerWord.slice(1)}
                    </Text>
                  </Text>
                </View>
              )}

              {/* Date */}
              <Text style={styles.dateText}>{formatDate(earnedData.unlockedAt)}</Text>
            </View>
          </ViewShot>

          {/* ── Buttons ── */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color="#FFF" />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },

  // Card (the thing that gets captured)
  card: {
    width: 300,
    backgroundColor: '#1A1050',
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 10,
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  lumiLogo: {
    fontFamily: 'SpicyRice-Regular',
    fontSize: 26,
    color: '#C4B5FD',
  },
  lumiSub: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#7C3AED',
    marginTop: -2,
  },

  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2D1B69',
    borderWidth: 3,
    borderColor: '#5B2DC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeEmoji: { fontSize: 52 },

  achievementTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  achievementDesc: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: '#C4B5FD',
    textAlign: 'center',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2D1B69',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  chipText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#C4B5FD',
  },
  chipWord: {
    fontFamily: 'Fredoka-Bold',
    color: '#FFFFFF',
  },

  dateText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: 300,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  shareBtn: {
    flex: 2,
    backgroundColor: '#5B2DC0',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareBtnText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
});
