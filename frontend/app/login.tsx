import { Ionicons } from '@expo/vector-icons';
import { Stack, Link, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../src/context/AuthContext';

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setUsernameError('');
    setPasswordError('');

    if (!phoneNumber.trim()) {
      setUsernameError('Phone number is required');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    try {
      setLoading(true);

      // 🔐 Token-based login via AuthContext
      await login(phoneNumber, password);

      // ✅ Token + user are now stored
      router.replace('/pages/(tabs)/home');
    } catch (err: any) {
      console.log('Login error:', err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please try again.';

      setPasswordError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center p-4">
          <Stack.Screen options={{ headerShown: false }} />

          <View style={{ width: '85%' }} className="bottom-10">
            <Text className="font-semibold mb-20" style={{ fontSize: 48 }}>
              Log in
            </Text>

            {/* Phone Number */}
            <TextInput
              keyboardType="phone-pad"
              label="Phone number"
              value={phoneNumber}
              onChangeText={text => {
                setPhoneNumber(text);
                if (usernameError) setUsernameError('');
              }}
              activeUnderlineColor="black"
              underlineColor="black"
              className="p-5 text-m mb-4"
              style={{ backgroundColor: 'transparent' }}
            />

            {usernameError ? (
              <Text style={{ color: 'red', marginTop: -32 }}>
                {usernameError}
              </Text>
            ) : null}

            {/* Password */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                label="Password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                activeUnderlineColor="black"
                underlineColor="black"
                className="p-5 text-m mb-4"
                style={{ flex: 1, backgroundColor: 'transparent' }}
              />

              <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                <Ionicons
                  style={{
                    position: 'absolute',
                    right: 16,
                    transform: [{ translateY: -6 }],
                  }}
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>

            {passwordError ? (
              <Text style={{ color: 'red', marginTop: 0 }}>
                {passwordError}
              </Text>
            ) : null}

            {/* Forgot Password */}
            <View className="items-end mt-8">
              <Link href="/pwdforgot" className="font-semibold">
                Forgot Password?
              </Link>
            </View>
          </View>

          {/* Login Button */}
          <View style={{ width: '85%' }} className="mt-8 bottom-10">
            <TouchableOpacity
              disabled={loading}
              className="bg-black p-6"
              style={{ borderRadius: 32, opacity: loading ? 0.7 : 1 }}
              onPress={handleLogin}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-white text-2xl font-semibold">
                  Log in
                </Text>
              )}
            </TouchableOpacity>

            {/* Signup */}
            <Text className="text-lg text-gray-500 mt-6 text-center">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-black font-semibold">
                Sign Up
              </Link>
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default LoginScreen;
