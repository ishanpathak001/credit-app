import React, { FC, useEffect, useState, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [globalLimit, setGlobalLimit] = useState<number | null>(null);

  const [customerError, setCustomerError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const resetForm = () => {
    setCustomerId(null);
    setAmount('');
    setDescription('');
    setCustomerError('');
    setAmountError('');
    setDescriptionError('');
    setDropdownOpen(false);
  };

  /* ======================================================
     FETCH CUSTOMERS + GLOBAL LIMIT
     ====================================================== */
  useEffect(() => {
    if (!visible || !token) {
      resetForm();
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [customersRes, limitRes] = await Promise.all([
          API.get('/customers', { headers }),
          API.get('/users/global-limit', { headers }),
        ]);

        setCustomers(customersRes.data || []);

        if (limitRes.data?.success) {
          setGlobalLimit(limitRes.data.global_credit_limit);
        }
      } catch (err) {
        console.log('Error fetching modal data:', err);
      }
    };

    fetchData();
  }, [visible, token]);

  /* ======================================================
     SUBMIT
     ====================================================== */
  const submit = async () => {
    setCustomerError('');
    setAmountError('');
    setDescriptionError('');

    let hasError = false;

    if (!customerId) {
      setCustomerError('Customer is required');
      hasError = true;
    }
    if (!amount || isNaN(Number(amount))) {
      setAmountError('Valid amount is required');
      hasError = true;
    }
    if (!description.trim()) {
      setDescriptionError('Description is required');
      hasError = true;
    }

    if (hasError) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 🔹 Fetch pending total (existing API you already use)
      const res = await API.get(`/customers/${customerId}/transactions`, {
        headers,
      });

      const pendingTotal = res.data?.total_pending ?? 0;

      const selectedCustomer = customers.find(c => c.id === customerId);
      const customerLimit = selectedCustomer?.credit_limit ?? null;

      const effectiveLimit = customerLimit ?? globalLimit;

      if (effectiveLimit != null) {
        if (pendingTotal >= effectiveLimit) {
          Alert.alert(
            'Credit Limit Reached',
            `This customer already has ₹${pendingTotal} pending, which reaches the limit of ₹${effectiveLimit}.`
          );
          return;
        }

        if (pendingTotal + Number(amount) > effectiveLimit) {
          Alert.alert(
            'Credit Limit Exceeded',
            `Adding this transaction exceeds the allowed limit.\n\nPending: ₹${pendingTotal}\nLimit: ₹${effectiveLimit}`
          );
          return;
        }
      }

      setLoading(true);

      const createRes = await API.post(
        '/credits',
        {
          customer_id: customerId,
          amount: Number(amount),
          description,
        },
        { headers }
      );

      if (createRes.data?.success) {
        emit('transactions:added', createRes.data.transaction ?? createRes.data);
        onAdded?.();
        resetForm();
        onClose();
      } else {
        Alert.alert('Error', 'Failed to add transaction');
      }
    } catch (err: any) {
      console.log('Add transaction error:', err?.response ?? err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to add transaction'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { resetForm(); onClose(); }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>

          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Add Transaction
          </Text>

          <Text>Customer *</Text>
          <Pressable
            onPress={() => setDropdownOpen(o => !o)}
            style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 }}
          >
            <Text>
              {customers.find(c => c.id === customerId)?.full_name || 'Select customer'}
            </Text>
          </Pressable>

          {dropdownOpen && (
            <ScrollView style={{ maxHeight: 200 }}>
              {customers.map(c => (
                <Pressable
                  key={c.id}
                  onPress={() => { setCustomerId(c.id); setDropdownOpen(false); }}
                  style={{ padding: 12 }}
                >
                  <Text>{c.full_name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {customerError ? <Text style={{ color: 'red' }}>{customerError}</Text> : null}

          <Text>Amount *</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8 }}
          />

          <Text>Description *</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8 }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
            <Pressable onPress={() => { resetForm(); onClose(); }} style={{ marginRight: 12 }}>
              <Text>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} disabled={loading}>
              <Text style={{ fontWeight: '700' }}>
                {loading ? 'Adding…' : 'Add'}
              </Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default AddTransactionModal;
