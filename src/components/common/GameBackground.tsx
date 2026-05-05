import React from "react";
import { ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface GameBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GameBackground = ({ children, style }: GameBackgroundProps) => (
  <LinearGradient
    colors={["#5BC8F5", "#7ED4F7", "#A8E6FF"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={[{ flex: 1 }, style]}
  >
    {children}
  </LinearGradient>
);
