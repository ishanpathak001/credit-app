import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  name: string;
  totalCredit: number;
  transactionsCount?: number;
  onPress?: () => void;
};

export default function CustomerCard({ name, totalCredit, transactionsCount = 0, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 shadow-md active:opacity-80"
    >
      {/* Top row: Name and Transactions Count */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-800">{name}</Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="people-outline" size={20} color="#111" />
          <Text className="text-gray-500">{transactionsCount}</Text>
        </View>
      </View>

      {/* Total Credit */}
      <Text className="text-gray-700">
        Total Credit: <Text className="font-semibold">₹ {totalCredit}</Text>
      </Text>
    </Pressable>
  );
}
