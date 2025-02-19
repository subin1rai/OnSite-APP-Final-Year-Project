import apiHandler from "@/context/ApiHandler";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import UsersChat from "@/Components/UsersChat";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.get("/chat/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      setUsers(response.data.users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <SafeAreaView className="mx-4">
      <View>
        {/* <Text className="text-center font-semibold text-[15px]">Users</Text> */}
      </View>
      <FlatList
        data={users}
        renderItem={({ item }) => <UsersChat item={item} key={item?.id} />}
      />
    </SafeAreaView>
  );
};

export default UsersScreen;
