import CustomButton from "@/Components/CustomButton";
import {
  Image,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import apiHandler from "@/context/ApiHandler";
import { icons, images } from "@/constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface User {
  id: number;
  email: string;
  image: string | null;
  username: string;
}

const Profile = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false); // Refreshing State

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

  const getUser = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (!token) return;

      const response = await apiHandler.get("/user/getUser", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  // **Pull-to-Refresh Functionality**
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getUser();
    } catch (error) {
      console.error("Error during refresh:", error);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getUser();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("AccessToken");
    setToken(null);
    router.replace("../../(auth)/sign_in");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FCAC29" />
        </View>
      ) : (
        <ScrollView
          className="mx-6 mt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FCA311" />
          }
        >
          {/* Profile Image */}
          <View className="flex-row items-center gap-4">
            {user?.image ?(
              <Image source={{ uri: user.image }} className="w-24 h-24 rounded-2xl" />
            ) : (
              <Image source={images.imageProfile} className="w-24 h-24 rounded-2xl" />
            )}

            {/* User Info */}
            <View>
              <Text className="text-2xl font-semibold mt-3">{user?.username || "User"}</Text>
              <Text className="text-gray-500">{user?.email || "No Email"}</Text>
            </View>
          </View>

          <View className="border-b border-gray-300 my-8" />

          {/* Edit Profile Button */}
          <TouchableOpacity
            className="flex-row items-center gap-4"
            onPress={() => router.push("/(profile)/editProfile")}
          >
            <View className="p-4 bg-blue-50 rounded-lg">
              <Image source={icons.person} className="w-6" />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-gray-600 ">Edit Profile</Text>
              <Ionicons name="chevron-forward" size={24} color={"gray"} />
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity className="flex-row items-center mt-4 gap-4">
            <View className="p-4 bg-blue-50 rounded-lg">
              <Ionicons name="settings" size={24} color={"black"} />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-gray-600 ">Settings</Text>
              <Ionicons name="chevron-forward" size={24} color={"gray"} />
            </View>
          </TouchableOpacity>

          {/* FAQs */}
          <TouchableOpacity className="flex-row items-center mt-4 gap-4" onPress={() => router.push("/(profile)/FAQs")}>
            <View className="p-4 bg-blue-50 rounded-lg">
              <Ionicons name="options" size={24} color={"black"} />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-gray-600 ">FAQs</Text>
              <Ionicons name="chevron-forward" size={24} color={"gray"} />
            </View>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity className="flex-row items-center mt-4 gap-4" onPress={handleLogout}>
            <View className="p-4 bg-blue-50 rounded-lg">
              <MaterialIcons name="logout" size={24} color={"red"} />
            </View>
            <View className="flex-1 flex-row items-center justify-between py-2">
              <Text className="text-lg font-medium text-gray-600 ">Log out</Text>
              <Ionicons name="chevron-forward" size={24} color={"gray"} />
            </View>
          </TouchableOpacity>

          {/* Support Message */}
          <View className="p-6 bg-[#FEEDCF] rounded-lg my-8 items-center gap-4">
            <Text className="text-lg font-medium text-[#FCAC29]">
              Feel Free to Ask, We are ready to Help
            </Text>
          </View>

          <View className="border-t border-gray-300 py-4 ">
            <Text className="text-center text-gray-500">Version 1.0.0</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Profile;
