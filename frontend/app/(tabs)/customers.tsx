import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, View, Pressable, Modal, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomerCard from "../../src/components/CustomerCard";
import API from "../../src/api/api";
import AddCustomerModal from "../../src/components/AddCustomerModal";
import { BlurView } from "expo-blur";
import CustomerDetailCard from "@/src/components/CustomerDetailCard";
import CustomerSearch from "../../src/components/CustomerSearch";

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/search");
      setCustomers(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSelectCustomer = async (customer: any) => {
    try {
      const res = await API.get(`/search/${customer.id}`);
      setSelectedCustomer(res.data);
      setModalVisible(true);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-row items-center bg-gray-100 width">

      {/* Customer Search Component */}
      <CustomerSearch customers={customers} onSelectCustomer={handleSelectCustomer} />

      {/* Add Customer Button */}
      <View className="flex-row justify-end px-6 pt-4">
        <Pressable
          onPress={() => setAddModalVisible(true)}
          className="bg-blue-600 p-3 rounded-md"
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>


      {/* Customer Detail Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <BlurView intensity={80} tint="dark" className="absolute inset-0 justify-center items-center px-4">
          {selectedCustomer && (
            <CustomerDetailCard
              fullName={selectedCustomer.full_name}
              phoneNumber={selectedCustomer.phone_number}
              totalCredit={selectedCustomer.total_credit}
              transactionsCount={selectedCustomer.transactions_count}
              onClose={() => setModalVisible(false)}
            />
          )}
        </BlurView>
      </Modal>

      {/* Add Customer Modal */}
      <AddCustomerModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onCustomerAdded={fetchCustomers}
      />
    </SafeAreaView>
  );
}