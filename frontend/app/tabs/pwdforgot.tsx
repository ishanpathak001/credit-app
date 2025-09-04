import { Ionicons } from '@expo/vector-icons';
import { Stack, Link } from 'expo-router';
import React, { useState } from 'react';
import { TouchableWithoutFeedback, Keyboard, Text, TouchableOpacity, View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { TextInput } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';


const PwdForgot = () => {

    const navigation = useNavigation();

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
                            <Text className='font-semibold  mb-20' style={{ fontSize: 48 }} >
                                Oops!
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            
        </SafeAreaView>
    );
}

export default PwdForgot;
