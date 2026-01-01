import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../../../src/api/api';
import { AuthContext } from '../../../src/context/AuthContext';
import AddTransactionModal from '../../../src/components/AddTransactionModal';
import TransactionDetailModal from '../../../src/components/TransactionDetailModal';

type Transaction = {
  id: number;
  customerName: string;
  customerPhone?: string;
  amount: number;
  date: string;
  description?: string;
};

const Transactions = () => {
  const { token } = useContext(AuthContext);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'15d' | '1m' | 'all'>('15d');

  const [addVisible, setAddVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await API.get(`/transactions/all-transactions?filter=${filter}`, headers);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      Alert.alert('Error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter, token]);

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(t => {
    const q = search.toLowerCase();
    return (
      t.customerName?.toLowerCase().includes(q) ||
      t.customerPhone?.includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  // Render each transaction
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Pressable
      onPress={() => {
        setSelectedTransaction(item);
        setDetailVisible(true);
      }}
    >
      <View className="flex-row justify-between p-4 bg-white rounded-xl mb-2 shadow">
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text className="font-semibold text-gray-800">{item.customerName ?? 'Customer'}</Text>
          {item.customerPhone && (
            <Text className="text-gray-500 text-sm">{item.customerPhone}</Text>
          )}
          {item.description && (
            <Text className="text-gray-500 text-sm">{item.description}</Text>
          )}
        </View>
        <View className="items-end">
          <Text className="font-bold text-green-600">₹{item.amount.toLocaleString()}</Text>
          <Text className="text-gray-500 text-xs">{new Date(item.date).toLocaleDateString()}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      {/* Heading */}
      <Text className="text-2xl font-bold text-gray-800 mb-4">All Transactions</Text>

      {/* Filters */}
      <View className="flex-row m-4 space-x-2">
        {['15d', '1m', 'all'].map(f => (
          <Pressable
            key={f}
            className={`flex-1 p-3 rounded-xl items-center mr-2 ${
              filter === f ? 'bg-blue-500' : 'bg-white'
            }`}
            onPress={() => setFilter(f as '15d' | '1m' | 'all')}
          >
            <Text className={`${filter === f ? 'text-white' : 'text-gray-800'} font-semibold`}>
              {f === '15d' ? 'Last 15 Days' : f === '1m' ? '1 Month' : 'All'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search & Add */}
      <View className="flex-row  mb-4 space-x-2">
        <TextInput
          placeholder="Search by customer, phone, or description"
          value={search}
          onChangeText={setSearch}
          className="flex-1 bg-white p-3 mr-2 rounded-xl border"
        />
        <Pressable
          onPress={() => setAddVisible(true)}
          className="bg-blue-500 p-3 rounded-xl items-center justify-center"
        >
          <Text className="text-white font-bold">Add</Text>
        </Pressable>
      </View>

      {/* Transaction List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-6" />
      ) : filteredTransactions.length === 0 ? (
        <Text className="text-gray-500 mt-6">No transactions found.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {filteredTransactions.map(t => (
            <View key={t.id}>{renderTransaction({ item: t })}</View>
          ))}
        </ScrollView>
      )}

      {/* Modals */}
      <AddTransactionModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onAdded={fetchTransactions}
      />
      <TransactionDetailModal
        visible={detailVisible}
        transaction={selectedTransaction}
        onClose={() => {
          setDetailVisible(false);
          setSelectedTransaction(null);
        }}
      />
    </SafeAreaView>
  );
};

export default Transactions;
