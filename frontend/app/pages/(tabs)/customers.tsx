import { View, Text, TextInput, Pressable, FlatList, Modal, Alert } from "react-native";
import { useEffect, useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import API from "../../../src/api/api";
import { router } from 'expo-router';
import { AuthContext } from "../../../src/context/AuthContext"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/context/ThemeContext";
import CustomerCardModal from "../../../src/components/CustomerCardModal"; // import the modal component

type Customer = {
  id: number;
  full_name: string;
  phone_number: string;
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullnameError, setFullnameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);

  const { token } = useContext(AuthContext);
  const { isDark } = useTheme();

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await API.get("/customers", headers);
      setCustomers(res.data);
      setFilteredCustomers(res.data);
    } catch (err: any) {
      console.error('Fetch customers error:', err?.response?.data ?? err.message ?? err);
    }
  };

  useEffect(() => { fetchCustomers(); }, [token]);
  useEffect(() => {
    if (!search) return setFilteredCustomers(customers);
    setFilteredCustomers(customers.filter(c =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number.includes(search)
    ));
  }, [search, customers]);

  const resetAddCustomerForm = () => {
    setFullName('');
    setPhoneNumber('');
    setFullnameError('');
    setPhoneError('');
  };

  const addCustomer = async () => {
    setFullnameError(''); setPhoneError('');
    if (!fullName) { setFullnameError('Full name is required'); return; }
    if (!phoneNumber) { setPhoneError('Phone number is required'); return; }

    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await API.post("/customers", { full_name: fullName, phone_number: phoneNumber }, headers);
      if (res.data.success) {
        Alert.alert("Success", res.data.message);
        resetAddCustomerForm();
        setModalVisible(false);
        fetchCustomers(); // update list
      } else {
        Alert.alert(res.data.message);
      }
    } catch (err: any) {
      console.log("Customer add error", err);
      Alert.alert("Error", err?.response?.data?.message ?? "Failed to add customer.");
    }
  };

  const openCustomerModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6', padding: 16 }}>
      {/* Search + Add */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TextInput
          placeholder="Search by name or phone"
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            backgroundColor: isDark ? '#1f2937' : '#fff',
            padding: 12,
            borderRadius: 12,
            marginRight: 8,
            color: isDark ? '#fff' : '#111',
          }}
        />
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 12 }}
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => openCustomerModal(item)}>
            <View style={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              borderRadius: 12,
              marginBottom: 8,
              shadowColor: '#000',
              shadowOpacity: 0.1
            }}>
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#111' }}>{item.full_name}</Text>
                <Text style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>{item.phone_number}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Add Customer Modal (same as before) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:16 }}>
          <View style={{ backgroundColor:isDark ? '#1f2937' : '#fff', padding:20, borderRadius:12 }}>
            <Text style={{ fontSize:18, fontWeight:'700', marginBottom:12, color: isDark ? '#fff' : '#111' }}>Add Customer</Text>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={fullName}
              onChangeText={(text) => { setFullName(text); if(fullnameError)setFullnameError(''); }}
              style={{
                borderWidth:1, borderColor: isDark ? '#374151' : '#d1d5db',
                padding:12, borderRadius:8, marginBottom:12, color: isDark ? '#fff' : '#111',
                backgroundColor: isDark ? '#111827' : '#fff'
              }}
            />
            {fullnameError ? <Text style={{ color:'red', marginBottom:8 }}>{fullnameError}</Text> : null}
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={phoneNumber}
              onChangeText={(text) => { setPhoneNumber(text); if(phoneError)setPhoneError(''); }}
              keyboardType="phone-pad"
              style={{
                borderWidth:1, borderColor: isDark ? '#374151' : '#d1d5db',
                padding:12, borderRadius:8, marginBottom:12, color: isDark ? '#fff' : '#111',
                backgroundColor: isDark ? '#111827' : '#fff'
              }}
            />
            {phoneError ? <Text style={{ color:'red', marginBottom:8 }}>{phoneError}</Text> : null}
            <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
              <Pressable onPress={() => { resetAddCustomerForm(); setModalVisible(false); }} style={{ marginRight:16 }}>
                <Text style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={addCustomer}>
                <Text style={{ color:'#2563eb', fontWeight:'700' }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerCardModal
          visible={customerModalVisible}
          customer={selectedCustomer}
          onClose={() => setCustomerModalVisible(false)}
          onUpdated={fetchCustomers} // refresh list if updated
        />
      )}
    </SafeAreaView>
  );
}
