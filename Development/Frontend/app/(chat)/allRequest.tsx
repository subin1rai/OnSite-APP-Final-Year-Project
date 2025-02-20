import apiHandler from "@/context/ApiHandler";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as SecureStore from "expo-secure-store";
import { images } from "@/constants";

interface User {
  id: number;
  email: string;
  role: string;
  username: string;
}

interface Request {
  id: number;
  fromId: number;
  message: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}

const AllRequest = () => {
  const [requests, setRequests] = useState<Request[]>([]); // Ensure type safety

  const getRequests = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.get("/chat/getRequest", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(response.data);

      // Ensure that we correctly extract the `requests` array
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  return (
    <View>
      {requests.length > 0 ? (
        requests.map((item) => (
          <View key={item.id} className="flex-row items-center bg-white rounded-lg p-4 mx-4 mt-3">
          {/* Profile Image */}
          <TouchableOpacity>
            <Image source={images.imageProfile} className="w-12 h-12 rounded-full" />
          </TouchableOpacity>
    
          {/* User Info */}
          <View className="flex-1 ml-4">
            <Text className="text-base font-medium text-gray-800">{item.user.username}</Text>
            <Text className="text-sm text-gray-600">{item.message}</Text>
          </View>
    
          {/* Accept & Reject Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-md">
              <Text className="text-white">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 rounded-md" style={{ borderWidth: 1, borderColor: "red" }}>
              <Text className="text-red-500">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
        ))
      ) : (
        <Text>No requests yet</Text>
      )}
    </View>
  );
};

export default AllRequest;
