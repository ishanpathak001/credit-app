import { View, Text, TextInput, Pressable, FlatList, Modal, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import API from "../../../src/api/api";
import { useNavigation } from "@react-navigation/native";
import { router } from 'expo-router';
import { AuthContext } from "../../../src/context/AuthContext"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/context/ThemeContext";

type Customer = {
  id: number;
  full_name: string;
  phone_number: string;
};

export default function Customers() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullnameError, setFullnameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const { user, token } = useContext(AuthContext);
  const { isDark } = useTheme();

  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<Array<any>>([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  useEffect(() => { fetchCustomers(); }, [token]);
  useEffect(() => { filterCustomers(); }, [search, customers]);

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

  const openCustomerModal = async (id: number) => {
    setCustomerLoading(true);
    setCustomerModalVisible(true);
    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const [cRes, tRes] = await Promise.all([
        API.get(`/customers/${id}`, headers),
        API.get(`/customers/${id}/transactions`, headers),
      ]);
      setSelectedCustomer(cRes.data);
      setCustomerTransactions(tRes.data.transactions || []);
    } catch (err: any) {
      console.error('Error loading customer details', err?.response?.data ?? err.message ?? err);
      Alert.alert('Error', 'Failed to load customer details');
      setCustomerModalVisible(false);
    } finally {
      setCustomerLoading(false);
    }
  };

  const totalCreditForSelected = () => {
    return customerTransactions.reduce((acc, t) => acc + (t?.amount ?? 0), 0);
  };

  const filterCustomers = () => {
    if (!search) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter(c =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number.includes(search)
    );
    setFilteredCustomers(filtered);
  };

  const addCustomer = async () => {
    setFullnameError(''); setPhoneError('');
    if (!fullName) { setFullnameError('Full name is required'); return; }
    if (!phoneNumber) { setPhoneError('Phone number is required'); return; }

    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res=await API.post("/customers", { full_name: fullName, phone_number: phoneNumber }, headers);
      setModalVisible(false); setFullName(""); setPhoneNumber(""); fetchCustomers();
      if (res.data.success) {
        Alert.alert("Success", res.data.message);
      } else { Alert.alert(res.data.message); }
    } catch (err: any) {
      console.log("Customer add error", err);
      Alert.alert("Error", err?.response?.data?.message ?? "Failed to add customer.");
    }
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
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.1 }}>
            <Pressable style={{ padding: 16 }} onPress={() => openCustomerModal(item.id)}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#111' }}>{item.full_name}</Text>
              <Text style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>{item.phone_number}</Text>
            </Pressable>
          </View>
        )}
      />

      {/* Add Customer Modal */}
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
            <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
              <Pressable onPress={()=>setModalVisible(false)} style={{ marginRight:16 }}>
                <Text style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={addCustomer}>
                <Text style={{ color:'#2563eb', fontWeight:'700' }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Customer Details Modal */}
      <Modal visible={customerModalVisible} transparent animationType="slide">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:16 }}>
          <View style={{ backgroundColor:isDark ? '#1f2937' : '#fff', padding:20, borderRadius:12, maxHeight:'90%' }}>
            {customerLoading ? (
              <ActivityIndicator color={isDark ? '#fff' : '#111'} />
            ) : (
              <ScrollView>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <View>
                    <Text style={{ fontSize:18, fontWeight:'700', color: isDark ? '#fff' : '#111' }}>{selectedCustomer?.full_name}</Text>
                    <Text style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>{selectedCustomer?.phone_number}</Text>
                  </View>
                  <Pressable onPress={()=>{ setCustomerModalVisible(false); router.push(`../customer/${selectedCustomer?.id}`); }}>
                    <Text style={{ color:'#2563eb', fontWeight:'600' }}>Open Profile</Text>
                  </Pressable>
                </View>

                <View style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding:12, borderRadius:8, marginBottom:12 }}>
                  <Text style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>Total Credit Taken</Text>
                  <Text style={{ fontWeight:'700', fontSize:16, marginTop:4, color: isDark ? '#fff' : '#111' }}>
                    ₹{(selectedCustomer?.total_credit ?? totalCreditForSelected()).toLocaleString()}
                  </Text>
                </View>

                <Text style={{ fontWeight:'600', marginBottom:8, color: isDark ? '#fff' : '#111' }}>Transactions</Text>
                {customerTransactions.length === 0 ? (
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No transactions for this customer.</Text>
                ) : (
                  <>
                    {customerTransactions.slice(0,3).map((t) => (
                      <View key={t.id} style={{ backgroundColor:isDark ? '#1f2937' : '#f3f4f6', padding:12, borderRadius:8, marginBottom:8 }}>
                        <Text style={{ fontWeight:'600', color:isDark ? '#fff' : '#111' }} numberOfLines={1} ellipsizeMode="tail">{t.description ?? 'Credit'}</Text>
                        <Text style={{ color:isDark ? '#d1d5db' : '#6b7280' }}>{new Date(t.date).toLocaleString()}</Text>
                        <Text style={{ fontWeight:'700', marginTop:4, color:isDark ? '#fff' : '#111' }}>₹{t.amount.toLocaleString()}</Text>
                      </View>
                    ))}
                    {customerTransactions.length > 3 && (
                      <Pressable onPress={() => router.push('../transactions')} style={{ marginTop:8 }}>
                        <Text style={{ color:'#2563eb', fontWeight:'600' }}>View all transactions</Text>
                      </Pressable>
                    )}
                  </>
                )}

                <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop:16 }}>
                  <Pressable onPress={()=>setCustomerModalVisible(false)}>
                    <Text style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>Close</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
