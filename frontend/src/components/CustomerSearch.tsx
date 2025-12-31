import { FC, useState, useEffect } from "react";
import { View, TextInput, ScrollView, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddCustomerModal from "./AddCustomerModal";

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
  onSearch: (query: string) => void; // ✅ added
};

const CustomerSearch: FC<Props> = ({
  customers,
  onSelectCustomer,
  onSearch
}) => {
  const [search, setSearch] = useState("");

  //CALL API WHEN USER TYPES
  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <View className="flex-1">
      {/* Search Bar */}
      <View className="px-4 py-3"> 
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-12">
          <Ionicons name="search-outline" size={20} color="#555" />
          <TextInput
            placeholder="Search Customers..."
            value={search}
            onChangeText={setSearch}
            className="ml-2 flex-1 text-gray-800 text-base"
          />
        </View>
      </View>

        

      {/* Customer List */}
      <ScrollView className="flex-1 px-4">
        {customers.length === 0 && search ? (
          <Text className="text-center text-gray-500 mt-6">
            No customers found
          </Text>
        ) : (
          customers.map((customer) => (
            <Pressable
              key={customer.id}
              onPress={() => onSelectCustomer(customer)}
              className="bg-cyan-900 p-4 rounded-md mb-2"
            >
              <Text className="font-semibold">{customer.full_name}</Text>
              <Text className="text-gray-500">{customer.phone_number}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default CustomerSearch;
