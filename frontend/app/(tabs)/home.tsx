import { View, Text, Pressable } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import API from "../../src/api/api"; // <-- import your API instance

export default function Home({}) {
const { user, isLoggedIn } = useContext(AuthContext);

useEffect(() => {
  if (isLoggedIn && user) {
    console.log("Current logged-in user:", user);
    // Example output:
    // { id: 1, full_name: "Ishan Pathak", phone_number: "9800000000" }
  }
}, [isLoggedIn, user]);


  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text>hello</Text>
    </View>
  );
}
