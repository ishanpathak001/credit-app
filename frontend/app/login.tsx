import { Ionicons } from '@expo/vector-icons';
import { Stack, Link, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { TouchableWithoutFeedback, Keyboard, Text, TouchableOpacity, View, Alert } from 'react-native';
import { TextInput } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/api';
import { GestureResponderEvent } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';




const LoginScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) =>  {

  const { login } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  
  
  
  
  
  
  // const {login} = useContext(AuthContext);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const router = useRouter();
  

  const handleLogin = async (e: GestureResponderEvent) => {
  //   e.preventDefault();
  //   setUsernameError('');
  //   setPasswordError('');
    
  //   if (!phoneNumber) {setUsernameError('Phone number is required'); return; }
  //   if (!password){ setPasswordError('Password is required'); return; }
    

  //   try {
  //     const res = await API.post("/users/login", {
  //       phone_number: phoneNumber,
  //       password: password
  //     });
  //     console.log("Response from backend:", res.data);
  //     if (res.data.status) {
  //       // await AsyncStorage.setItem("isLoggenIn", "true");
  //       //  //force navigation
        
  //       await login(res.data.user);
  //       router.replace("./(tabs)/home");
        
        
  //     } else {
  //       setPasswordError(res.data.message);
  //     }
  //   } catch (err: any) {
  //     console.log("Login error: ", err);
  //     if (err.response && err.response.data && err.response.data.message) {
  //       setPasswordError(err.response.data.message);
  //     } else {
  //       setPasswordError("Login failed. Please try again.");
  //     }
  //   }
  // };

    try {
      await login(phoneNumber, password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
       console.log("Login error: ", err);
       if (err.response && err.response.data && err.response.data.message) {
         setPasswordError(err.response.data.message);
       } else {
         setPasswordError("Login failed. Please try again.");
       }
     }
  };

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
              value={phoneNumber}
              onChangeText={(text) => {setPhoneNumber(text);
                if (usernameError) setUsernameError('');
              }}
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

            {/* Display error message if exists */}
            {usernameError ? <Text className='text-left' style={{ color: 'red', marginTop: -48  }}>{usernameError}</Text> : null}

            {/* This TextInput is for entering a password */}

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                label="Password"
                value={password}
                onChangeText={(text) => {(setPassword(text));
                  if(passwordError) setPasswordError('');
                }}
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

            {/* Display error message if exists */}
            {passwordError ? <Text className='text-left' style={{ color: 'red', marginTop: 0  }}>{passwordError}</Text> : null}


            {/* Forgot Password Text */}
            <View className='items-end  mt-8'>
              <Link href="/pwdforgot" className='font-semibold '>
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
              onPress={handleLogin}
            >

              <Text className='text-center text-white text-2xl font-semibold'>
                Log in
              </Text>
            </TouchableOpacity>

            

            {/* Sign Up button */}
            <Text className='text-lg text-gray-500 mt-6 text-center' >
              Don't have an account?{' '}

              <Link href="/signup" className='text-black font-semibold' >

                Sign Up

              </Link>


            </Text>
          </View>

        </View>
      </TouchableWithoutFeedback>

    </SafeAreaView>
  )
}

export default LoginScreen;