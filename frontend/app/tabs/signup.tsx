import { Ionicons } from '@expo/vector-icons';
import { Stack, } from 'expo-router';
import React, { useState } from 'react';
import { TouchableWithoutFeedback, Keyboard, Text, TouchableOpacity, View, GestureResponderEvent, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { TextInput } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../api';

const SignupScreen = () => {

    const navigation = useNavigation();
    const [fullName, setfullName] = useState<string>('');
    const [phoneNumber, setphoneNumber] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>('');
    const [fullnameError, setFullnameError] = useState<string>('');
    const [usernameError, setUsernameError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const handleSignup = async (e: GestureResponderEvent) => {
        e.preventDefault();
        setFullnameError('');
        setUsernameError('');
        setPasswordError('');
        let valid = true;
        if (!fullName) setFullnameError('Full name is required'), valid = false;
        if (!phoneNumber) setUsernameError('Phone number is required'), valid = false;
        if (!password) setPasswordError('Password is required'), valid = false;
        if (!valid) return;

        try {
            const res = await API.post('/signup', {
                full_name: fullName,
                phone_number: phoneNumber,
                password: password
            });
            if (res.data.success) {
                Alert.alert(
                    "Success",
                    res.data.message,
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            }
            else {
                Alert.alert(res.data.message);
            }
        } catch (err: any) {
            console.log("signup error:", err);

            if (err.response && err.response.data && err.response.data.message) {
                Alert.alert(err.response.data.message);
            } else {
                Alert.alert("Error", "Signup failed. Please try again.");
            }
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
                                onChangeText={(text) => {
                                    setfullName(text);
                                    if (fullnameError) setFullnameError('');
                                }}
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

                            {/* Display error message if exists */}
                            {fullnameError ? <Text className='text-left' style={{ color: 'red', marginTop: -36 }}>{fullnameError}</Text> : null}


                            {/* TextInput for Phone Number */}
                            <TextInput
                                keyboardType="phone-pad"
                                label="Phone number"
                                value={phoneNumber}
                                onChangeText={(text) => {
                                    setphoneNumber(text);
                                    if (usernameError) setUsernameError('');
                                }}
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

                            {/* Display error message if exists */}
                            {usernameError ? <Text className='text-left' style={{ color: 'red', marginTop: -36 }}>{usernameError}</Text> : null}

                            {/* TextInput for New Password */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 48 }}>
                                <TextInput
                                    label="New Password"
                                    mode='flat'
                                    value={password}
                                    onChangeText={(text) => {
                                        (setPassword(text));
                                        if (passwordError) setPasswordError('');
                                    }}
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

                            {/* Display error message if exists */}
                            {passwordError ? <Text className='text-left' style={{ color: 'red', marginTop:-46, marginBottom:26}}>{passwordError}</Text> : null}



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


export default SignupScreen;