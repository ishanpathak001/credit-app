import { View, Text, FlatList, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import API from '../../../src/api/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../src/context/AuthContext';
import { on } from '../../../src/utils/eventBus';
import { useTheme } from '../../../src/context/ThemeContext';
import AddTransactionModal from '../../../src/components/AddTransactionModal';
import BarChart75 from '../../../src/components/CustomerUsageChart';
import CustomerUsageChart from '../../../src/components/CustomerUsageChart';


interface Transaction {
  description: string;
  id: number;
  customerName: string;
  amount: number;
  date: string;
  status?: 'pending' | 'settled';
}

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

  // fetch total credit and recent transactions
  const fetchData = async () => {
    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const totalRes = await API.get('/transactions/total-credit', headers);
      setTotalCredit(totalRes.data.totalCredit);

      const transRes = await API.get('/transactions/recent-transactions', headers);
      setTransactions(transRes.data.transactions);
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    //listen for new transactions being added
    const unsubAdded = on('transactions:added', fetchData);

    // listen for transactions being settled
    const unsubSettled = on('transactions:settled', (updatedTransaction: Transaction) => {
      
      fetchData();

      // update recent transactions locally
      setTransactions(prev =>
        prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
      );
    });

    return () => {
      unsubAdded();
      unsubSettled();
    };
  }, [token]);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const amountColor = item.status === 'settled' ? '#16a34a' : '#d97706'; 
    const dateStr = item.date
      ? new Date(item.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '';

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
        {/* greeting and profile button */}
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
          
        {/* total credit card */}
        <View style={cardStyle}>
          <Text style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}>Total Credit Given</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', marginTop: 8, color: '#d97706' }}>
            रू{totalCredit.toLocaleString()}
          </Text>
        </View>

        <CustomerUsageChart />

        {/* recent transactions card */}
        <View style={cardStyle}>
          
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#111' }}>
              Recent Transactions
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* add transaction button */}
              <Pressable
                style={{
                  backgroundColor: '#2563eb',
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  marginRight: 8,
                }}
                onPress={() => setModalVisible(true)}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
              </Pressable>

              {/* view all button */}
              <Pressable onPress={() => router.push('../transactions')}>
                <Text style={{ color: '#2563eb', fontWeight: '600' }}>View all</Text>
              </Pressable>
            </View>
          </View>

          {/* transactions list */}
          {transactions.length === 0 ? (
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No recent transactions.</Text>
          ) : (
            <FlatList
              data={transactions.slice(0, 3)}
              keyExtractor={item => item.id.toString()}
              renderItem={renderTransaction}
            />
          )}
        </View>
        
      </View>

      {/* add transaction modal component */}
      <AddTransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} onAdded={fetchData} />
      </>}
      ListFooterComponent={<View style={{ height: 14 }} />} // padding at the bottom
      contentContainerStyle={{ padding: 0}}
      />
    </SafeAreaView>
  );
};

export default Home;
