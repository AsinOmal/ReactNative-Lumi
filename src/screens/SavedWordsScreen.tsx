import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect, useIsFocused } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import { useAuthStore } from "../store/useAuthStore";
import { useSavedWords } from "../hooks/useSavedWords";
import { WordCard } from "../components/savedwords/WordCard";
import { SkyScene } from "../components/scenes/SkyScene";
import { colors } from "../constants/colors";
import { styles } from "./SavedWordsScreenStyles";

type Tab = "saved" | "wishlist";

export const SavedWordsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>("saved");
  const { savedWords, wishlist, loadWishlist, handleRemoveWish } =
    useSavedWords(user?.uid ?? null);

  useFocusEffect(
    React.useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  const count = tab === "saved" ? savedWords.length : wishlist.length;

  return (
    <SkyScene paused={!isFocused}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="chevron-back" size={28} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{tab === "saved" ? "Saved Words" : "My Wishlist"}</Text>
          <Text style={styles.subtitle}>{count} {tab === "saved" ? "words" : "wishes"}</Text>
        </View>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <View style={[styles.tabsWrapper, { paddingTop: 16 }]}>
        <View style={styles.tabs}>
          {(["saved", "wishlist"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
              accessibilityLabel={t === "saved" ? "Saved words tab" : "Wishlist tab"}
              accessibilityRole="tab"
            >
              <Ionicons name={t === "saved" ? "bookmark" : "star"} size={16} color={tab === t ? "#FFF" : colors.textMid} />
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "saved" ? "Saved" : "Wishlist"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === "saved" && (savedWords.length === 0 ? (
        <View style={styles.empty}>
          <LottieView source={require("../assets/lottie/sleepy.json")} autoPlay loop style={styles.emptyLottie} />
          <Text style={styles.emptyTitle}>Nothing saved yet!</Text>
          <Text style={styles.emptySub}>Scan a word and tap Save to see it here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          {savedWords.map((item) => (
            <WordCard key={item.word} word={item.word} timestamp={item.savedAt} mode="saved" />
          ))}
        </ScrollView>
      ))}

      {tab === "wishlist" && (wishlist.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={56} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No wishes yet!</Text>
          <Text style={styles.emptySub}>Scan an unknown word and tap "Wish for it!"</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          {wishlist.map((item) => (
            <WordCard key={item.word} word={item.word} timestamp={item.wishedAt} mode="wish" onRemove={() => handleRemoveWish(item.word)} />
          ))}
        </ScrollView>
      ))}
    </SkyScene>
  );
};
