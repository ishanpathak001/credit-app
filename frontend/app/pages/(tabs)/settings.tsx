import React, { useContext } from 'react';
import { View, Text, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../../src/context/AuthContext';
import { useTheme } from '../../../src/context/ThemeContext';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  // Use global theme context
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();               // Clear auth context
            router.replace('/login'); // Redirect to login screen
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className={isDark ? 'flex-1 bg-gray-900' : 'flex-1 bg-gray-100'}>
      <View className="flex-1 p-4">
        {/* Header */}
        <Text className={isDark ? 'text-2xl font-bold text-white mb-6' : 'text-2xl font-bold text-gray-800 mb-6'}>
          Settings
        </Text>

        {/* Profile Section */}
        <View className={isDark ? 'bg-gray-800 rounded-2xl shadow p-4 mb-6' : 'bg-white rounded-2xl shadow p-4 mb-6'}>
          <Text className={isDark ? 'text-gray-300 text-sm' : 'text-gray-500 text-sm'}>Logged in as</Text>
          <Text className={isDark ? 'text-white font-bold text-lg mt-1' : 'text-gray-800 font-bold text-lg mt-1'}>
            {user?.full_name ?? 'User'}
          </Text>
        </View>

        {/* Theme Toggle */}
        <View className={isDark ? 'flex-row justify-between items-center bg-gray-800 rounded-2xl shadow p-4 mb-6' : 'flex-row justify-between items-center bg-white rounded-2xl shadow p-4 mb-6'}>
          <Text className={isDark ? 'text-white font-semibold' : 'text-gray-800 font-semibold'}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>

        {/* Change Password Button */}
        <Pressable
          className="bg-blue-500 rounded-xl p-4 mb-4 items-center"
          onPress={() => console.log('Navigate to Change Password screen')}
        >
          <Text className="text-white font-bold text-lg">Change Password</Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable
          className="bg-red-500 rounded-xl p-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-bold text-lg">Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
