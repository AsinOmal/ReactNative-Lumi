import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  buttonGradientColors,
  woodBorderContent,
  woodBorderInner,
  woodBorderOuter,
} from '../../constants/skeuomorphicTokens';

interface LumiButtonProps {
  onPress: () => void;
  title: string;
  icon?: string; // Ionicons icon name (optional)
}

export const LumiButton = ({ onPress, title, icon }: LumiButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="w-full mb-6"
    accessibilityLabel={title}
    accessibilityRole="button"
  >
    <View style={woodBorderOuter}>
      <View style={woodBorderInner}>
        <LinearGradient
          colors={buttonGradientColors.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={woodBorderContent}
        >
          <LinearGradient
            colors={buttonGradientColors.sheen}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.content}>
            {icon && (
              <Ionicons
                name={icon}
                size={22}
                color="#FFFFFF"
                style={styles.icon}
              />
            )}
            <Text style={styles.label}>{title}</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
