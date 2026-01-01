import { View, Text, FlatList, Pressable, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useContext } from 'react';
import API from '../../src/api/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../src/context/AuthContext';
import { on, off } from '../../src/utils/eventBus';

interface Transaction {
  description: string;
  id: number;
  customerName: string;
  amount: number;
  date: string;
}

interface HomeProps {
  // Removed unused prop
}

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Fetch total credit and recent transactions
    const fetchData = async () => {
      try {
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const totalRes = await API.get('/total-credit', headers);
        setTotalCredit(totalRes.data.totalCredit);

        const transRes = await API.get('/recent-transactions', headers);
        setTransactions(transRes.data.transactions);
      } catch (err) {
        console.log('Error fetching data:', err);
      }
    };

    fetchData();
    // subscribe to transaction add events to refresh
    const unsub = on('transactions:added', () => { fetchData(); });
    return () => { unsub(); };
  }, [token]);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View className="flex-row justify-between p-4 bg-white rounded-xl mb-2 shadow">
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text className="font-semibold text-gray-800" numberOfLines={1} ellipsizeMode="tail">{item.customerName ?? item.description ?? 'Credit'}</Text>
        <Text className="text-gray-500 text-sm" numberOfLines={1} ellipsizeMode="tail">{item.description ?? ''}</Text>
      </View>
      <Text className="font-bold text-green-600">₹{item.amount.toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView className='flex-row'>
      <View className="flex-1 bg-gray-100 p-4">
      {/* Greeting + profile button */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text className="text-2xl font-bold text-gray-800 mb-6">Hello, {user?.full_name ?? user?.name ?? 'User'} 👋</Text>
        
          <TouchableOpacity style={{ padding: 6 }} onPress={() => router.push("/profile")}>
            <Ionicons name="person-circle-outline" size={36} color="#111" />
          </TouchableOpacity>
        
      </View>

      {/* Total Credit Card */}
      <View className="bg-white rounded-2xl shadow p-6 mb-6">
        <Text className="text-gray-500 text-sm">Total Credit Given</Text>
        <Text className="text-3xl font-bold text-green-600 mt-2">
          ₹{totalCredit.toLocaleString()}
        </Text>
      </View>

      {/* Add Credit Button */}
      <Pressable
        className="bg-blue-500 rounded-xl p-4 mb-6 items-center"
        onPress={() => console.log('Navigate to Add Credit screen')}
      >
        <Text className="text-white font-bold text-lg">Add Credit</Text>
      </Pressable>

      {/* Recent Transactions - show top 3 with View all */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text className="text-lg font-semibold text-gray-800">Recent Transactions</Text>
        <Pressable onPress={() => router.push('/transactions')}>
          <Text style={{ color: '#2563eb', fontWeight: '600' }}>View all</Text>
        </Pressable>
      </View>

      {transactions.length === 0 ? (
        <Text className="text-gray-500">No recent transactions.</Text>
      ) : (
        <FlatList
          data={transactions.slice(0, 3)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
        />
      )}
    </View>
    </SafeAreaView>
  );
};

export default Home;
