import React from "react";
import { Stack } from "expo-router";
import { StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useRouter } from "expo-router";
import "../../global.css";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Layout = () => {
  const router = useRouter();

  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Stack>
        <Stack.Screen name="budget" options={{ headerShown: false }} />
        <Stack.Screen name="paymentIn"  options={{
                    title: "Payment In",
                    headerStyle: {
                      backgroundColor: "#FDB541", 
                    },
                    headerTitleStyle: {
                      fontSize: 17,
                      fontWeight: "medium",
                      color: "white", 
                    },
                    headerTintColor: "#fff",
                    headerLeft: () => (
                      <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginLeft: 12 }}
                      >
                        <Ionicons name="arrow-back" size={24} color="white" />
                      </TouchableOpacity>
                    ),
                  }} />
        <Stack.Screen name="paymentOut"  options={{
                    title: "Payment Out",
                    headerStyle: {
                      backgroundColor: "#FDB541", 
                    },
                    headerTitleStyle: {
                      fontSize: 17,
                      fontWeight: "medium",
                      color: "white", 
                    },
                    headerTintColor: "#fff",
                    headerLeft: () => (
                      <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginLeft: 12 }}
                      >
                        <Ionicons name="arrow-back" size={24} color="white" />
                      </TouchableOpacity>
                    ),
                  }} />
      </Stack>
      <Toast />
    </GestureHandlerRootView>

  );
};

export default Layout;
