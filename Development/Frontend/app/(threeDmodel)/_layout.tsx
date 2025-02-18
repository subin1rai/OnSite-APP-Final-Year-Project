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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />
      <Stack>
        <Stack.Screen
          name="mainModel"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="viewModel"
          options={{
            headerTransparent: true,
            headerTitle: "",
            headerTintColor: "#000",
            headerBackTitle: "",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
      <Toast />
    </GestureHandlerRootView>
  );
};

export default Layout;
