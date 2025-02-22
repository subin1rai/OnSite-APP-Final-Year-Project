import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import "../../global.css";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useChatStore from "@/store/chatStore";

const Layout = () => {
  const router = useRouter();
  const { selectedChat } = useChatStore();
  const params = useLocalSearchParams();

  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <Stack>
        <Stack.Screen name="usersScreen" options={{ title: "Users" }} />
        <Stack.Screen
          name="requestChatRoom"
          options={{
            title: selectedChat?.username || "Chat",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="allRequest"
          options={{
            title: "Request",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="chatRoom"
          options={{
            title: Array.isArray(params.username) ? params.username[0] : params.username || "Chat Room", 
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
