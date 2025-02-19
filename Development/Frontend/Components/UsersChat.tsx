import { images } from "@/constants";
import useChatStore from "@/store/chatStore";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersChatProps {
  item: User;
}

const UsersChat: React.FC<UsersChatProps> = ({ item }) => {
  const { setSelectedChat } = useChatStore();

  const handleChatPress = () => {
    setSelectedChat(item);
    router.push("../(chat)/requestChatRoom");
  };
  return (
    <View className="p-3 border-b border-gray-300">
      <View className="flex-row items-center gap-3">
        <TouchableOpacity>
          <Image
            source={images.imageProfile}
            className="w-[40px] h-[40px] rounded-full"
          />
        </TouchableOpacity>
        <View className="flex-1">
          <Text>{item?.username}</Text>
          <Text>{item?.email}</Text>
        </View>

        <TouchableOpacity
          className="p-2 w-[80px] bg-[#FCAC29] rounded-lg"
          onPress={handleChatPress}
        >
          <Text className="text-center text-white text-xl">Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UsersChat;
