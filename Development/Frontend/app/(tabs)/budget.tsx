import { SafeAreaView, StatusBar, Text, View } from "react-native";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";


const Budget = () => {

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center">
      <Text>Budget</Text>
      </View>
    </SafeAreaView>
  );
};

export default Budget;
