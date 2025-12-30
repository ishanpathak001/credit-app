import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

type Props = {
  username: string;
  notificationsCount?: number;
  onPressProfile?: () => void;
  onPressNotifications?: () => void;
};

export default function HomeHeader({
  username,
  onPressProfile,
}: Props) {
  const insets = useSafeAreaInsets();
  const {user} = useContext(AuthContext);

  return (
    <View
      className="bg-white px-4 pb-4 border-b border-gray-200"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row justify-between items-center">
        {/* Greeting */}
        <View>
          <Text className="text-gray-500 text-xl">Hello,</Text>
          <Text className="text-xl font-bold">{user?.full_name || "Guest"}</Text>
        </View>

        {/* Icons */}
        <View className="flex-row items-center gap-4">
          

          {/* Profile */}
          <Pressable
            onPress={onPressProfile}
            className="p-2 rounded-full bg-gray-100 active:opacity-70"
          >
          <Ionicons name="person-outline" size={24} color={"gray"} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
