
import Card from '@/src/components/Card';
import HomeHeader from '@/src/components/HomeHeader';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";



const Home = () => {

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
           {/* Header */}
      <HomeHeader
        username="Ishan"
        notificationsCount={3}
        onPressProfile={() => console.log("Go to profile")}
        onPressNotifications={() => console.log("Open notifications")}
      />
   
   <ScrollView className="flex-1 bg-gray-100 px-4 pt-4">

      {/* Summary Cards */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Card>
            <Text className="text-sm text-gray-500">You will receive</Text>
            <Text className="text-2xl font-bold text-green-700 mt-1">
              ₹ 45,200
            </Text>
          </Card>
        </View>

        <View className="flex-1">
          <Card>
            <Text className="text-sm text-gray-500">You owe</Text>
            <Text className="text-2xl font-bold text-red-700 mt-1">
              ₹ 18,750
            </Text>
          </Card>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row flex-wrap gap-3 mb-4">
        <Card>
          <Text className="font-medium">➕ Add Transaction</Text>
        </Card>
        <Card>
          <Text className="font-medium">🏪 Add Shop</Text>
        </Card>
        <Card>
          <Text className="font-medium">👤 Add Person</Text>
        </Card>
        <Card>
          <Text className="font-medium">📊 Reports</Text>
        </Card>
      </View>

      {/* Recent Transactions */}
      <Card>
        <Text className="text-base font-semibold mb-3">
          Recent Transactions
        </Text>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-700">Ramesh Kirana</Text>
          <Text className="text-green-700 font-semibold">₹ 1,200</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-700">Mobile Shop</Text>
          <Text className="text-red-700 font-semibold">₹ 3,000</Text>
        </View>
      </Card>

      {/* Alerts */}
      <Card>
        <Text className="text-base font-semibold text-red-600 mb-2">
          ⚠️ Overdue
        </Text>
        <Text className="text-gray-700">
          Sita Store – ₹800 (3 days late)
        </Text>
      </Card>

    </ScrollView>
        </SafeAreaView>
    );
}

export default Home;