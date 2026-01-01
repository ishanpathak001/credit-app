import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import API from '../../../src/api/api';
import AddTransactionModal from '../../../src/components/AddTransactionModal';
import TransactionDetailModal from '../../../src/components/TransactionDetailModal';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: number;
  customerName: string;
  amount: number;
  date: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter(t => {
      if (!q) return true;
      const name = (t.customerName || '').toLowerCase();
      const phone = (t as any).customerPhone || '';
      return name.includes(q) || phone.includes(q);
    });
  }, [transactions, search]);

  const groupedTransactions = useMemo(() => {
    const groups: { dateLabel: string; items: Transaction[] }[] = [];
    for (const t of filteredTransactions) {
      const label = new Date(t.date).toLocaleDateString();
      const g = groups.find(x => x.dateLabel === label);
      if (g) g.items.push(t);
      else groups.push({ dateLabel: label, items: [t] });
    }
    return groups;
  }, [filteredTransactions]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await API.get('/all-transactions');
        setTransactions(res.data.transactions);
      } catch (err) {
        console.log('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Pressable onPress={() => { setSelectedTransaction(item); setDetailVisible(true); }}>
      <View className="flex-row justify-between p-4 bg-white rounded-xl mb-2 shadow">
        <View>
          <Text className="font-semibold text-gray-800">{item.customerName}</Text>
          <Text className="text-gray-500 text-sm">{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <Text className="font-bold text-green-600">₹{item.amount.toLocaleString()}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className='flex-row'>
      <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">All Transactions</Text>

      {loading ? (
        <Text className="text-gray-500">Loading transactions...</Text>
      ) : transactions.length === 0 ? (
        <Text className="text-gray-500">No transactions found.</Text>
      ) : (
        <>
          <TextInput
            placeholder="Search by customer name or phone"
            value={search}
            onChangeText={setSearch}
            className="bg-white p-3 rounded-lg mb-4"
            style={{ width: '100%' }}
          />

          {groupedTransactions.length === 0 ? (
            <Text className="text-gray-500">No transactions found.</Text>
          ) : (
            <FlatList
              data={groupedTransactions}
              keyExtractor={(g) => g.dateLabel}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', marginVertical: 6 }}>{item.dateLabel}</Text>
                  <FlatList
                    data={item.items}
                    keyExtractor={(t) => t.id.toString()}
                    renderItem={renderTransaction}
                    scrollEnabled={false}
                  />
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          )}
        </>
      )}

      {/* Floating Add button */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{ position: 'absolute', right: 20, bottom: 30 }}
        className="bg-blue-500 p-4 rounded-full shadow-lg"
      >
        <Text className="text-white font-bold text-lg">+</Text>
      </Pressable>

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdded={() => {
          // refresh transactions after adding
          setLoading(true);
          (async () => {
            try {
              const res = await API.get('/all-transactions');
              setTransactions(res.data.transactions);
            } catch (err) {
              console.log('Refresh transactions error:', err);
            } finally {
              setLoading(false);
            }
          })();
        }}
      />
      <TransactionDetailModal
        visible={detailVisible}
        onClose={() => { setDetailVisible(false); setSelectedTransaction(null); }}
        transaction={selectedTransaction}
      />
    </View>
    </SafeAreaView>
  );
};

export default Transactions;
