import { Stack } from "expo-router";
import "./globals.css";
import { useEffect, useState, useContext } from "react";
import { AuthContext, AuthProvider } from "../src/context/AuthContext";  
import { ThemeProvider } from "../src/context/ThemeContext";

export default function LayoutWrapper() {
  return(
     <AuthProvider>
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
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
        <Stack.Screen name="pages/(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

       <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack.Protected>      
    </Stack>
  );


 
}
