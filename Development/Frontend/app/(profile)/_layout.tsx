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
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

      <Stack>
        <Stack.Screen  name="editProfile" />
       <Stack.Screen
                name="FAQs"
                options={{
                    title: "FAQs",
                  
                  headerTitleStyle: { fontSize: 20, fontWeight: "semibold", color: "black" },
                  headerTintColor: "#fff",
                  headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                      <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                  ),
                }}
              />
       <Stack.Screen
                name="beBuilder"
                options={{
                    title: "Become a Builder",
                  
                  headerTitleStyle: { fontSize: 18, fontWeight: "semibold", color: "black" },
                  headerTintColor: "#fff",
                  headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                      <Ionicons name="arrow-back" size={24} color="black" />
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
