import React from "react";
import { Stack } from "expo-router";
import { StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import back button icon
import { useRouter } from "expo-router";
import "../../global.css";
import Toast from "react-native-toast-message";

const Layout = () => {
  const router = useRouter();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

      <Stack>
        <Stack.Screen
          name="create_project"
          options={{
            title: "Create Project",
            headerStyle: {
              backgroundColor: "#FDB541", 
            },
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "semibold",
              color: "#fff", 
            },
            headerTintColor: "#fff",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()} 
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen  name="project_home" options={{ headerShown: false }}/>

      </Stack>

      <Toast />
    </>
  );
};

export default Layout;
