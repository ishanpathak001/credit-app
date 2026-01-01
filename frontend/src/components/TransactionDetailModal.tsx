import React, { FC } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';

type Transaction = {
  id: number;
  customerName?: string;
  customerPhone?: string;
  amount: number;
  date: string;
  description?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
};

const TransactionDetailModal: FC<Props> = ({ visible, onClose, transaction }) => {
  if (!transaction) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%' }}>
          <ScrollView>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{transaction.customerName ?? 'Transaction'}</Text>
            {transaction.customerPhone ? <Text style={{ color: 'gray', marginBottom: 8 }}>{transaction.customerPhone}</Text> : null}

            <View style={{ backgroundColor: '#f7f7f7', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: 'gray' }}>Amount</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 6 }}>₹{transaction.amount.toLocaleString()}</Text>
            </View>

            <Text style={{ color: 'gray' }}>Date</Text>
            <Text style={{ marginBottom: 8 }}>{new Date(transaction.date).toLocaleString()}</Text>

            <Text style={{ color: 'gray' }}>Notes</Text>
            <Text style={{ marginBottom: 12 }}>{transaction.description ?? '-'}</Text>

            <Text style={{ color: 'gray' }}>Transaction ID</Text>
            <Text style={{ marginBottom: 12 }}>{transaction.id}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable onPress={onClose} style={{ padding: 8 }}>
                <Text style={{ color: '#007AFF', fontWeight: '700' }}>Close</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TransactionDetailModal;
