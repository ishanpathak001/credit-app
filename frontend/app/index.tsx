import { Ionicons } from '@expo/vector-icons';
import { Stack, Link } from 'expo-router';
import React, { useState } from 'react';
import { TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View, Pressable, } from 'react-native';
import { TextInput } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {


  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className='flex-1 bg-white'>


      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <View className='flex-1 justify-center items-center p-4'>

          {/* Removing header */}
          <Stack.Screen options={{ headerShown: false }} />

          <View style={{ width: '85%' }} className='bottom-10' >

            {/* Text 1 */}
            <Text className='font-semibold  mb-20' style={{ fontSize: 48 }}>
              Log in
            </Text>


            {/* This TextInput is for entering a phone number */}

            <TextInput
              keyboardType="phone-pad"
              label="Phone number"
              activeUnderlineColor="black"
              underlineColor="black"
              className='p-5 text-m mb-4'
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                borderColor: 'gray',
                marginBottom: 48
              }}

            />

            {/* This TextInput is for entering a password */}

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                label="Password"
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                activeUnderlineColor="black"
                underlineColor="black"
                className='p-5 text-m mb-4'
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: 'transparent',
                  borderColor: 'gray'
                }}
              />

              {/* TouchableOpacity for showing/hiding password */}
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  style={{
                    position: 'absolute',
                    right: 16,
                    transform: [{ translateY: -6 }],
                  }}
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>

            </View>

            {/* Forgot Password Text */}
            <View className='items-end  mt-8'>
              <Link href="/tabs/pwdforgot" className='font-semibold '>
                Forgot Password?
              </Link>

            </View>



          </View>

          {/* TouchableOpacity for the log-in button */}
          <View style={{ width: '85%' }} className='mt-8 bottom-10'>


            <TouchableOpacity
              className='bg-black p-6 '
              style={{
                width: '100%',
                alignSelf: 'center',
                borderRadius: 32
              }}
            >

              <Text className='text-center text-white text-2xl font-semibold'>
                Log in
              </Text>
            </TouchableOpacity>


            {/* Sign Up button */}
            <Text className='text-lg text-gray-500 mt-6 text-center' >
              Don't have an account?{' '}

              <Link href="/tabs/signup" className='text-black font-semibold' >

                Sign Up

              </Link>


            </Text>
          </View>

        </View>
      </TouchableWithoutFeedback>

    </SafeAreaView>
  )
}