import { View, Text, TextInput, Pressable, FlatList, Modal, Alert, GestureResponderEvent, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import API from "../../src/api/api";
import { useNavigation } from "@react-navigation/native";
import { router } from 'expo-router';
import { AuthContext } from "../../src/context/AuthContext"; 
import { SafeAreaView } from "react-native-safe-area-context";


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

  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<Array<any>>([]);
  const [customerLoading, setCustomerLoading] = useState(false);


  useEffect(() => {
    fetchCustomers();
  }, [token]);

  useEffect(() => {
    filterCustomers();
  }, [search, customers]);

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
    setFullnameError('');
    setPhoneError('');

    if (!fullName) { setFullnameError('Full name is required'); return; }
    if (!phoneNumber) { setPhoneError('Phone number is required'); return; }
    

    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res=await API.post("/customers", {
        full_name: fullName,
        phone_number: phoneNumber
      }, headers);
      setModalVisible(false);
      setFullName("");
      setPhoneNumber("");
      fetchCustomers();
      if (res.data.success) {
        console.log("Customer successfully added");
        Alert.alert(
          "Success",
          res.data.message,
          // [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
      else {
        Alert.alert(res.data.message);
      }
    } catch (err: any) {
      console.log("Customer add error", err);

      if (err.response && err.response.data && err.response.data.message) {
        Alert.alert(err.response.data.message);
      } else {
        Alert.alert("Error", "Failed to add customer.");
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">

      {/* Search + Add */}
      <View className="flex-row items-center mb-4">
        <TextInput
          placeholder="Search by name or phone"
          value={search}
          onChangeText={setSearch}
          className="flex-1 bg-white p-3 rounded-lg border mr-2"
        />

        <Pressable
          onPress={() => setModalVisible(true)}
          className="bg-blue-600 p-3 rounded-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-white p-0 rounded-xl mb-3 shadow">
            <Pressable className="p-4" onPress={() => openCustomerModal(item.id)}>
              <Text className="text-lg font-semibold">{item.full_name}</Text>
              <Text className="text-gray-600">{item.phone_number}</Text>
            </Pressable>
          </View>
        )}
      />

      {/* Add Customer Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white p-5 rounded-xl">
            <Text className="text-lg font-bold mb-3">Add Customer</Text>

            <TextInput
              placeholder="Full Name"
              value={fullName}
              onChangeText={(text) => {
                (setFullName(text));
                if (fullnameError) setFullnameError('');
              }}
              className="border p-3 rounded-lg mb-3"
            />

            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={(text) => {
                (setPhoneNumber(text));
                if (phoneError) setPhoneError('');
              }}
              keyboardType="phone-pad"
              className="border p-3 rounded-lg mb-4"
            />

            <View className="flex-row justify-end">
              <Pressable onPress={() => setModalVisible(false)} className="mr-4">
                <Text className="text-gray-600">Cancel</Text>
              </Pressable>

              <Pressable onPress={addCustomer}>
                <Text className="text-blue-600 font-bold">Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Customer Details Modal */}
      <Modal visible={customerModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white p-5 rounded-xl max-h-full">
            {customerLoading ? (
              <ActivityIndicator />
            ) : (
              <ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} className="mb-3">
                  <View>
                    <Text className="text-xl font-bold">{selectedCustomer?.full_name}</Text>
                    <Text className="text-gray-600">{selectedCustomer?.phone_number}</Text>
                  </View>
                  <Pressable onPress={() => { setCustomerModalVisible(false); router.push(`/customer/${selectedCustomer?.id}`); }} style={{ padding: 6 }}>
                    <Text style={{ color: '#2563eb', fontWeight: '600' }}>Open Profile</Text>
                  </Pressable>
                </View>

                <View className="bg-gray-50 p-3 rounded mb-4">
                  <Text className="text-gray-500">Total Credit Taken</Text>
                  <Text className="font-bold text-lg mt-1">₹{(selectedCustomer?.total_credit ?? totalCreditForSelected()).toLocaleString()}</Text>
                </View>

                <Text className="font-semibold mb-2">Transactions</Text>
                {customerTransactions.length === 0 ? (
                  <Text className="text-gray-500">No transactions for this customer.</Text>
                ) : (
                  <>
                    {customerTransactions.slice(0, 3).map((t) => (
                      <View key={t.id} className="bg-gray-100 p-3 rounded mb-2">
                        <Text className="font-semibold" numberOfLines={1} ellipsizeMode="tail">{t.description ?? 'Credit'}</Text>
                        <Text className="text-gray-500">{new Date(t.date).toLocaleString()}</Text>
                        <Text className="font-bold mt-1">₹{t.amount.toLocaleString()}</Text>
                      </View>
                    ))}
                    {customerTransactions.length > 3 ? (
                      <Pressable onPress={() => router.push('/transactions')} className="mt-2">
                        <Text style={{ color: '#2563eb', fontWeight: '600' }}>View all transactions</Text>
                      </Pressable>
                    ) : null}
                  </>
                )}

                <View className="flex-row justify-end mt-4">
                  <Pressable onPress={() => setCustomerModalVisible(false)} className="mr-4">
                    <Text className="text-gray-600">Close</Text>
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
