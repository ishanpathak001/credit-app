import { Stack } from "expo-router";
import "./globals.css";
import { useState } from "react";
import LoginScreen from "./tabs/login";

const [isLoggedIn, setIsLoggedIn] = useState(false);
export default function Layout() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    // Render the login screen directly, not inside a stack
    return <LoginScreen setIsLoggedIn={setIsLoggedIn} />;
  }

  // Only render the stack when logged in
  return (
    <Stack>
      <Stack.Screen name="tabs/home" options={{ headerShown: false }} />
    </Stack>
  );
}
