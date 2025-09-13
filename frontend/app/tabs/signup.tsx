import { Ionicons } from '@expo/vector-icons';
import { Stack, } from 'expo-router';
import React, { useState } from 'react';
import { TouchableWithoutFeedback, Keyboard, Text, TouchableOpacity, View, GestureResponderEvent } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { TextInput } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import API from '../api';

const Signup = () => {

    const navigation = useNavigation();
    const [fullName, setfullName] = useState<string>('');
    const [phoneNumber, setphoneNumber] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const[message, setMessage] = useState<string>('');

    const handleSignup = async (e: GestureResponderEvent) => {
        e.preventDefault();
        try {
            const res = await API.post('/signup', {
                full_namme: fullName,
                phone_number: phoneNumber,
                password
            });
            setMessage('User ${res.data.user.full_name} created successfully!');
        }catch (err: any) {
            setMessage(err?.response?.data?.message || 'Signup failed!');
        }
    };


    return (
        <SafeAreaView className='flex-1 bg-white'>
            

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className='flex-1 '>

                        {/* removing header */}
                        <Stack.Screen options={{ headerShown: false }} />        

                        {/* Back Arrow */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="p-4"
                        >
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>


                        <View className='flex-1 top-20 items-center p-4'   >

                            <View style={{ width: '85%' }}>

                                {/* Text 1 */}
                                <Text className='font-semibold  mb-20' style={{ fontSize: 48 }} >
                                    Sign Up
                                </Text>
                                {/* TextInput for Full Name */}
                                <TextInput
                                    keyboardType="default"
                                    label="Full Name"
                                    value={fullName}
                                    onChangeText={setfullName}
                                    activeUnderlineColor="black"
                                    underlineColor="black"
                                    className='p-5 text-m mb-4'
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                        borderColor: 'gray',
                                        marginBottom: 36
                                    }}

                                />



                                {/* TextInput for Phone Number */}
                                <TextInput
                                    keyboardType="phone-pad"
                                    label="Phone number"
                                    value={phoneNumber}
                                    onChangeText={setphoneNumber}
                                    activeUnderlineColor="black"
                                    underlineColor="black"
                                    className='p-5 text-m mb-4'
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                        borderColor: 'gray',
                                        marginBottom: 36
                                    }}

                                />



                                {/* TextInput for New Password */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 48 }}>
                                    <TextInput
                                        label="New Password"
                                        mode='flat'
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        activeUnderlineColor="black"
                                        underlineColor="black"
                                        className='p-5 text-m mb-4'
                                        style={{
                                            flex: 1,
                                            width: '100%',
                                            backgroundColor: 'transparent',
                                            borderColor: 'gray',

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





                            </View>

                            {/* sign in button */}
                            <View style={{ width: '85%' }} className='mt-8 bottom-6'>


                                <TouchableOpacity
                                    className='bg-black p-6 '
                                    style={{
                                        width: '100%',
                                        alignSelf: 'center',
                                        borderRadius: 32
                                    }}
                                    onPress={handleSignup}
                                >
                                    <Text className='text-center text-white text-2xl font-semibold'>
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>

                            </View>

                        </View>


                    </View>
                </TouchableWithoutFeedback>
            
        </SafeAreaView>
    );
}


export default Signup;