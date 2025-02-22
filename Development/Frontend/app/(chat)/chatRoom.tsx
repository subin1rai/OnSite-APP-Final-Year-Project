import React, { useState, useEffect, useRef } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Alert,
  Text,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import apiHandler from "@/context/ApiHandler";
import { useSocketContext } from "@/socketContext";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { Socket } from "socket.io-client";
import { icons, images } from "@/constants";

interface DecodedToken {
  userId: string;
}

interface MessageType {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
}

const ChatRoom: React.FC = () => {
  const { receiver_id, username } = useLocalSearchParams<{
    receiver_id: string;
    username: string;
  }>();

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const { socket } = useSocketContext() as SocketContextType;
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  // ✅ Auto-Scroll Fix: Reference for ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch and store User ID when component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await SecureStore.getItemAsync("AccessToken");
        if (token) {
          const decoded: DecodedToken = jwtDecode(token);
          setMyUserId(decoded.userId);
        } else {
          console.error("No access token found");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: MessageType) => {
      newMessage.timestamp = new Date().toISOString();
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    fetchMessages();
  }, [receiver_id]);

  const fetchMessages = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (!token) return console.error("No access token found");

      const response = await apiHandler.post(
        `/chat/getMessage`,
        { receiverId: receiver_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const formattedMessages = response.data.data.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
      }));

      setMessages(formattedMessages);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    if (!socket || !isConnected) {
      Alert.alert("Connection Error", "Chat connection is not available. Please try again later.");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (!token) return;

      const userId = myUserId;
      if (!userId) {
        Alert.alert("Error", "Unable to verify your identity. Please log in again.");
        return;
      }

      const newMessage: MessageType = {
        senderId: userId,
        receiverId: receiver_id,
        message: message,
        timestamp: new Date().toISOString(),
      };

      await apiHandler.post("/chat/sendMessage", newMessage, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      socket.emit("sendMessage", newMessage);

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please check your connection and try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
        >
          <ScrollView
            ref={scrollViewRef} 
            keyboardShouldPersistTaps="handled"
            className="flex-1 px-3 py-2"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          >
            {messages.map((item, index) => {
              const isSender = item.senderId === myUserId;
              return (
                <View key={index} className={`flex-row my-1 ${isSender ? "justify-end" : "justify-start"}`}>
                  <View className={`max-w-[75%] px-4 py-2 rounded-lg ${isSender ? "bg-yellow-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>
                    <Text className="text-lg">{item.message}</Text>
                    <Text className={`text-xs mt-1 ${isSender ? "text-yellow-300" : "text-gray-600"} self-end`}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Message Input Section */}
          <View className="bg-white flex-row items-center px-3 py-3 gap-4 border-t border-gray-300 mt-4">
            <Entypo name="emoji-happy" size={24} color="gray" />
            <TextInput
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="gray"
              className="flex-1 h-10 px-3 border border-gray-300 rounded-full"
            />
            <TouchableOpacity className="py-2 rounded-full" onPress={sendMessage} disabled={!isConnected || !socket}>
              <Image source={icons.plane} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ChatRoom;
