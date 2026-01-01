import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import API from '../../../src/api/api';
import { AuthContext } from '../../../src/context/AuthContext';

type Transaction = { id: number; amount: number; description?: string; date: string };

export default function CustomerDetail() {
  const { id } = useLocalSearchParams();
  const { token } = useContext(AuthContext);
  const [customer, setCustomer] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const [cRes, tRes] = await Promise.all([
          API.get(`/customers/${id}`, headers),
          API.get(`/customers/${id}/transactions`, headers),
        ]);
        setCustomer(cRes.data);
        const txs = tRes.data.transactions || [];
        const sorted = txs.slice().sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sorted);
      } catch (err: any) {
        console.log('Customer detail fetch error:', err?.response?.data ?? err?.message ?? err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, token]);

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;

  return (
    <View>
      <Stack.Screen
        options={{
          headerShown: true,
          title: customer?.full_name ?? 'Customer',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 12 }}>
              <Ionicons name="arrow-back" size={22} color="black" />
            </TouchableOpacity>
          ),
          tabBarStyle: { display: 'none' },
        }}
      />

      <View style={{ flex: 1, padding: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>{customer?.full_name}</Text>
        <Text style={{ color: 'gray' }}>{customer?.phone_number}</Text>
        {(customer?.created_at || customer?.createdAt) && (
          <Text style={{ color: 'gray' }}>Added on {new Date(customer?.created_at || customer?.createdAt).toLocaleDateString()}</Text>
        )}
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Transactions</Text>
      {transactions.length === 0 ? (
        <Text style={{ color: 'gray' }}>No transactions for this customer.</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <Text style={{ fontWeight: '600' }}>{item.description ?? 'Credit'}</Text>
              <Text style={{ color: 'gray' }}>{new Date(item.date).toLocaleString()}</Text>
              <Text style={{ marginTop: 6, fontWeight: '700' }}>₹{item.amount.toLocaleString()}</Text>
            </View>
          )}
        />
      )}
      </View>
    </View>
  );
}
