import { useNavigate } from "react-router-native";
import { Text, TouchableOpacity, View } from "react-native";
import { LumiButton } from "../components/common/LumiButton.tsx";

export const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <View className={"flex-1 items-center justify-center bg-white"}>
      <View className={"p-6 bg-slate-100 rounded-2xl items-center shadow-sm w-4/5"}>
        <Text className={"text-5xl font-bold text-primary-default mb-1 font-spicy"}>Lumi</Text>
        <Text
          className="text-gray-500 mb-8 text-center font-fredoka-bold">
          Interactive AR Word Explorer</Text>
        <LumiButton onPress={() => navigate("/scan")} title={"Scan Text"} />

      </View>
    </View>

    //! TODO: CREATE A COLOR THEME!
  );
};
