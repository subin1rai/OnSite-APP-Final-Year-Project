import React from "react";
import { Stack } from "expo-router";
import { StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import back button icon
import { useRouter } from "expo-router";
import "../../global.css";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Layout = () => {
  const router = useRouter();

  return (
        <GestureHandlerRootView className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <Stack>
        <Stack.Screen  name="housePricePrediction" options={{ 
            title: "Mulyankan",
            headerTitleStyle: { fontSize: 20, fontWeight: "semibold", color: "#fff" },
            headerStyle: { backgroundColor: "#FDB541" },
             headerLeft: () => (
                          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                          </TouchableOpacity>)
         }}/>
      </Stack>
      <Toast />
    </GestureHandlerRootView>

  );
};

export default Layout;
