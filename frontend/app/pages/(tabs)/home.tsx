import { View, Text, FlatList, Pressable, TouchableOpacity, SafeAreaView } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import API from '../../../src/api/api';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../src/context/AuthContext';
import { on } from '../../../src/utils/eventBus';
import { useTheme } from '../../../src/context/ThemeContext';
import AddTransactionModal from '../../../src/components/AddTransactionModal';
import TransactionsChart from '@/src/components/TransactionsChart';

interface Transaction {
  description: string;
  id: number;
  customerName: string;
  amount: number;
  date: string;
  status?: 'pending' | 'settled';
}

interface ChartData {
  day: string;
  settled: number;
  pending: number;
}

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [pendingCredit, setPendingCredit] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useTheme();

  const cardStyle = {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  };

  const rowStyle = { flexDirection: 'row' as const, justifyContent: 'space-between' as const };

  const fetchData = async () => {
    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // total & pending credits
      const [pendingRes, totalRes, transRes, chartRes] = await Promise.all([
        API.get('/transactions/total-credit', headers),
        API.get('/users/total-credit', headers),
        API.get('/transactions/recent-transactions', headers),
        API.get('/transactions/summary-last-week', headers),
      ]);

      setPendingCredit(pendingRes.data.totalCredit);
      setTotalCredit(totalRes?.data?.totalCredit ?? 0);
      setTransactions(transRes.data.transactions);
      setChartData(chartRes.data.data);
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    const unsubAdded = on('transactions:added', fetchData);
    const unsubSettled = on('transactions:settled', fetchData);

    return () => {
      unsubAdded();
      unsubSettled();
    };
  }, [token]);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const amountColor = item.status === 'settled' ? '#16a34a' : '#d97706';
    const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 16,
          borderRadius: 12,
          marginBottom: 8,
          backgroundColor: isDark ? '#111827' : '#f9fafb',
        }}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: isDark ? '#fff' : '#111', fontWeight: '600' }}>
            {item.customerName ?? item.description ?? 'Credit'}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}>
            {item.description ?? ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontWeight: '700', color: amountColor }}>रू{item.amount.toLocaleString()}</Text>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>{dateStr}</Text>
          <Text style={{ color: amountColor, fontSize: 10, fontWeight: '600' }}>
            {item.status?.toUpperCase() ?? 'PENDING'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={{ flex: 1, padding: 16, marginBottom: 24 }}>
              {/* Greeting + Profile */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: isDark ? '#fff' : '#111' }}>
                  Hello, {user?.full_name ?? user?.name ?? 'User'}
                </Text>
                <TouchableOpacity style={{ padding: 6 }} onPress={() => router.push('../profile')}>
                  <Ionicons name="person-circle-outline" size={36} color={isDark ? '#fff' : '#111'} />
                </TouchableOpacity>
              </View>

              {/* Credit Summary */}
              <View style={rowStyle}>
                <View style={[cardStyle, { flex: 1, marginRight: 8 }]}>
                  <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}>Total Credit Given</Text>
                  <Text style={{ fontSize: 26, fontWeight: '700', marginTop: 8, color: '#2563eb' }}>
                    रू{totalCredit.toLocaleString()}
                  </Text>
                </View>
                <View style={[cardStyle, { flex: 1, marginLeft: 8 }]}>
                  <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}>Pending Credit</Text>
                  <Text style={{ fontSize: 26, fontWeight: '700', marginTop: 8, color: '#d97706' }}>
                    रू{pendingCredit.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Transactions Chart */}
              <TransactionsChart chartData={chartData} />

              {/* Recent Transactions */}
              <View style={cardStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#111' }}>Recent Transactions</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable style={{ backgroundColor: '#2563eb', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 }} onPress={() => setModalVisible(true)}>
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push('../transactions')}>
                      <Text style={{ color: '#2563eb', fontWeight: '600' }}>View all</Text>
                    </Pressable>
                  </View>
                </View>
                {transactions.length === 0 ? (
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No recent transactions.</Text>
                ) : (
                  <FlatList data={transactions.slice(0, 3)} keyExtractor={item => item.id.toString()} renderItem={renderTransaction} />
                )}
              </View>
            </View>

            <AddTransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} onAdded={fetchData} />
          </>
        }
        ListFooterComponent={<View style={{ height: 14 }} />}
        contentContainerStyle={{ padding: 0 }}
      />
    </SafeAreaView>
  );
};

export default Home;
