import { Stack } from "expo-router";
import "./globals.css";
import { useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext, AuthProvider } from "../src/context/AuthContext";  

export default function LayoutWrapper() {
  return(
     <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}


 function Layout() {

  // const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  const { isLoggedIn } = useContext(AuthContext);
  console.log("Current login state:", isLoggedIn);

  //prevent rendering while auth state is loading
  if (isLoggedIn ===null){
    return <></>;
  }

  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

       <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack.Protected>      
    </Stack>
  );


  //  return (
  //   <Stack>
     
  //       <Stack.Screen name="tabs/login" options={{ headerShown: false }} />
        
  //   </Stack>
  // );
}
