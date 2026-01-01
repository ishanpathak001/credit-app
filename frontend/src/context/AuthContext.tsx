import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await API.get('/users/profile', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(res.data);
        } catch (err: any) {
          console.log(err);
          setUser(null);
        }
      }
      setLoading(false);
      setIsLoggedIn(!!storedToken);
    };
    loadUser();
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const res = await API.post('/users/login', { phone_number: phone, password });
      console.log('AuthContext.login response:', res.data);
      const token = res.data.token;
      await AsyncStorage.setItem('token', token);
      setToken(token);
      setUser(res.data.user);
      setIsLoggedIn(true);
      return res.data;
    } catch (err: any) {
      console.log('AuthContext.login error:', err?.response?.data ?? err?.message ?? err);
      throw err;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
