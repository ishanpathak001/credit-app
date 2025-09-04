import { Ionicons } from '@expo/vector-icons';
import { Stack, } from 'expo-router';
import React, { useState } from 'react';
import { TouchableWithoutFeedback, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { TextInput } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';

const Signup = () => {

    const navigation = useNavigation();
    const [name, setName] = useState("");
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


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