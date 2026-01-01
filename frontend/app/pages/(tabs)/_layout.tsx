import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/context/ThemeContext";

export default function TabsLayout() {
  const { isDark } = useTheme();

  // Tab bar colors
  const tabBarBackground = isDark ? "#000000ff" : "#ffffff";
  const tabBarBorder = isDark ? "#1f2937" : "#e5e7eb";
  const activeTintColor = isDark ? "#fbbf24" : "#2563eb";
  const inactiveTintColor = isDark ? "#9ca3af" : "#6b7280";

 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden", // ensures the rounded corners work
          borderTopColor: tabBarBackground, // same as background to hide the top border
          position: "absolute", // remove extra white gap
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Customers Tab */}
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Transactions Tab */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

       {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
