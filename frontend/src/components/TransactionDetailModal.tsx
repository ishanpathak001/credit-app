import React, { FC, useState, useEffect, useContext } from 'react';
import { Modal, View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { emit } from '../utils/eventBus';

type Transaction = {
  id: number;
  customerName?: string;
  customerPhone?: string;
  amount: number;
  date: string;
  description?: string;
  status?: 'pending' | 'settled';
};

type Props = {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
};

const TransactionDetailModal: FC<Props> = ({ visible, onClose, transaction }) => {
  const { token } = useContext(AuthContext);
  const [localTransaction, setLocalTransaction] = useState<Transaction | null>(transaction ?? null);
  const [loading, setLoading] = useState(false);

  // Update local transaction when prop changes
  useEffect(() => {
    setLocalTransaction(transaction ?? null);
  }, [transaction]);

  if (!localTransaction) return null;

  const isSettled = localTransaction.status === 'settled';

  const handleSettle = async () => {
    if (!localTransaction || isSettled) return;

    if (!token) {
      Alert.alert('Authentication error', 'No token found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.patch(
        `/credits/${localTransaction.id}/settle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.transaction) {
        const updatedTransaction = res.data.transaction;
        setLocalTransaction(updatedTransaction); // update modal locally

        // 🔔 Notify parent pages (Home / Transactions) that this transaction is now settled
        emit('transactions:settled', updatedTransaction);

        Alert.alert('Success', 'Transaction settled successfully.');
      }
    } catch (err: any) {
      console.error('Settle error:', err.response?.data ?? err.message);
      Alert.alert('Error', err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            maxHeight: '80%',
          }}
        >
          <ScrollView>
            {/* Customer / Transaction Name */}
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              {localTransaction.customerName ?? 'Transaction'}
            </Text>

            {localTransaction.customerPhone && (
              <Text style={{ color: 'gray', marginBottom: 8 }}>{localTransaction.customerPhone}</Text>
            )}

            {/* Amount */}
            <View
              style={{
                backgroundColor: '#f7f7f7',
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: 'gray' }}>Amount</Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  marginTop: 6,
                  color: isSettled ? '#16a34a' : '#d97706', // green if settled, yellow if pending
                }}
              >
                रू{localTransaction.amount.toLocaleString()}
              </Text>
            </View>

            {/* Date */}
            <Text style={{ color: 'gray' }}>Date</Text>
            <Text style={{ marginBottom: 8 }}>
              {new Date(localTransaction.date).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>

            {/* Notes */}
            <Text style={{ color: 'gray' }}>Notes</Text>
            <Text style={{ marginBottom: 12 }}>{localTransaction.description ?? '-'}</Text>

            {/* Status */}
            <Text style={{ color: 'gray' }}>Status</Text>
            <Text
              style={{
                marginBottom: 12,
                fontWeight: '700',
                color: isSettled ? '#16a34a' : '#d97706',
              }}
            >
              {isSettled ? 'Settled' : 'Pending'}
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <Pressable
                disabled={isSettled || loading}
                onPress={handleSettle}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  backgroundColor: isSettled ? '#9ca3af' : '#16a34a',
                  opacity: loading ? 0.7 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />}
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  {isSettled ? 'Settled' : 'Settle'}
                </Text>
              </Pressable>

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
