import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../src/context/AuthContext';
import API from '../../src/api/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { token, user } = useContext(AuthContext);

  const [profile, setProfile] = useState<any | null>(null);
  const [totalCredit, setTotalCredit] = useState<number | null>(null);
  const [topCustomer, setTopCustomer] = useState<{
    id: number;
    name: string;
    phone: string;
    totalCredit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const joinedDate = profile?.created_at ? new Date(profile.created_at) : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (token) {
          // Fetch profile, total credit, and top customer in parallel
          const [profileRes, totalRes, topRes] = await Promise.all([
            API.get('/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
            API.get('/total-credit', { headers: { Authorization: `Bearer ${token}` } }),
            API.get('/users/most-credit-customer', { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          setProfile(profileRes.data);
          setTotalCredit(totalRes.data?.totalCredit ?? 0);
          setTopCustomer(topRes.data?.customer ?? null);
        } else if (user) {
          setProfile(user);

          try {
            const t = await API.get('/total-credit');
            setTotalCredit(t.data?.totalCredit ?? 0);

            const top = await API.get('/users/most-credit-customer');
            setTopCustomer(top.data?.customer ?? null);
          } catch (_) {
            setTotalCredit(0);
            setTopCustomer(null);
          }
        }
      } catch (err: any) {
        console.log('Profile fetch error:', err?.response?.data ?? err?.message ?? err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );

  return (
   <SafeAreaView className='flex-1'>
     <>
      <Stack.Screen options={{ headerShown: false }} />

      <View >
        {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row ml-4 ">
        <Ionicons name="arrow-back" size={24} color="black"  />
      </TouchableOpacity>
       {/* Profile Name */}
        <View style={{ alignItems: 'center', marginBottom: 24, justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>
            {profile?.full_name ?? profile?.name ?? 'User'}
          </Text>
          {/* <Text style={{ color: 'gray', marginTop: 6 }}>{profile?.phone_number ?? ''}</Text> */}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
       

        {/* Total Credit */}
        <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 }}>
          <Text style={{ color: 'gray' }}>Total Credit Given</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', marginTop: 8 }}>
            ₹{(totalCredit ?? 0).toLocaleString()}
          </Text>
        </View>

        {/* Account Info */}
        <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Account Info</Text>
          <Text style={{ marginTop: 8 }}>Phone Number: {profile?.phone_number ?? ''}</Text>
          
          <Text style={{ marginTop: 8 }}>
            Member since {joinedDate?.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Most Credit Taken Customer */}
        <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginTop: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Top Customer</Text>
          {topCustomer ? (
            <>
              <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 6 }}>{topCustomer.name}</Text>
              <Text style={{ color: 'gray', marginTop: 2 }}>{topCustomer.phone}</Text>
              <Text style={{ fontSize: 28, fontWeight: '700', marginTop: 8 }}>
                ₹{topCustomer.totalCredit.toLocaleString()}
              </Text>
            </>
          ) : (
            <Text style={{ marginTop: 6, color: 'gray' }}>No customer data yet</Text>
          )}
        </View>
      </ScrollView>
    </>
   </SafeAreaView>
  );
}
