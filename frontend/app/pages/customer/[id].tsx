import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../src/context/AuthContext";
import API from "../../../src/api/api";
import { useTheme } from "../../../src/context/ThemeContext";
import { router, Stack, useGlobalSearchParams } from "expo-router";
import { emit } from "@/src/utils/eventBus";

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

export default function CustomerProfile() {
  const { token } = useContext(AuthContext);
  const { isDark } = useTheme();
  const params = useGlobalSearchParams();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPending, setTotalPending] = useState(0);
  const [totalCreditTaken, setTotalCreditTaken] = useState(0);

  /* =========================
     FETCH CUSTOMER + TXNS
     ========================= */
  const fetchCustomer = async () => {
    if (!customerId || !token) return;

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const resCustomer = await API.get(
        `/customers/${customerId}`,
        { headers }
      );
      setCustomer(resCustomer.data);

      const resTransactions = await API.get(
        `/customers/${customerId}/transactions`,
        { headers }
      );

      const txns: Transaction[] = resTransactions.data.transactions || [];
      setTransactions(txns);

      const pending = txns
        .filter(t => t.status === "pending")
        .reduce((sum, t) => sum + t.amount, 0);

      const total = txns.reduce((sum, t) => sum + t.amount, 0);

      setTotalPending(pending);
      setTotalCreditTaken(total);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch customer");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE CUSTOMER
     ========================= */
  const deleteCustomer = () => {
    Alert.alert(
      "Confirm Deletion",
      "This will permanently delete the customer and all transactions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = { Authorization: `Bearer ${token}` };
              await API.delete(`/customers/${customerId}`, { headers });

              // 🔥 IMPORTANT PART
              emit("customers:updated");
              emit("transactions:updated");

              Alert.alert("Deleted", "Customer deleted successfully");
              router.back();
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Delete failed"
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId, token]);

  /* =========================
     UI STATES
     ========================= */
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <Text>Customer not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER: BACK */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#111"}
          />
        </Pressable>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            marginLeft: 12,
            color: isDark ? "#fff" : "#111",
          }}
        >
          {customer.full_name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#fff" }}>
          <Text>Phone</Text>
          <Text>{customer.phone_number}</Text>
        </View>

        <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#fff" }}>
          <Text>Pending</Text>
          <Text>₹{totalPending}</Text>

          <Text>Total Taken</Text>
          <Text>₹{totalCreditTaken}</Text>
        </View>

        <Pressable
          onPress={deleteCustomer}
          style={{
            backgroundColor: "#ef4444",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Delete Customer
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}


