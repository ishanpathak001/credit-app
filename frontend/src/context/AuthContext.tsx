import { createContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserType = {
  full_name: string;
  email?: string;
};

type AuthContextType = {
  isLoggedIn: boolean | null;
  user: UserType | null;
  login: (userData: UserType) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: null,
  user: null,
  login: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const storedLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      const storedUser = await AsyncStorage.getItem("user");

      setIsLoggedIn(storedLoggedIn === "true");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    checkLogin();
  }, []);

  const login = async (userData: UserType) => {
    await AsyncStorage.setItem("isLoggedIn", "true");
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
