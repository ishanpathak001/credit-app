import { FC, useState } from "react";
import { SafeAreaView, View, Text, Pressable, Modal, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { BlurView } from "expo-blur";
import { TextInput } from "react-native-paper";
import API from "../api/api";
import { useNavigation } from "@react-navigation/native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCustomerAdded?: () => void;
};

const AddCustomerModal: FC<Props> = ({ visible, onClose, onCustomerAdded }) => {
  const [newName, setNewName] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [newCredit, setNewCredit] = useState<string>("");
  const [fullNameError, setFullNameError] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigation = useNavigation();

  const handleAddCustomer = async () => {
    setFullNameError("");
    setPhoneNumberError("");

    if (!newName) return setFullNameError("Full Name is required");
    if (!newPhone) return setPhoneNumberError("Phone Number is required");

    setLoading(true);

    try {
      const res = await API.post("/customers/addcustomer", {
        user_id: 1, // Replace with actual logged-in user ID
        full_name: newName,
        phone_number: newPhone,
        total_credit: newCredit || 0,
      });

      setNewName("");
      setNewPhone("");
      setNewCredit("");
      onClose();
      onCustomerAdded?.(); // Refresh list

      if (res.data.success) {
        console.log("Successfully added customer.");
        Alert.alert("Success", res.data.message || "Customer added successfully");
      } else {
        Alert.alert(res.data.message || "Failed to add customer");
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert(err.response?.data?.message || "Failed to add customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gray-100 px-4">
      <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} style={{ width: "100%" }}>
        <BlurView intensity={80} tint="dark" className="absolute inset-0 justify-center items-center px-4">
          
            <View className="bg-white rounded-xl p-6 w-full">
              <Text className="text-xl font-bold mb-4">Add New Customer</Text>

              {fullNameError ? <Text className="text-red-600 mb-2">{fullNameError}</Text> : null}
              {phoneNumberError ? <Text className="text-red-600 mb-2">{phoneNumberError}</Text> : null}

              <TextInput
                label="Full Name"
                value={newName}
                onChangeText={(text) => {
                  setNewName(text);
                  if (fullNameError) setFullNameError("");
                }}
                activeUnderlineColor="black"
                underlineColor="black"
                style={{ width: "100%", backgroundColor: "transparent", marginBottom: 12 }}
              />

              <TextInput
                label="Phone Number"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={(text) => {
                  setNewPhone(text);
                  if (phoneNumberError) setPhoneNumberError("");
                }}
                activeUnderlineColor="black"
                underlineColor="black"
                style={{ width: "100%", backgroundColor: "transparent", marginBottom: 12 }}
              />

              <TextInput
                label="Initial Credit (optional)"
                value={newCredit}
                onChangeText={setNewCredit}
                keyboardType="numeric"
                activeUnderlineColor="black"
                underlineColor="black"
                style={{ width: "100%", backgroundColor: "transparent", marginBottom: 12 }}
              />

              <Pressable
                onPress={handleAddCustomer}
                className="bg-black p-4 rounded-md mb-2"
                disabled={loading}
                style={{ width: "100%", alignSelf: "center" }}
              >
                <Text className="text-white text-center font-semibold">{loading ? "Adding..." : "Add Customer"}</Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                className="bg-gray-300 p-4 rounded-md"
                style={{ width: "100%", alignSelf: "center" }}
              >
                <Text className="text-center font-semibold">Cancel</Text>
              </Pressable>
            </View>
          
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

export default AddCustomerModal;
