import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthStore } from "../store/useAuthStore";
import { useSavedWords } from "../hooks/useSavedWords";
import { colors } from "../constants/colors";
import { GameBackground } from "../components/common/GameBackground";
import { styles } from "./SavedWordsScreenStyles";

type Tab = "saved" | "wishlist";

function formatDate(ts: number): string {
  if (!ts) return "Saved earlier";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const SavedWordsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
    <GameBackground>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>
            {tab === "saved" ? "Saved Words" : "My Wishlist"}
          </Text>
          <Text style={styles.subtitle}>
            {count} {tab === "saved" ? "words" : "wishes"}
          </Text>
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
              accessibilityLabel={
                t === "saved" ? "Saved words tab" : "Wishlist tab"
              }
              accessibilityRole="tab"
            >
              <Ionicons
                name={t === "saved" ? "bookmark" : "star"}
                size={16}
                color={tab === t ? "#FFF" : colors.textMid}
              />
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "saved" ? "Saved" : "Wishlist"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === "saved" &&
        (savedWords.length === 0 ? (
          <View style={styles.empty}>
            <LottieView
              source={require("../assets/lottie/sleepy.json")}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.emptyTitle}>Nothing saved yet!</Text>
            <Text style={styles.emptySub}>
              Scan a word and tap Save to see it here.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {savedWords.map((item) => {
              const display =
                item.word.charAt(0).toUpperCase() + item.word.slice(1);
              return (
                <View key={item.word} style={styles.card}>
                  <View style={styles.emojiCircle}>
                    <MaterialCommunityIcons
                      name="cube-outline"
                      size={26}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.wordText}>{display}</Text>
                    <Text style={styles.dateText}>
                      {formatDate(item.savedAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.arBtn}
                    activeOpacity={0.8}
                    onPress={() =>
                      (navigation as any).navigate("MainTabs", {
                        screen: "Scan",
                        params: { preloadWord: item.word },
                      })
                    }
                    accessibilityLabel={`View ${display} in AR`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.arBtnText}>AR</Text>
                    <Ionicons name="arrow-forward" size={13} color="#FFF" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        ))}

      {tab === "wishlist" &&
        (wishlist.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No wishes yet!</Text>
            <Text style={styles.emptySub}>
              Scan an unknown word and tap "Wish for it!"
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {wishlist.map((item) => {
              const display =
                item.word.charAt(0).toUpperCase() + item.word.slice(1);
              return (
                <View key={item.word} style={[styles.card, styles.wishCard]}>
                  <View style={[styles.emojiCircle, styles.wishEmojiCircle]}>
                    <Ionicons
                      name="star"
                      size={28}
                      color={colors.accentYellow}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.wordText}>{display}</Text>
                    <Text style={styles.dateText}>
                      {formatDate(item.wishedAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => handleRemoveWish(item.word)}
                    accessibilityLabel={`Remove ${display} from wishlist`}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        ))}
    </GameBackground>
  );
};
