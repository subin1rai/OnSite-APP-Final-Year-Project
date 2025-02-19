import apiHandler from "@/context/ApiHandler";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as SecureStore from "expo-secure-store";

const AllRequest = () => {
  const [requests, setRequests] = useState("");

  const getRequests = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      const response = await apiHandler.get("/chat/getRequest",{
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
      });
      console.log(response);
      setRequests(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);
  
  return (
    <View>
      <Text>All request</Text>
    </View>
  );
};

export default AllRequest;
