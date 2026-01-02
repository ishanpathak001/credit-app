import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../src/context/AuthContext';
import API from '../../src/api/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { token, user } = useContext(AuthContext);
  const { isDark } = useTheme();

  const [profile, setProfile] = useState<any>(user ?? null);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [topCustomer, setTopCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const joinedDate = profile?.created_at ? new Date(profile.created_at) : null;

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch profile, total credit, and top customer in parallel
      const [profileRes, totalRes, topRes] = await Promise.all([
        API.get('/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/users/total-credit', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/users/most-credit-customer', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setProfile(profileRes.data ?? user);
      setTotalCredit(totalRes.data?.totalCredit ?? 0);
      setTopCustomer(topRes.data?.customer ?? null);
    } catch (err: any) {
      console.log('Profile fetch error:', err?.response?.data ?? err?.message ?? err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#111827' : '#f3f4f6' }}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#2563eb'} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 16 }}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111'} />
      </TouchableOpacity>

      {/* Profile Name */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: isDark ? '#fff' : '#111' }}>
          {profile?.full_name ?? profile?.name ?? 'User'}
        </Text>
        {profile?.phone_number && (
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4 }}>{profile.phone_number}</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Total Credit */}
        <View
          style={{
            backgroundColor: isDark ? '#1f2937' : '#fff',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: isDark ? '#9ca3af' : 'gray' }}>Total Credit Given (All Time)</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', marginTop: 8, color: '#d90606ff' }}>
            ₹{totalCredit.toLocaleString()}
          </Text>
        </View>

        {/* Account Info */}
        <View
          style={{
            backgroundColor: isDark ? '#1f2937' : '#fff',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#111' }}>Account Info</Text>
          {profile?.phone_number && (
            <Text style={{ marginTop: 8, color: isDark ? '#e5e7eb' : '#111' }}>
              Phone Number: {profile.phone_number}
            </Text>
          )}
          {joinedDate && (
            <Text style={{ marginTop: 8, color: isDark ? '#9ca3af' : '#6b7280' }}>
              Member since {joinedDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </Text>
          )}
        </View>

        {/* Top Customer */}
        <View
          style={{
            backgroundColor: isDark ? '#1f2937' : '#fff',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#111' }}>Top Customer</Text>
          {topCustomer ? (
            <>
              <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 6, color: isDark ? '#fff' : '#111' }}>
                {topCustomer.name}
              </Text>
              <Text style={{ color: isDark ? '#9ca3af' : 'gray', marginTop: 2 }}>{topCustomer.phone}</Text>
              <Text style={{ fontSize: 28, fontWeight: '700', marginTop: 8, color: '#d97706' }}>
                ₹{topCustomer.totalCredit.toLocaleString()}
              </Text>
            </>
          ) : (
            <Text style={{ marginTop: 6, color: isDark ? '#9ca3af' : 'gray' }}>No customer data yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
