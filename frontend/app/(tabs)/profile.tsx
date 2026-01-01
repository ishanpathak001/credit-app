import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../src/context/AuthContext';
import API from '../../src/api/api';

export default function ProfileScreen() {
  const { token, user } = useContext(AuthContext);
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [totalCredit, setTotalCredit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (token) {
          const [pRes, tRes] = await Promise.all([
              API.get('/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
              API.get('/total-credit', { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setProfile(pRes.data);
          setTotalCredit(tRes.data?.totalCredit ?? 0);
        } else if (user) {
          setProfile(user);
          try {
            const t = await API.get('/total-credit');
            setTotalCredit(t.data?.totalCredit ?? 0);
          } catch (_) {
            setTotalCredit(0);
          }
        }
      } catch (err: any) {
        console.log('Profile fetch error:', err?.response?.data ?? err?.message ?? err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: profile?.full_name ?? user?.full_name ?? 'Profile',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 12 }}>
              <Ionicons name="arrow-back" size={22} color="black" />
            </TouchableOpacity>
          ),
          tabBarStyle: { display: 'none' },
        }}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>{profile?.full_name ?? profile?.name ?? 'User'}</Text>
        <Text style={{ color: 'gray', marginTop: 6 }}>{profile?.phone_number ?? profile?.email ?? ''}</Text>
      </View>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 }}>
        <Text style={{ color: 'gray' }}>Total Credit Given</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', marginTop: 8 }}>₹{(totalCredit ?? 0).toLocaleString()}</Text>
      </View>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Account Info</Text>
        <Text style={{ marginTop: 8 }}>ID: {profile?.id}</Text>
        <Text>Joined: N/A</Text>
      </View>
    </ScrollView>
    </>
  );
}
