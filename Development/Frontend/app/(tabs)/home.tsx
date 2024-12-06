import { SafeAreaView, StatusBar, Text, View } from "react-native";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";


const Home = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync("AccessToken");
        setToken(accessToken);
      } catch (error) {
        console.error("Error getting token:", error);
      }
    };

    getToken();
  }, []);
  const handleLogout = async () => {
    const removeToken = await SecureStore.deleteItemAsync("AccessToken");
    console.log(removeToken);
    setToken(null);
    router.replace("../../(auth)/welcome");
  }
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center">
        <Text>Access Token: {token}</Text>
      </View>
      <CustomButton
        title="Logout"
        onPress={handleLogout}
      />
    </SafeAreaView>
  );
};

export default Home;
