import { View, Text, TextInput, Pressable, FlatList, Modal, Alert, GestureResponderEvent } from "react-native";
import { useEffect, useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import API from "../../src/api/api";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../src/context/AuthContext"; 


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
  const { user } = useContext(AuthContext);


  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [search, customers]);

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customers");
      setCustomers(res.data);
      setFilteredCustomers(res.data);
    } catch (err: any) {
      console.error(err.message);
    }
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

  const addCustomer = async (e: GestureResponderEvent) => {
    e.preventDefault();
    setFullnameError('');
    setPhoneError('');
    
    if (!fullName) setFullnameError('Full name is required');
    if (!phoneError) setPhoneError('Password is required');
    

    try {
      const res=await API.post("/customers", {
        
        full_name: fullName,
        phone_number: phoneNumber
      });
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
    <View className="flex-1 bg-gray-100 p-4">

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
          <View className="bg-white p-4 rounded-xl mb-3 shadow">
            <Text className="text-lg font-semibold">{item.full_name}</Text>
            <Text className="text-gray-600">{item.phone_number}</Text>
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

    </View>
  );
}
