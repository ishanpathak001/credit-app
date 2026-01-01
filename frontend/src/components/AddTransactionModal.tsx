import React, { FC, useEffect, useState, useContext } from 'react';
import { Modal, View, Text, TextInput, Pressable, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import API from '../api/api';
import { emit } from '../utils/eventBus';
import { AuthContext } from '../context/AuthContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdded?: () => void;
};

const AddTransactionModal: FC<Props> = ({ visible, onClose, onAdded }) => {
  const { token } = useContext(AuthContext);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [customerError, setCustomerError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');

  useEffect(() => {
    if (!visible) return;
    const fetchCustomers = async () => {
      try {
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await API.get('/customers', headers);
        setCustomers(res.data || []);
      } catch (err) {
        console.log('Error fetching customers for modal:', err);
      }
    };
    fetchCustomers();
  }, [visible, token]);

  const submit = async () => {
    // reset errors
    setCustomerError(''); setAmountError(''); setDescriptionError('');
    let hasError = false;
    if (!customerId) { setCustomerError('Customer is required'); hasError = true; }
    if (!amount || isNaN(Number(amount))) { setAmountError('Valid amount is required'); hasError = true; }
    if (!description || description.trim() === '') { setDescriptionError('Description is required'); hasError = true; }
    if (hasError) { Alert.alert('Validation', 'Please fill all required fields'); return; }

    setLoading(true);
    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const body: any = { amount: Number(amount), description, customer_id: customerId };
      const res = await API.post('/credits', body, headers);
      if (res.data?.success) {
        // notify other parts of the app that a transaction was added
        try { emit('transactions:added', res.data.transaction ?? res.data); } catch {}
        onAdded?.();
        onClose();
      } else {
        Alert.alert('Error', 'Failed to add transaction');
      }
    } catch (err: any) {
      console.log('Add transaction error:', err?.response ?? err);
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Add Transaction</Text>

          <Text style={{ marginBottom: 6 }}>Customer <Text style={{ color: 'red' }}>*</Text></Text>
          <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12 }}>
            <Pressable onPress={() => setDropdownOpen(o => !o)} style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>{customers.find(c => c.id === customerId)?.full_name ?? 'Select customer'}</Text>
              <Text style={{ color: '#666' }}>{dropdownOpen ? '▲' : '▼'}</Text>
            </Pressable>

            {dropdownOpen ? (
              <ScrollView style={{ maxHeight: 200, borderTopWidth: 1, borderTopColor: '#eee' }}>
                {customers.length === 0 ? (
                  <Text style={{ padding: 12, color: 'gray' }}>No customers</Text>
                ) : (
                  customers.map(c => (
                    <Pressable key={c.id} onPress={() => { setCustomerId(c.id); setDropdownOpen(false); }} style={{ padding: 12, backgroundColor: customerId === c.id ? '#eef' : 'transparent' }}>
                      <Text>{c.full_name} - {c.phone_number}</Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            ) : null}
          </View>
          {customerError ? <Text style={{ color: 'red', marginBottom: 8 }}>{customerError}</Text> : null}

          <Text style={{ marginBottom: 6 }}>Amount <Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 }}
          />
          {amountError ? <Text style={{ color: 'red', marginBottom: 8 }}>{amountError}</Text> : null}

          <Text style={{ marginBottom: 6 }}>Description <Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 }}
          />
          {descriptionError ? <Text style={{ color: 'red', marginBottom: 8 }}>{descriptionError}</Text> : null}

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable onPress={onClose} style={{ marginRight: 12 }}>
              <Text style={{ color: '#666' }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit}>
              <Text style={{ color: '#007AFF', fontWeight: '700' }}>{loading ? 'Adding...' : 'Add'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddTransactionModal;
