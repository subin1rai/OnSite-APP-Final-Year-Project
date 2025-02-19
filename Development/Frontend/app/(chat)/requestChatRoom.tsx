import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform
} from "react-native";
import useChatStore from "@/store/chatStore";
import * as SecureStore from "expo-secure-store";
import { ScrollView } from "react-native-gesture-handler";
import { Entypo } from "@expo/vector-icons";
import apiHandler from "@/context/ApiHandler";

const RequestChatRoom = () => {
  const { selectedChat } = useChatStore();
  const [message, setMessage] = useState("");

  if (!selectedChat) {
    return (
      <View className="p-5">
        <Text className="text-lg font-bold">No Chat Selected</Text>
      </View>
    );
  }

  const sendMessage = async () => {
    const token = await SecureStore.getItemAsync("AccessToken");
    try {
      console.log(selectedChat.id);
      const userData = {
        receiverId: selectedChat.id,
        message: message
      };
      const response = await apiHandler.post("/chat/sendRequest", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setMessage("");
        Alert.alert("Your request has been sent!", "Wait for the user to accept your request.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 ">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70} // Adjust if needed
        >
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <Text>{selectedChat.id}</Text>
            {/* Chat messages can be displayed here */}
          </ScrollView>

          {/* Message typing section */}
          <View
            className="bg-white flex-row items-center px-3 py-3 gap-4"
            style={{
              borderTopWidth: 1,
              borderTopColor: "#dddddd",
            }}
          >
            <Entypo name="emoji-happy" size={24} color="gray" />
            <TextInput
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor={"gray"}
              className="flex-1 h-10 px-3"
              style={{
                borderWidth: 1,
                borderColor: "#dddddd",
                borderRadius: 20,
              }}
            />
            <TouchableOpacity className="bg-[#FCAC29] px-3 py-2 rounded-full" onPress={sendMessage}>
              <Text className="text-center text-sm font-semibold text-white">
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default RequestChatRoom;
