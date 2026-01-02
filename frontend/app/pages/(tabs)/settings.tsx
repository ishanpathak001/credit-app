import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../../src/context/AuthContext';
import { useTheme } from '../../../src/context/ThemeContext';
import API from '../../../src/api/api';

const Settings = () => {
  const { user, token, logout } = useContext(AuthContext);
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [globalLimitInput, setGlobalLimitInput] = useState('');
  const [currentLimit, setCurrentLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* ======================================================
     FETCH GLOBAL LIMIT
     ====================================================== */
  useEffect(() => {
    if (!token) return;

    const fetchLimit = async () => {
      try {
        const res = await API.get('/users/global-limit', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setCurrentLimit(res.data.global_credit_limit);
        }
      } catch (err) {
        console.error('Fetch global limit error:', err);
      }
    };

    fetchLimit();
  }, [token]);

  /* ======================================================
     SAVE GLOBAL LIMIT
     ====================================================== */
  const handleSaveGlobalLimit = async () => {
    const value = parseFloat(globalLimitInput);

    if (isNaN(value) || value < 0) {
      Alert.alert('Invalid Value', 'Please enter a valid positive number.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.put(
        '/users/global-limit',
        { global_credit_limit: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCurrentLimit(res.data.global_credit_limit);
        setGlobalLimitInput('');
        Alert.alert('Success', 'Global credit limit updated');
      }
    } catch (err) {
      console.error('Update limit error:', err);
      Alert.alert('Error', 'Failed to update limit');
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     LOGOUT
     ====================================================== */
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className={isDark ? 'flex-1 bg-gray-900' : 'flex-1 bg-gray-100'}>
      <View className="flex-1 p-4">

        <Text className={isDark ? 'text-2xl font-bold text-white mb-6' : 'text-2xl font-bold text-gray-800 mb-6'}>
          Settings
        </Text>

        {/* Profile */}
        <View className={isDark ? 'bg-gray-800 p-4 rounded-2xl mb-6' : 'bg-white p-4 rounded-2xl mb-6'}>
          <Text className={isDark ? 'text-gray-300' : 'text-gray-500'}>Logged in as</Text>
          <Text className={isDark ? 'text-white font-bold text-lg' : 'text-gray-800 font-bold text-lg'}>
            {user?.full_name}
          </Text>
        </View>

        {/* Theme */}
        <View className={isDark ? 'bg-gray-800 p-4 rounded-2xl mb-6 flex-row justify-between' : 'bg-white p-4 rounded-2xl mb-6 flex-row justify-between'}>
          <Text className={isDark ? 'text-white' : 'text-gray-800'}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>

        {/* Global Limit */}
        <View className={isDark ? 'bg-gray-800 p-4 rounded-2xl mb-6' : 'bg-white p-4 rounded-2xl mb-6'}>
          <Text className={isDark ? 'text-gray-300 mb-2' : 'text-gray-500 mb-2'}>
            Limit for each customer:
          </Text>

          <TextInput
            value={globalLimitInput}
            onChangeText={setGlobalLimitInput}
            keyboardType="numeric"
            placeholder={
              currentLimit !== null
                ? `Current limit: रू${currentLimit}`
                : 'Enter global credit limit'
            }
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            className={isDark ? 'bg-gray-700 text-white p-3 rounded-xl' : 'bg-gray-100 text-gray-900 p-3 rounded-xl'}
          />

          <Pressable
            onPress={handleSaveGlobalLimit}
            disabled={loading}
            className={`mt-4 p-4 rounded-xl items-center ${loading ? 'bg-gray-500' : 'bg-blue-500'}`}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-bold">Save Limit</Text>}
          </Pressable>
        </View>

        <Pressable className="bg-red-500 p-4 rounded-xl items-center" onPress={handleLogout}>
          <Text className="text-white font-bold">Logout</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
};

export default Settings;
