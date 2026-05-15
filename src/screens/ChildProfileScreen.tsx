// 📖 What this does:
// Post-onboarding screen that collects the child's name and age.
// Step 1 = name (TextInput, skippable), Step 2 = age picker (3-16, skippable).
// Saves to Firestore via updateChildProfile and marks childInfoSeen in AsyncStorage.
// Both steps are optional — skipping saves null values for that field.

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ImageBackground,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { updateChildProfile } from '../services/userService';
import { markChildInfoSeen } from '../utils/onboardingStore';
import { useStrings } from '../hooks/useStrings';
import { styles } from './ChildProfileScreenStyles';

const AGES = Array.from({ length: 14 }, (_, i) => i + 3); // 3–16
const ITEM_HEIGHT = 52;

interface Props { onComplete: () => void; }

export const ChildProfileScreen: React.FC<Props> = ({ onComplete }) => {
  const strings = useStrings();
  const { user, setChildProfile } = useAuthStore();
  const [step, setStep] = useState<'name' | 'age'>('name');
  const [name, setName] = useState('');
  const [selectedAge, setSelectedAge] = useState<number>(6);
  const scrollRef = useRef<ScrollView>(null);

  const handleNameNext = () => setStep('age');

  const handleFinish = async (skipAge = false) => {
    const finalName = name.trim() || null;
    const finalAge = skipAge ? null : selectedAge;
    try {
      if (user) await updateChildProfile(user.uid, finalName, finalAge);
      setChildProfile(finalName, finalAge);
    } catch { /* non-blocking — profile is a nice-to-have */ }
    await markChildInfoSeen();
    onComplete();
  };

  const scrollToAge = (age: number) => {
    const idx = AGES.indexOf(age);
    scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    setSelectedAge(age);
  };

  return (
    <ImageBackground
      source={require('../assets/backgrounds/parent-dash-bg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.card}>
        {step === 'name' ? (
          <>
            <Text style={styles.title}>{strings.childProfileNameTitle}</Text>
            <TextInput
              style={styles.input}
              placeholder={strings.childProfileNamePlaceholder}
              placeholderTextColor="#C4A882"
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={30}
              returnKeyType="next"
              onSubmitEditing={handleNameNext}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleNameNext} accessibilityRole="button">
              <Text style={styles.primaryBtnText}>{strings.childProfileNext}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={handleNameNext} accessibilityRole="button">
              <Text style={styles.skipBtnText}>{strings.childProfileSkip}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{strings.childProfileAgeTitle}</Text>
            <View style={styles.pickerWrap}>
              <View style={styles.pickerHighlight} pointerEvents="none" />
              <ScrollView
                ref={scrollRef}
                style={styles.picker}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                onMomentumScrollEnd={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  setSelectedAge(AGES[Math.max(0, Math.min(idx, AGES.length - 1))]);
                }}
                onScrollBeginDrag={() => {}}
              >
                {AGES.map(age => (
                  <TouchableOpacity key={age} style={styles.pickerItem} onPress={() => scrollToAge(age)}>
                    <Text style={[styles.pickerText, age === selectedAge && styles.pickerTextSelected]}>
                      {age}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleFinish(false)} accessibilityRole="button">
              <Text style={styles.primaryBtnText}>{strings.childProfileFinish}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={() => handleFinish(true)} accessibilityRole="button">
              <Text style={styles.skipBtnText}>{strings.childProfileSkip}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ImageBackground>
  );
};
