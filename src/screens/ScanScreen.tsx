import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { ViroARSceneNavigator } from "@reactvision/react-viro";
import { useNavigate } from "react-router-native";
import { TestScene } from "../components/ar/TestScene";

export const ScanScreen = () => {
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{
          scene: TestScene,
        }}
        style={styles.arView}
      />
      
      {/* Back button overlay */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigate(-1)}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  }
});
