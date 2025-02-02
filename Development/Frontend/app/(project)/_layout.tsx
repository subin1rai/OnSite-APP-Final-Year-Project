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
      {/* Set StatusBar globally */}
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

      {/* Define Stack Navigator */}
      <Stack>
        {/* Customize header for the Create Project screen */}
        <Stack.Screen
          name="create_project"
          options={{
            title: "Create Project",
            headerStyle: {
              backgroundColor: "#FDB541", // Header background color
            },
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "semibold",
              color: "#fff", // Title text color
            },
            headerTintColor: "#fff", // Back button color
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()} // Navigates back
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>

      <Toast />
    </>
  );
};

export default Layout;
