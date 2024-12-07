import { SafeAreaView, StatusBar, Text, View } from "react-native";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import { icons, images } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';


const Budget = () => {
  
  return (
    <SafeAreaView className="bg-[#ffb133]">
      <View className="bg-[#ffb133] h-[180px] w-full z-0 flex">
          <View className="flex justify-between flex-row px-8 pt-2">
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-2xl text-white font-semibold tracking-wider">Budget</Text>
          <Text>Profile</Text>
          </View>
          <BlurView 
          intensity={40} 
          className="z-100 bg-black w-[90%] h-[173px] justify-center pl-20 mt-5 m-auto rounded-lg " 
          style={{
            borderRadius: 30, // Apply border radius
            shadowColor: '#000', // Set shadow color
            shadowOffset: { width: 0, height: 5 }, // Set shadow offset
            shadowOpacity: 0.10, // Set shadow opacity
            shadowRadius: 3.5, // Set shadow radius
            elevation: 10, // Set elevation for Android
          }}
        > 
        </BlurView>
      </View>
    </SafeAreaView> 
  );
  
};

export default Budget;
