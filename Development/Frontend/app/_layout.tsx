import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { StatusBar, Text, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import AuthService from "@/context/AuthContext";
import { SocketProvider } from "@/socketContext";
import { jwtDecode } from "jwt-decode";
import { initializationNotification } from "@/context/notifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [fontsLoaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);


  const checkAuthStatus = async () => {
    try {
      initializationNotification();
      const token = await AuthService.getToken();
      const isExpired = await AuthService.isTokenExpired();
      
      if (!token || isExpired) {
        await AuthService.removeToken();
        setIsAuthenticated(false);
        setTimeout(() => {
          router.replace("/(auth)/sign_in");
        }, 0);
        return;
      }
      
      const decoded: any = jwtDecode(token);
      const role = decoded?.role;
      const userId = decoded?.userId;

      setIsAuthenticated(true);
      if (role === "client") {
        setTimeout(() => {
          router.replace("/(client)/clientHome");
        }, 0);
      }
    } catch (error) {
      await AuthService.removeToken();
      setIsAuthenticated(false);
      setTimeout(() => {
        router.replace("/(auth)/sign_in");
      }, 0);
    }
  };
  
  useEffect(() => {
    setTimeout(() => {
      checkAuthStatus();
    }, 0);
  }, []);

  if (!fontsLoaded || isAuthenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SocketProvider>
      <>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="black"
          translucent={false}
        />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(project)" options={{ headerShown: false }} />
          <Stack.Screen name="(worker)" options={{ headerShown: false }} />
          <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
          <Stack.Screen name="(attendance)" options={{ headerShown: false }} />
          <Stack.Screen name="(expenses)" options={{ headerShown: false }} />
          <Stack.Screen name="(threeDmodel)" options={{ headerShown: false }} />
          <Stack.Screen name="(chat)" options={{ headerShown: false }} />
          <Stack.Screen name="(profile)" options={{ headerShown: false }} />
          <Stack.Screen name="(files)" options={{ headerShown: false }} />
          <Stack.Screen name="(report)" options={{ headerShown: false }} />
          <Stack.Screen name="(Mulyankan)" options={{ headerShown: false }} />
          <Stack.Screen name="(notification)" options={{ headerShown: false }} />
          <Stack.Screen name="(client)" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </>
    </SocketProvider>
  );
}
