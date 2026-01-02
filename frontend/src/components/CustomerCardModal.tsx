import React, { FC, useEffect, useState, useContext } from "react";
import { Modal, View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { useTheme } from "../context/ThemeContext";
import { router } from "expo-router";

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
  visible: boolean;
  customer: Customer;
  onClose: () => void;
  onUpdated?: () => void; // optional callback if customer list needs refresh
};

const CustomerCardModal: FC<Props> = ({ visible, customer, onClose, onUpdated }) => {
  const { token } = useContext(AuthContext);
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingCredit, setPendingCredit] = useState(0);
  const [recentPending, setRecentPending] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await API.get(`/customers/${customer.id}/transactions`, headers);

      const allTransactions: Transaction[] = res.data.transactions || [];
      const totalPending: number = res.data.total_pending ?? 0;

      const pending = allTransactions
        .filter(t => t.status === "pending")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      setTransactions(allTransactions);
      setPendingCredit(totalPending);
      setRecentPending(pending);
    } catch (err: any) {
      console.error("Error fetching customer transactions:", err?.response ?? err);
      Alert.alert("Error", "Failed to fetch customer transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchTransactions();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
        <View style={{ backgroundColor: isDark ? "#1f2937" : "#fff", borderRadius: 12, padding: 16, maxHeight: "80%" }}>
          <ScrollView>
            {/* Customer Header */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: isDark ? "#fff" : "#111" }}>
                {customer.full_name}
              </Text>
              <Text style={{ color: isDark ? "#d1d5db" : "#6b7280" }}>{customer.phone_number}</Text>
            </View>

            {/* Total Pending Credit */}
            <View style={{ backgroundColor: isDark ? "#111827" : "#f3f4f6", padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: isDark ? "#d1d5db" : "#6b7280" }}>Total Pending Credit</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 4, color: isDark ? "#fff" : "#111" }}>
                ₹{pendingCredit.toLocaleString()}
              </Text>
            </View>

            {/* Recent Pending Transactions */}
            <Text style={{ fontWeight: "600", marginBottom: 8, color: isDark ? "#fff" : "#111" }}>
              Recent Pending Transactions
            </Text>
            {loading ? (
              <ActivityIndicator color={isDark ? "#fff" : "#111"} />
            ) : recentPending.length === 0 ? (
              <Text style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>No pending transactions</Text>
            ) : (
              recentPending.map((t) => (
                <View
                  key={t.id}
                  style={{
                    backgroundColor: isDark ? "#1f2937" : "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#111" }} numberOfLines={1} ellipsizeMode="tail">
                    {t.description ?? "Credit"}
                  </Text>
                  <Text style={{ color: isDark ? "#d1d5db" : "#6b7280", fontSize: 12 }}>
                    {new Date(t.date).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={{ fontWeight: "700", marginTop: 4, color: isDark ? "#fff" : "#111" }}>
                    ₹{t.amount.toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Buttons: Open Profile & Close */}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12, gap: 12 }}>
            <Pressable
              onPress={() => {
                onClose(); // close the modal
                router.push({ pathname: "../../pages/customer/[id]", params: { id: customer.id.toString() } });
              }}
              style={{ backgroundColor: "#2563eb", padding: 12, borderRadius: 12 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Open Profile</Text>
            </Pressable>


            <Pressable onPress={onClose} style={{ padding: 12 }}>
              <Text style={{ color: isDark ? "#d1d5db" : "#6b7280", fontWeight: "700" }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomerCardModal;
