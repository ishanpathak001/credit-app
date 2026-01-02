import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../src/context/AuthContext";
import API from "../../../src/api/api";
import { useTheme } from "../../../src/context/ThemeContext";
import { router, Stack, useGlobalSearchParams } from "expo-router";

type Transaction = {
  id: number;
  amount: number;
  description?: string;
  date: string;
  status?: "pending" | "settled";
};

type Customer = {
  id: number;
  full_name: string;
  phone_number: string;
};

type Props = {
  onUpdated?: () => void; // callback to refresh customers list/stats
};

export default function CustomerProfile({ onUpdated }: Props) {
  const { token } = useContext(AuthContext);
  const { isDark } = useTheme();
  const params = useGlobalSearchParams();
  const customerId = parseInt(params.id as string, 10);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPending, setTotalPending] = useState(0);
  const [totalCreditTaken, setTotalCreditTaken] = useState(0);

  const fetchCustomer = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const resCustomer = await API.get(`/customers/${customerId}`, headers);
      setCustomer(resCustomer.data);

      const resTransactions = await API.get(`/customers/${customerId}/transactions`, headers);
      const allTransactions: Transaction[] = resTransactions.data.transactions || [];
      setTransactions(allTransactions);

      const pending = allTransactions
        .filter(t => t.status === "pending")
        .reduce((acc, t) => acc + (t.amount ?? 0), 0);

      const totalTaken = allTransactions
        .reduce((acc, t) => acc + (t.amount ?? 0), 0);

      setTotalPending(pending);
      setTotalCreditTaken(totalTaken);
    } catch (err: any) {
      console.error("Customer profile fetch error:", err);
      Alert.alert("Error", "Failed to fetch customer profile");
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async () => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure? All of ${customer?.full_name}'s transactions will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
              const res = await API.delete(`/customers/${customerId}`, headers);
              if (res.data.success) {
                Alert.alert("Deleted", res.data.message);
                if (onUpdated) onUpdated(); // refresh parent pages
                router.back(); // go back to customers list
              } else {
                Alert.alert("Error", "Failed to delete customer");
              }
            } catch (err: any) {
              console.error("Delete customer error:", err);
              Alert.alert("Error", err?.response?.data?.message ?? "Failed to delete customer");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId, token]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
        <ActivityIndicator color={isDark ? "#fff" : "#111"} size="large" />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
        <Text style={{ color: isDark ? "#fff" : "#111" }}>Customer not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header with Back Button */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? "#374151" : "#d1d5db" }}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#111"} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: "700", color: isDark ? "#fff" : "#111" }}>{customer.full_name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Customer Info */}
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: isDark ? "#1f2937" : "#fff" }}>
          <Text style={{ fontWeight: "600", color: isDark ? "#d1d5db" : "#6b7280" }}>Phone Number</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#fff" : "#111" }}>{customer.phone_number}</Text>
        </View>

        {/* Total Credit Stats */}
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: isDark ? "#1f2937" : "#fff", gap: 8 }}>
          <Text style={{ fontWeight: "600", color: isDark ? "#d1d5db" : "#6b7280" }}>Total Pending Credit</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? "#fff" : "#111" }}>₹{totalPending.toLocaleString()}</Text>

          <Text style={{ fontWeight: "600", color: isDark ? "#d1d5db" : "#6b7280", marginTop: 8 }}>Total Credit Taken</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? "#fff" : "#111" }}>₹{totalCreditTaken.toLocaleString()}</Text>
        </View>

        {/* View Transactions Button */}
        <Pressable
          onPress={() => router.push({ pathname: "../customers", params: { phone: customer.phone_number } })}
          style={{ backgroundColor: "#2563eb", padding: 16, borderRadius: 12, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>View Transactions</Text>
        </Pressable>

        {/* Delete Customer Button */}
        <Pressable
          onPress={deleteCustomer}
          style={{ backgroundColor: "#ef4444", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Delete Customer Data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
