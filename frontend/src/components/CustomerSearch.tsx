import { FC, useState, useEffect } from "react";
import { View, TextInput, ScrollView, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Customer = {
  id: number;
  full_name: string;
  phone_number: string;
  total_credit?: number;
  transactions_count?: number;
};

type Props = {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
};

const CustomerSearch: FC<Props> = ({ customers, onSelectCustomer }) => {
  const [search, setSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!search) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(
        (c) =>
          c.full_name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone_number.includes(search)
      );
      setFilteredCustomers(filtered);
    }
  }, [search, customers]);

  return (
    <View className="flex-1 pt-4">
      {/* Search Bar */}
      <View className="flex-row items-center mt-4 mb-4 gap-2 px-4">
        <View className="flex-1 flex-row items-center bg-white rounded-md px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#555" />
          <TextInput
            placeholder="Search Customers..."
            value={search}
            onChangeText={setSearch}
            className="ml-2 flex-1 text-gray-800"
          />
        </View>
      </View>

      {/* Filtered Customer List */}
      <ScrollView className="mb-4">
        {filteredCustomers.map((customer) => (
          <Pressable
            key={customer.id}
            onPress={() => onSelectCustomer(customer)}
            className="bg-white p-4 rounded-md mb-2"
          >
            <Text className="font-semibold">{customer.full_name}</Text>
            <Text className="text-gray-500">{customer.phone_number}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default CustomerSearch;
