import { View, Text } from "react-native";
import { Button } from "react-native-paper";
import { AuthContext } from '@/src/context/AuthContext';
import { useContext } from "react";

export default function Profile() {
 
   const { logout } = useContext(AuthContext);
  
    return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile</Text>
         
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Welcome Home 🎉</Text>
      <Button  onPress={logout}>Logout</Button>
    
    </View>
  );
}
