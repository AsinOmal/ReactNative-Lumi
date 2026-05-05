import { Platform } from "react-native";

export const shadowCard =
  Platform.select({
    ios: {
      shadowColor: "#C4A060",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    android: { elevation: 6 },
  }) ?? {};

export const shadowCardDeep =
  Platform.select({
    ios: {
      shadowColor: "#5C3317",
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.5,
      shadowRadius: 14,
    },
    android: { elevation: 10 },
  }) ?? {};

export const shadowHeader =
  Platform.select({
    ios: {
      shadowColor: "#3A7FA8",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
    },
    android: { elevation: 14 },
  }) ?? {};

// Wrap card content: outer → inner → content Views for the bevel effect
export const woodBorderOuter = {
  borderRadius: 20,
  padding: 2,
  backgroundColor: "#5C3317",
};
export const woodBorderInner = {
  borderRadius: 18,
  padding: 2,
  backgroundColor: "#C48A4A",
};
export const woodBorderContent = {
  borderRadius: 16,
  backgroundColor: "#FFF8E7",
  overflow: "hidden" as const,
};

export const creamCard = {
  backgroundColor: "#FFF8E7",
  borderRadius: 20,
  ...shadowCard,
};

export const buttonGradientColors = {
  primary: ["#FFD080", "#FF9A2E", "#C96B00"] as string[],
  sheen: [
    "rgba(255,229,160,0.7)",
    "rgba(255,229,160,0)",
    "rgba(255,229,160,0)",
  ] as string[],
  header: ["#5BC8F5", "#A8E6FF"] as string[],
  wood: ["#C48A4A", "#8B5A2B", "#5C3317"] as string[],
};

export const tabBarPillStyle = {
  backgroundColor: "#5BC8F5",
  borderRadius: 36,
  borderWidth: 2,
  borderColor: "#3A7FA8",
  ...Platform.select({
    ios: {
      shadowColor: "#3A7FA8",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    android: { elevation: 14 },
  }),
};

export const scanButtonStyle = {
  backgroundColor: "#FF9A2E",
  borderWidth: 3,
  borderColor: "#C96B00",
  ...Platform.select({
    ios: {
      shadowColor: "#C96B00",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
    },
    android: { elevation: 12 },
  }),
};

export const headerStyle = {
  paddingHorizontal: 24,
  paddingBottom: 32,
  borderBottomLeftRadius: 40,
  borderBottomRightRadius: 40,
  overflow: "hidden" as const,
  ...shadowHeader,
};
