import { View, Text, FlatList, Pressable, TouchableOpacity } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import API from '../../../src/api/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../src/context/AuthContext';
import { on } from '../../../src/utils/eventBus';
import { useTheme } from '../../../src/context/ThemeContext';

interface Transaction {
  description: string;
  id: number;
  customerName: string;
  amount: number;
  date: string;
}

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { isDark } = useTheme();

  useEffect(() =>  {
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
    const unsub = on('transactions:added', () => fetchData());
    return () => unsub();
  }, [token]);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View
      className={`flex-row justify-between p-4 rounded-xl mb-2 shadow`}
      style={{
        backgroundColor: isDark ? '#1f2937' : '#fff',
      }}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ color: isDark ? '#fff' : '#111', fontWeight: '600' }}
        >
          {item.customerName ?? item.description ?? 'Credit'}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}
        >
          {item.description ?? ''}
        </Text>
      </View>
      <Text style={{ fontWeight: '700', color: '#16a34a' }}>
        ₹{item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }}
    >
      <View style={{ flex: 1, padding: 16 }}>
        {/* Greeting + profile button */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: '700', color: isDark ? '#fff' : '#111' }}>
            Hello, {user?.full_name ?? user?.name ?? 'User'}
          </Text>
          <TouchableOpacity style={{ padding: 6 }} onPress={() => router.push('../profile')}>
            <Ionicons name="person-circle-outline" size={36} color={isDark ? '#fff' : '#111'} />
          </TouchableOpacity>
        </View>

        {/* Total Credit Card */}
        <View
          style={{
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}>Total Credit Given</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', marginTop: 8, color: '#16a34a' }}>
            ₹{totalCredit.toLocaleString()}
          </Text>
        </View>

        {/* Add Credit Button */}
        <Pressable
          style={{
            backgroundColor: '#2563eb',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center',
          }}
          onPress={() => console.log('Navigate to Add Credit screen')}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Add Credit</Text>
        </Pressable>

        {/* Recent Transactions */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#111' }}>
            Recent Transactions
          </Text>
          <Pressable onPress={() => router.push('../transactions')}>
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>View all</Text>
          </Pressable>
        </View>

        {transactions.length === 0 ? (
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No recent transactions.</Text>
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
