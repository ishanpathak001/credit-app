import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../../../src/api/api';
import { AuthContext } from '../../../src/context/AuthContext';
import { useTheme } from '../../../src/context/ThemeContext';
import AddTransactionModal from '../../../src/components/AddTransactionModal';
import TransactionDetailModal from '../../../src/components/TransactionDetailModal';
import { useGlobalSearchParams } from 'expo-router';
import { on } from '../../../src/utils/eventBus';

type Transaction = {
  id: number;
  customerName?: string;
  customerPhone?: string;
  amount: number;
  date: string;
  description?: string;
  status?: 'pending' | 'settled';
};

const Transactions = () => {
  const { token } = useContext(AuthContext);
  const { isDark } = useTheme();
  const params = useGlobalSearchParams();
  const customerPhoneParam = params.phone as string | undefined;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(customerPhoneParam || '');
  const [filter, setFilter] = useState<'15d' | '1m' | 'all'>('15d');

  const [addVisible, setAddVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // fetch transactions
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

    // listen for global updates
    const unsubSettled = on('transactions:settled', (updatedTransaction: Transaction) => {
      setTransactions(prev =>
        prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
      );
    });

    const unsubCustomerAdded = on('customers:added', () => {
      fetchTransactions(); // refresh when new customer is added
    });

    const unsubCustomerDeleted = on('customers:deleted', (deletedCustomerPhone: string) => {
      setTransactions(prev => prev.filter(t => t.customerPhone !== deletedCustomerPhone));
    });

    const unsubTransactionAdded = on('transactions:added', (newTransaction: Transaction) => {
      setTransactions(prev => [newTransaction, ...prev]);
    });

    return () => {
      unsubSettled?.();
      unsubCustomerAdded?.();
      unsubCustomerDeleted?.();
      unsubTransactionAdded?.();
    };
  }, [filter, token]);

  // filter transactions based on search input
  const filteredTransactions = transactions.filter(t => {
    const q = search.toLowerCase();
    return (
      t.customerName?.toLowerCase().includes(q) ||
      t.customerPhone?.includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSettled = item.status === 'settled';
    const amountColor = isSettled ? '#16a34a' : '#d97706';

    return (
      <Pressable
        onPress={() => {
          setSelectedTransaction(item);
          setDetailVisible(true);
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderRadius: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ fontWeight: '600', color: isDark ? '#fff' : '#111' }}>
              {item.customerName ?? 'Customer'}
            </Text>
            {item.customerPhone && (
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                {item.customerPhone}
              </Text>
            )}
            {item.description && (
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                {item.description}
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '700', color: amountColor }}>
              रू{item.amount.toLocaleString()}
            </Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>
              {new Date(item.date).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '600', color: amountColor }}>
              {item.status?.toUpperCase() ?? 'PENDING'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#111827' : '#f3f4f6',
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16, color: isDark ? '#fff' : '#111' }}>
        All Transactions
      </Text>

      {/* Filters */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {['15d', '1m', 'all'].map(f => (
          <Pressable
            key={f}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              alignItems: 'center',
              marginRight: 8,
              backgroundColor: filter === f ? '#2563eb' : isDark ? '#1f2937' : '#fff',
            }}
            onPress={() => setFilter(f as '15d' | '1m' | 'all')}
          >
            <Text style={{ fontWeight: '600', color: filter === f ? '#fff' : isDark ? '#fff' : '#111' }}>
              {f === '15d' ? 'Last 15 Days' : f === '1m' ? '1 Month' : 'All'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* search and add */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TextInput
          placeholder="Search by customer, phone, or description"
          placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            padding: 12,
            marginRight: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#374151' : '#d1d5db',
            backgroundColor: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#fff' : '#111',
          }}
        />
        <Pressable
          onPress={() => setAddVisible(true)}
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#2563eb',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
        </Pressable>
      </View>

      {/* transaction list */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />
      ) : filteredTransactions.length === 0 ? (
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 32 }}>No transactions found.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {filteredTransactions.map(t => (
            <View key={t.id}>{renderTransaction({ item: t })}</View>
          ))}
        </ScrollView>
      )}

      {/* modal call of add and detail transaction */}
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
