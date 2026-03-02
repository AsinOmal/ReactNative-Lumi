import { Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface LumiButtonProps {
  onPress: () => void;
  title: string;
  icon?: string; // Optional icon or emoji
}

export const LumiButton = ({ onPress, title, icon }: LumiButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={"w-full mb-6 shadow-xl"}
    >
      <LinearGradient
        colors={["#320757", "#770CB4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 25 }} // Hardcoded Radius for smoother gradient
        className={"p-1"}
      >
        <View
          className={
            "bg-primary-dark/20 rounded-2xl px-8 py-5 items-center flex-row justify-center"
          }
        >
          {icon && <Text className={"text-2xl mr-3"}>{icon}</Text>}
          <Text
            className={
              "text-white text-3xl font-button font-bold tracking-widest text-center pt-1"
            }
          >
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
