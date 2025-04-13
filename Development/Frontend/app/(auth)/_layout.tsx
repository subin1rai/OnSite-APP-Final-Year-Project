import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "../../global.css";
import Toast from "react-native-toast-message";

const Layout = () => {
  return (
    <>
      {/* Set StatusBar globally */}
      <StatusBar
        barStyle="dark-content" 
        backgroundColor="white" 
        translucent={false} 
      />
      {/* Define Stack Navigator */}
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="sign_up" options={{ headerShown: false }} />
        <Stack.Screen name="sign_in" options={{ headerShown: false }} />
        <Stack.Screen name="forgetPassword" options={{ headerShown: false }} />
        <Stack.Screen name="otp" options={{ headerShown: false }} />
        <Stack.Screen name="changePassword" options={{ headerShown: false }} />
      </Stack>
<Toast />
    </>
  );
};

export default Layout;
