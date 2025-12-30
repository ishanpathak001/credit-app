import { View, Text, Pressable } from "react-native";

type Props = {
  fullName: string;
  phoneNumber: string;
  totalCredit: number;
  transactionsCount?: number;
  onClose: () => void;
};

export default function CustomerDetailCard({
  fullName,
  phoneNumber,
  totalCredit,
  transactionsCount = 0,
  onClose,
}: Props) {
  return (
    <View className="bg-white rounded-xl p-6 w-full shadow-lg">
      <Text className="text-2xl font-bold mb-2">{fullName}</Text>
      <Text className="text-gray-600 mb-1">Phone: {phoneNumber}</Text>
      <Text className="text-gray-600 mb-1">Total Credit: ${totalCredit}</Text>
      <Text className="text-gray-600 mb-4">Transactions: {transactionsCount}</Text>

      <Pressable
        onPress={onClose}
        className="bg-gray-300 px-4 py-2 rounded-md"
      >
        <Text className="text-center font-semibold">Close</Text>
      </Pressable>
    </View>
  );
}
