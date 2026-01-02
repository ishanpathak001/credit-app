import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  /* =========================
     FETCH TRANSACTIONS
     ========================= */
  const fetchTransactions = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await API.get(
        `/transactions/all-transactions?filter=${filter}`,
        { headers }
      );
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Fetch transactions error:', err);
      Alert.alert('Error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EVENT LISTENERS
     ========================= */
  useEffect(() => {
    fetchTransactions();

    const unsubAdded = on('transactions:added', () => {
      fetchTransactions();
    });

    const unsubSettled = on('transactions:settled', () => {
      fetchTransactions();
    });

    const unsubCustomersUpdated = on('customers:updated', () => {
      fetchTransactions();
    });

    return () => {
      unsubAdded?.();
      unsubSettled?.();
      unsubCustomersUpdated?.();
    };
  }, [filter, token]);

  /* =========================
     SEARCH FILTER
     ========================= */
  const filteredTransactions = transactions.filter(t => {
    const q = search.toLowerCase();
    return (
      t.customerName?.toLowerCase().includes(q) ||
      t.customerPhone?.includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  /* =========================
     RENDER TRANSACTION
     ========================= */
  const renderTransaction = (item: Transaction) => {
    const isSettled = item.status === 'settled';
    const amountColor = isSettled ? '#16a34a' : '#d97706';

    return (
      <Pressable
        key={item.id}
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
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', color: isDark ? '#fff' : '#111' }}>
              {item.customerName ?? 'Customer'}
            </Text>

            {item.customerPhone && (
              <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }}>
                {item.customerPhone}
              </Text>
            )}

            {item.description && (
              <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }}>
                {item.description}
              </Text>
            )}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '700', color: amountColor }}>
              रू{item.amount.toLocaleString()}
            </Text>

            <Text style={{ fontSize: 10, color: isDark ? '#9ca3af' : '#6b7280' }}>
              {new Date(item.date).toLocaleString('en-IN')}
            </Text>

            <Text style={{ fontSize: 10, fontWeight: '600', color: amountColor }}>
              {item.status?.toUpperCase() ?? 'PENDING'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  /* =========================
     UI
     ========================= */
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#111827' : '#f3f4f6',
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          marginBottom: 16,
          color: isDark ? '#fff' : '#111',
        }}
      >
        All Transactions
      </Text>

      {/* FILTERS */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {['15d', '1m', 'all'].map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f as any)}
            style={{
              flex: 1,
              padding: 12,
              marginRight: 8,
              borderRadius: 12,
              backgroundColor:
                filter === f ? '#2563eb' : isDark ? '#1f2937' : '#fff',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '600',
                color: filter === f ? '#fff' : isDark ? '#fff' : '#111',
              }}
            >
              {f === '15d' ? 'Last 15 Days' : f === '1m' ? '1 Month' : 'All'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* SEARCH + ADD */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#fff' : '#111',
            marginRight: 8,
          }}
        />
        <Pressable
          onPress={() => setAddVisible(true)}
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#2563eb',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
        </Pressable>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : filteredTransactions.length === 0 ? (
        <Text>No transactions found</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {filteredTransactions.map(renderTransaction)}
        </ScrollView>
      )}

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
